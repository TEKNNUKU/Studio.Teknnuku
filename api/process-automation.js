const { getAdminApp } = require('./_firebaseAdminEmail.js');
const { findOrCreateAutomations, processDueAutomations } = require('../automation/engine.js');

module.exports = async (req, res) => {
  // Vercel Cron sends a GET request. Also allow manual triggering (e.g. the
  // "Run Now" button in the admin panel's Communications tab) via POST with
  // a shared secret, for testing without waiting for the schedule.
  const isCron = req.headers['user-agent']?.includes('vercel-cron');
  const providedSecret = req.headers['x-automation-secret'] || req.query.secret;
  if (!isCron && providedSecret !== process.env.AUTOMATION_TRIGGER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — pass ?secret=YOUR_AUTOMATION_TRIGGER_SECRET or the x-automation-secret header' });
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
