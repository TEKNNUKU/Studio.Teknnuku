// ═══════════════════════════════════════════════════════════════
//  /api/voice-webhook
//
//  This is the URL you paste into TWO places in the Twilio console:
//    1. Your TwiML App's "Voice → A call comes in" URL — this fires
//       whenever an agent's browser places an outbound call via the
//       dialer (Twilio Device.connect()).
//    2. Your purchased phone number's "Voice → A call comes in" URL —
//       this fires when someone calls your TEKNNUKU number from the
//       outside world.
//
//  Twilio distinguishes the two for us: an outbound call from the
//  browser arrives with From = "client:<agentUid>"; a real inbound
//  call from the phone network arrives with From = an actual phone
//  number. We branch on that.
//
//  Twilio POSTs this as application/x-www-form-urlencoded — Vercel's
//  Node runtime parses that into req.body automatically.
// ═══════════════════════════════════════════════════════════════

const twilio = require('twilio');
const VoiceResponse = twilio.twiml.VoiceResponse;

function isValidTwilioRequest(req) {
  // Optional but recommended once your deployed URL is confirmed working.
  // Enable by setting TWILIO_VALIDATE_SIGNATURE=true — left off by default
  // so a URL/proxy mismatch during initial setup can't silently break
  // every call before you've had a chance to test it.
  if (process.env.TWILIO_VALIDATE_SIGNATURE !== 'true') return true;
  const signature = req.headers['x-twilio-signature'];
  const url = `https://${req.headers.host}${req.url}`;
  return twilio.validateRequest(process.env.TWILIO_AUTH_TOKEN, signature, url, req.body);
}

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/xml');

  if (req.method !== 'POST') {
    return res.status(405).send('<Response><Say>Method not allowed.</Say></Response>');
  }
  if (!isValidTwilioRequest(req)) {
    console.warn('⚠️ voice-webhook: request failed Twilio signature validation');
    return res.status(403).send('<Response><Reject/></Response>');
  }

  const twiml = new VoiceResponse();
  const from = (req.body.From || '');
  const to = (req.body.To || '');
  const callerId = process.env.TWILIO_CALLER_ID || '';
  const recordCalls = process.env.TWILIO_RECORD_CALLS === 'true';
  const statusCallbackUrl = `https://${req.headers.host}/api/voice-status`;

  if (from.indexOf('client:') === 0) {
    // ── Outbound: an agent's browser is placing a call ──────────
    if (!to) {
      twiml.say('No destination number was provided.');
    } else if (!callerId) {
      twiml.say('This system is not fully configured yet. The caller I D is missing. Please contact your administrator.');
    } else {
      const dialOpts = {
        callerId: callerId,
        statusCallback: statusCallbackUrl,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      };
      if (recordCalls) {
        dialOpts.record = 'record-from-answer';
        dialOpts.recordingStatusCallback = statusCallbackUrl;
      }
      const dial = twiml.dial(dialOpts);
      dial.number(to);
    }
  } else {
    // ── Inbound: someone from the outside world is calling the ──
    // TEKNNUKU number. Rings every agent identity listed in
    // AGENT_IDENTITIES (comma-separated Firebase UIDs). This is a
    // simple static "ring all" for V1 — see README.md for how to
    // extend this to real-time presence (only ring agents who are
    // actually online) by querying Firestore here instead.
    const identities = (process.env.AGENT_IDENTITIES || '')
      .split(',').map(s => s.trim()).filter(Boolean);

    if (!identities.length) {
      twiml.say('Thank you for calling TEKNNUKU Studio. No agents are configured to receive calls yet. Please try again later, or reach us on WhatsApp.');
    } else {
      const dial = twiml.dial({
        timeout: 20,
        statusCallback: statusCallbackUrl,
        statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
        statusCallbackMethod: 'POST'
      });
      identities.forEach(id => dial.client(id));
      twiml.say('Sorry, no one is available to take your call right now. Please try again shortly, or reach us on WhatsApp.');
    }
  }

  res.status(200).send(twiml.toString());
};
