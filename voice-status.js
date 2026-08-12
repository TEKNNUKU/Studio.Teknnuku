// ═══════════════════════════════════════════════════════════════
//  /api/voice-status
//
//  Twilio POSTs here automatically (see the statusCallback params set
//  in voice-webhook.js) as a call progresses: initiated → ringing →
//  answered → completed. This is what makes call records reliable
//  even if an agent's browser tab crashes or closes mid-call — the
//  browser-side event handlers in admin.html update Firestore too,
//  but this is the source of truth that doesn't depend on the tab
//  staying open.
//
//  We match the incoming update to the right Firestore doc by
//  CallSid, which admin.html stores on the call doc as soon as the
//  browser knows it (see the call.on('accept', ...) handler).
// ═══════════════════════════════════════════════════════════════

const { getAdminApp } = require('./_firebaseAdmin');

const STATUS_MAP = {
  'queued':      'initiated',
  'initiated':   'initiated',
  'ringing':     'ringing',
  'in-progress': 'in-progress',
  'completed':   'completed',
  'busy':        'busy',
  'no-answer':   'no-answer',
  'canceled':    'failed',
  'failed':      'failed'
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).send('Method not allowed');

  try {
    const admin = getAdminApp();
    const db = admin.firestore();

    const callSid = req.body.CallSid || req.body.ParentCallSid;
    const twilioStatus = req.body.CallStatus || req.body.DialCallStatus;
    const duration = req.body.CallDuration || req.body.DialCallDuration;
    const recordingUrl = req.body.RecordingUrl;

    if (!callSid) {
      // Twilio sometimes fires early callbacks before a CallSid is
      // assigned yet — nothing to reconcile, just acknowledge.
      return res.status(200).send('ok');
    }

    const snap = await db.collection('calls').where('twilioCallSid', '==', callSid).limit(1).get();
    if (snap.empty) {
      console.warn('voice-status: no matching call doc for CallSid', callSid);
      return res.status(200).send('ok');
    }

    const update = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (twilioStatus && STATUS_MAP[twilioStatus]) update.status = STATUS_MAP[twilioStatus];
    if (duration != null) update.duration = parseInt(duration, 10) || 0;
    if (recordingUrl) update.recordingUrl = recordingUrl + '.mp3';
    if (twilioStatus === 'completed') update.endTime = new Date().toISOString();

    await snap.docs[0].ref.update(update);
    return res.status(200).send('ok');
  } catch (err) {
    console.error('voice-status error:', err);
    // Always 200 back to Twilio — a non-200 makes Twilio retry the
    // webhook repeatedly, which won't fix a code error on our end.
    return res.status(200).send('error logged');
  }
};
