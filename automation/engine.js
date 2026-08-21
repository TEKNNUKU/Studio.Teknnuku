const { sendEmail, senders } = require('../email/mailer.js');
const { SEQUENCES } = require('./sequences.js');

const IGNORED_FIELDS = ['createdAt', 'updatedAt', 'status', 'id'];

function fieldLabel(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
}

function toDate(v) {
  if (!v) return null;
  if (v.toDate) return v.toDate(); // Firestore Timestamp
  if (v.seconds) return new Date(v.seconds * 1000);
  return new Date(v);
}

// Creates the automations/{id} tracking record for one specific source
// document, if one doesn't already exist. Returns { ref, isNew } — safe to
// call more than once for the same submission (e.g. if both the instant
// trigger and a cron pass race to create it) since it's idempotent.
async function ensureAutomationForDoc(db, collectionName, docId) {
  const seq = SEQUENCES[collectionName];
  if (!seq) return { ref: null, isNew: false };

  const existing = await db.collection('automations')
    .where('sourceCollection', '==', collectionName)
    .where('sourceDocId', '==', docId)
    .limit(1).get();
  if (!existing.empty) return { ref: existing.docs[0].ref, isNew: false };

  const sourceSnap = await db.collection(collectionName).doc(docId).get();
  if (!sourceSnap.exists) return { ref: null, isNew: false };
  const data = sourceSnap.data();
  const email = data[seq.emailField];
  if (!email) return { ref: null, isNew: false }; // can't email someone with no email on file

  const createdAt = toDate(data.createdAt) || new Date();
  const ref = await db.collection('automations').add({
    sourceCollection: collectionName,
    sourceDocId: docId,
    formType: seq.formType,
    contactName: data[seq.nameField] || 'there',
    contactEmail: email,
    currentStep: 0,
    status: 'active',
    anchorAt: createdAt.toISOString(),
    nextRunAt: createdAt.toISOString(), // due immediately — step 1 has delayMinutes:0
    createdAt: new Date().toISOString()
  });
  return { ref, isNew: true };
}

// Scans all 5 source collections for recent submissions with no automation
// record yet, and creates one for each. Used by the daily cron sweep to
// catch anything the instant trigger missed (e.g. a submission during a
// brief outage, or a browser that closed before the instant call fired).
async function findOrCreateAutomations(db, lookbackLimit = 50) {
  let created = 0;
  for (const collectionName of Object.keys(SEQUENCES)) {
    const snap = await db.collection(collectionName).orderBy('createdAt', 'desc').limit(lookbackLimit).get();
    for (const doc of snap.docs) {
      const { isNew } = await ensureAutomationForDoc(db, collectionName, doc.id);
      if (isNew) created++;
    }
  }
  return created;
}

// Sends every step that's come due for ONE automation record (handles the
// simultaneous 0-minute customer+admin steps, and catches up cleanly across
// multiple due steps in one pass rather than one step per call), logs each
// attempt, and advances (or completes) the record. This is the one place
// that actually sends mail — both the cron sweep and the instant trigger
// call this same function so their behavior can never diverge.
async function processOneAutomation(db, autoDocSnap) {
  const automation = autoDocSnap.data();
  const seq = SEQUENCES[automation.sourceCollection];
  if (!seq) return { sent: 0, failed: 0 };

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
  const now = new Date();
  let step = automation.currentStep;
  let advanced = false;
  let sent = 0, failed = 0;

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
        automationId: autoDocSnap.id,
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
        automationId: autoDocSnap.id,
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
    await autoDocSnap.ref.update(update);
  }

  return { sent, failed };
}

// Processes every automation that's currently due — the daily cron's main job.
async function processDueAutomations(db) {
  const now = new Date();
  const snap = await db.collection('automations')
    .where('status', '==', 'active')
    .where('nextRunAt', '<=', now.toISOString())
    .get();

  let sent = 0, failed = 0;
  for (const autoDoc of snap.docs) {
    const result = await processOneAutomation(db, autoDoc);
    sent += result.sent;
    failed += result.failed;
  }
  return { sent, failed };
}

module.exports = { ensureAutomationForDoc, findOrCreateAutomations, processOneAutomation, processDueAutomations };
