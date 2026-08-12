// ═══════════════════════════════════════════════════════════════
//  /api/voice-token
//
//  Called by admin.html when an agent clicks "Go Online". Verifies
//  the agent's Firebase ID token (proving they're actually signed
//  into the admin panel), then mints a short-lived Twilio Voice
//  access token scoped to that agent's identity (their Firebase UID).
//  The browser uses this token to register a Twilio.Device, which is
//  what lets it make and receive calls.
//
//  This MUST run server-side — it's the only place your Twilio API
//  Key Secret is used, and it must never be sent to the browser.
// ═══════════════════════════════════════════════════════════════

const twilio = require('twilio');
const { getAdminApp } = require('./_firebaseAdmin');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // ── 1. Verify the caller is actually a signed-in agent ──────
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!idToken) return res.status(401).json({ error: 'Missing Authorization header' });

    const admin = getAdminApp();
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired session — please sign in again.' });
    }
    const uid = decoded.uid;

    // ── 2. Check required env vars are actually set ─────────────
    const {
      TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, TWILIO_TWIML_APP_SID
    } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET || !TWILIO_TWIML_APP_SID) {
      return res.status(500).json({
        error: 'Voice calling isn\'t configured yet — missing Twilio environment variables on the server. See README.md.'
      });
    }

    // ── 3. Mint the token, scoped to this agent's UID ────────────
    const AccessToken = twilio.jwt.AccessToken;
    const VoiceGrant = AccessToken.VoiceGrant;

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      incomingAllow: true // lets this identity receive calls routed to it
    });

    const token = new AccessToken(TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, TWILIO_API_KEY_SECRET, {
      identity: uid,
      ttl: 3600 // 1 hour — the browser re-fetches when it expires
    });
    token.addGrant(voiceGrant);

    return res.status(200).json({ token: token.toJwt(), identity: uid });
  } catch (err) {
    console.error('voice-token error:', err);
    return res.status(500).json({ error: 'Could not generate a voice token.' });
  }
};
