const { getAdminApp } = require('./_firebaseAdminEmail.js');
const { ensureAutomationForDoc, processOneAutomation } = require('../automation/engine.js');
const { SEQUENCES } = require('../automation/sequences.js');

// Called by the forms themselves right after they write to Firestore —
// this is what makes the very first confirmation + internal alert instant
// instead of waiting for the once-daily cron sweep. Steps 3-6 (the day
// 1/3/5/7 follow-ups) still get picked up by the cron as normal — only
// steps 1-2 fire from here, since those are the only ones time-sensitive
// enough to matter within minutes rather than within a day.
//
// Deliberately does NOT trust any name/email/content the client sends —
// only `collection` and `docId` are used, and the actual email content is
// always read fresh from Firestore server-side. This means a malicious
// caller can at most trigger a real, already-submitted record's own
// confirmation email a second time (harmless — it's idempotent), never
// forge arbitrary email content or send to an arbitrary address.
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { collection, docId } = req.body || {};
  if (!collection || !docId) {
    return res.status(400).json({ error: 'Missing collection or docId' });
  }
  if (!SEQUENCES[collection]) {
    return res.status(400).json({ error: 'Unknown collection' });
  }

  try {
    const admin = getAdminApp();
    const db = admin.firestore();

    const { ref } = await ensureAutomationForDoc(db, collection, docId);
    if (!ref) {
      // Most likely the doc has no email field, or doesn't exist yet due
      // to read-after-write lag — the daily cron will pick it up later
      // regardless, so this isn't a hard failure from the form's point of view.
      return res.status(200).json({ ok: true, sent: false, reason: 'no automation record (missing email or doc not found yet)' });
    }

    const autoDocSnap = await ref.get();
    const { sent, failed } = await processOneAutomation(db, autoDocSnap);

    return res.status(200).json({ ok: true, sent, failed });
  } catch (err) {
    console.error('send-confirmation error:', err);
    // Still 200 — this is a best-effort instant path called fire-and-forget
    // from the browser; the form's own success message must never depend
    // on this succeeding, and the daily cron is the guaranteed fallback.
    return res.status(200).json({ ok: false, error: err.message });
  }
};
