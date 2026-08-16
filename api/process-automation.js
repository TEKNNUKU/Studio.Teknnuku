const { getAdminApp } = require('./_firebaseAdminEmail.js');
const { sendEmail, senders } = require('../email/mailer.js');
const { SEQUENCES } = require('../automation/sequences.js');

const LOOKBACK_LIMIT = 50; // how many recent docs per source collection to check for "is this new?" each run
const IGNORED_FIELDS = ['createdAt', 'updatedAt', 'status', 'id']; // don't dump these into the admin notification table

function fieldLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
}

function toDate(v) {
  if (!v) return null;
  if (v.toDate) return v.toDate(); // Firestore Timestamp
  if (v.seconds) return new Date(v.seconds * 1000);
  return new Date(v);
}

async function findOrCreateAutomations(db) {
  let created = 0;
  for (const [collectionName, seq] of Object.entries(SEQUENCES)) {
    const snap = await db.collection(collectionName).orderBy('createdAt', 'desc').limit(LOOKBACK_LIMIT).get();
    for (const doc of snap.docs) {
      const data = doc.data();
      const email = data[seq.emailField];
      if (!email) continue; // can't email someone with no email on file

      const existing = await db.collection('automations')
        .where('sourceCollection', '==', collectionName)
        .where('sourceDocId', '==', doc.id)
        .limit(1).get();
      if (!existing.empty) continue; // already tracked

      const createdAt = toDate(data.createdAt) || new Date();
      await db.collection('automations').add({
        sourceCollection: collectionName,
        sourceDocId: doc.id,
        formType: seq.formType,
        contactName: data[seq.nameField] || 'there',
        contactEmail: email,
        currentStep: 0,
        status: 'active',
        anchorAt: createdAt.toISOString(),
        nextRunAt: createdAt.toISOString(), // due immediately — step 1 has delayMinutes:0
        createdAt: new Date().toISOString()
      });
      created++;
    }
  }
  return created;
}

async function processDueAutomations(db) {
  const now = new Date();
  const snap = await db.collection('automations').where('status', '==', 'active').where('nextRunAt', '<=', now.toISOString()).get();

  let sent = 0, failed = 0;
  for (const autoDoc of snap.docs) {
    const automation = autoDoc.data();
    const seq = SEQUENCES[automation.sourceCollection];
    if (!seq) continue;

    // Pull the original source document fresh, so email content always
    // reflects the latest data even if it changed since submission.
    const sourceSnap = await db.collection(automation.sourceCollection).doc(automation.sourceDocId).get();
    const sourceData = sourceSnap.exists ? sourceSnap.data() : {};

    const templateData = {
      ...sourceData,
      name: automation.contactName,
      link: `${process.env.SITE_URL || ''}/`,
      consultationLink: `${process.env.SITE_URL || ''}/#consultation`,
      diagnosticLink: `${process.env.SITE_URL || ''}/#diagnostic`,
      adminUrl: `${process.env.ADMIN_URL || ''}/#crm`,
      fields: Object.entries(sourceData)
        .filter(([k]) => !IGNORED_FIELDS.includes(k))
        .map(([k, v]) => ({ label: fieldLabel(k), value: typeof v === 'object' ? JSON.stringify(v) : v }))
    };

    const anchor = new Date(automation.anchorAt);
    let step = automation.currentStep;
    let advanced = false;

    // Send every step that's come due since the last run (handles the
    // simultaneous 0-minute customer+admin steps, and catches up cleanly
    // if the cron was ever delayed) rather than just one step per pass.
    while (true) {
      const nextStepDef = seq.steps.find(s => s.step === step + 1);
      if (!nextStepDef) break;
      const dueAt = new Date(anchor.getTime() + nextStepDef.delayMinutes * 60000);
      if (dueAt > now) break;

      try {
        const html = nextStepDef.template(templateData);
        const subject = nextStepDef.subject(templateData);
        const to = nextStepDef.audience === 'admin'
          ? (process.env.ADMIN_NOTIFY_EMAIL || senders.general)
          : automation.contactEmail;

        await sendEmail({ to, subject, html });

        await db.collection('emailLogs').add({
          automationId: autoDoc.id,
          sourceCollection: automation.sourceCollection,
          sourceDocId: automation.sourceDocId,
          recipient: to,
          subject,
          template: `${seq.formType}.step${nextStepDef.step}`,
          sequenceStep: nextStepDef.step,
          audience: nextStepDef.audience,
          status: 'sent',
          provider: 'zoho-smtp',
          sentAt: new Date().toISOString()
        });
        sent++;
      } catch (err) {
        await db.collection('emailLogs').add({
          automationId: autoDoc.id,
          sourceCollection: automation.sourceCollection,
          sourceDocId: automation.sourceDocId,
          recipient: automation.contactEmail,
          template: `${seq.formType}.step${nextStepDef.step}`,
          sequenceStep: nextStepDef.step,
          status: 'failed',
          error: err.message,
          sentAt: new Date().toISOString()
        });
        failed++;
        break; // stop advancing this automation on failure — don't skip a step silently
      }

      step = nextStepDef.step;
      advanced = true;
    }

    if (advanced) {
      const followingStep = seq.steps.find(s => s.step === step + 1);
      const update = { currentStep: step };
      if (followingStep) {
        update.nextRunAt = new Date(anchor.getTime() + followingStep.delayMinutes * 60000).toISOString();
      } else {
        update.status = 'completed';
        update.completedAt = new Date().toISOString();
      }
      await autoDoc.ref.update(update);
    }
  }
  return { sent, failed };
}

module.exports = async (req, res) => {
  // Vercel Cron sends a GET request. Also allow manual triggering (e.g. a
  // "Run Now" button in the admin panel) via POST with a shared secret,
  // for testing without waiting for the schedule.
  const isCron = req.headers['user-agent']?.includes('vercel-cron');
  const providedSecret = req.headers['x-automation-secret'];
  if (!isCron && providedSecret !== process.env.AUTOMATION_TRIGGER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const admin = getAdminApp();
    const db = admin.firestore();

    const createdCount = await findOrCreateAutomations(db);
    const { sent, failed } = await processDueAutomations(db);

    return res.status(200).json({ ok: true, newAutomations: createdCount, emailsSent: sent, emailsFailed: failed });
  } catch (err) {
    console.error('process-automation error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
