# TEKNNUKU Call Center — Setup Guide

This adds a browser-based phone (Twilio Voice) to your existing TEKNNUKU
Studio admin panel: agents can dial out, receive inbound calls, and every
call gets logged automatically with duration, outcome, and notes.

**What's in this zip:**

```
admin.html                  ← drop-in replacement for your current admin.html
api/
  voice-token.js            ← mints a Twilio Voice token for a signed-in agent
  voice-webhook.js          ← tells Twilio what to do on outbound + inbound calls
  voice-status.js           ← keeps call records accurate server-side
  _firebaseAdmin.js         ← shared Firebase Admin SDK init (used by the above)
package.json                ← dependencies for the /api functions
vercel.json                 ← runtime config for the /api functions
firebase/firestore.rules    ← updated rules (adds the `calls` collection)
README.md                   ← this file
```

Nothing here touches your FGP system or any other files — it's all
additive to your existing `teknnuku-intake-form` Firebase project.

---

## Part 1 — Twilio account setup

You'll need a Twilio account. This has real running costs: roughly
$1–2/month for the phone number, plus per-minute call charges (Nigeria
termination rates vary — check Twilio's pricing page before going live).

1. **Sign up** at twilio.com and verify your account.
2. **Buy a phone number** — Console → Phone Numbers → Buy a Number. Any
   number with Voice capability works; a number with local presence in
   Nigeria is worth considering if you'll take a lot of inbound calls,
   but a US/UK number works fine to start.
3. **Create an API Key** — Console → Account → API keys & tokens →
   Create API Key. Save the **SID** and **Secret** immediately — the
   secret is only shown once.
4. **Create a TwiML App** — Console → Voice → TwiML Apps → Create new
   TwiML App.
   - Name it "TEKNNUKU Call Center"
   - Voice → "A call comes in" → Webhook → paste your deployed
     `https://your-domain.vercel.app/api/voice-webhook` (you'll get this
     URL after Part 2 — come back and fill this in once you've deployed)
   - Save, then copy the **TwiML App SID**
5. **Point your phone number at the same webhook** — Console → Phone
   Numbers → your number → Voice Configuration → "A call comes in" →
   Webhook → same `/api/voice-webhook` URL.
6. Note down your **Account SID** and **Auth Token** from the Console
   dashboard homepage.

You should now have five values: Account SID, Auth Token, API Key SID,
API Key Secret, TwiML App SID — plus the phone number you bought.

---

## Part 2 — Firebase Admin service account

The serverless functions need to verify agent sign-ins and write call
records server-side, which requires a Firebase service account (separate
from the public API key already in admin.html).

1. Firebase Console → Project Settings → Service Accounts →
   **Generate new private key**. This downloads a JSON file — keep it
   secret, never commit it anywhere public.
2. Base64-encode the whole file onto one line:
   - Mac/Linux: `base64 -i your-service-account.json | tr -d '\n'`
   - Windows (PowerShell): `[Convert]::ToBase64String([IO.File]::ReadAllBytes("your-service-account.json"))`
3. Save that output — it's your `FIREBASE_SERVICE_ACCOUNT_KEY` env var.

---

## Part 3 — Deploy to Vercel

If your existing TEKNNUKU site (`studio.teknnuku.xyz`) is already a
Vercel project, add these files to that **same** project — the `/api`
folder is auto-detected by Vercel as serverless functions, no extra
config needed beyond what's in `vercel.json`.

1. Copy `admin.html`, the `api/` folder, `package.json`, and `vercel.json`
   into your existing project repo/folder (replacing your current
   `admin.html`).
2. In the **Vercel dashboard** → your project → Settings →
   Environment Variables, add:

   | Variable | Value |
   |---|---|
   | `TWILIO_ACCOUNT_SID` | from Part 1 |
   | `TWILIO_AUTH_TOKEN` | from Part 1 |
   | `TWILIO_API_KEY_SID` | from Part 1 |
   | `TWILIO_API_KEY_SECRET` | from Part 1 |
   | `TWILIO_TWIML_APP_SID` | from Part 1 |
   | `TWILIO_CALLER_ID` | your Twilio phone number, e.g. `+15551234567` |
   | `AGENT_IDENTITIES` | comma-separated Firebase UIDs of agents who should receive inbound calls, e.g. `abc123,def456` (find UIDs in Firebase Console → Authentication) |
   | `FIREBASE_SERVICE_ACCOUNT_KEY` | the base64 string from Part 2 |
   | `TWILIO_RECORD_CALLS` | `true` or `false` (optional — off by default; see note below) |
   | `TWILIO_VALIDATE_SIGNATURE` | leave unset for now — see note below |

3. Deploy (push to your connected git branch, or `vercel --prod` if you
   deploy via CLI).
4. Copy your deployed URL and go back to Part 1, step 4–5, to paste the
   real `/api/voice-webhook` URL into Twilio's console.

### About call recording
`TWILIO_RECORD_CALLS` is off by default on purpose. Recording calls has
legal and consent implications that vary by state/country — confirm
what's required where your team and customers are before turning this
on. If you enable it, recording URLs get saved to each call's Firestore
record automatically.

### About signature validation
`voice-webhook.js` can verify that requests genuinely came from Twilio
(not someone spoofing calls). It's off by default so a URL/proxy quirk
during your first deploy can't silently break every call before you've
had a chance to test. Once you've confirmed calls work end-to-end, set
`TWILIO_VALIDATE_SIGNATURE=true` for production.

---

## Part 4 — Deploy the updated Firestore rules

`firebase/firestore.rules` in this zip is your **complete, current**
rules file (not a diff) — it includes every collection your system
already uses, plus the new `calls` collection. Deploy it the same way
you deployed the last rules update (Firebase Console → Firestore
Database → Rules → paste and publish, or `firebase deploy --only
firestore:rules` if you use the CLI).

---

## Part 5 — Test it

1. Open the admin panel, sign in, go to the new **Call Center** panel
   in the sidebar (you'll need one of these roles: founder, ops_lead,
   sales_manager, inbound_closer, outbound_closer, or
   outreach_lead_gen).
2. Click **Go Online**. If this fails, open the browser console — the
   error message will tell you exactly which env var or setup step is
   missing.
3. Enter your own phone number and click **Call**. You should see your
   phone ring with the Twilio number as caller ID.
4. Answer, talk, hang up — you'll be prompted for a call outcome, and
   the call should appear in the Call History table below.
5. Test inbound: call your Twilio number from your phone. It should
   ring in the browser (any agent listed in `AGENT_IDENTITIES` who is
   currently online).

---

## Extending this later

- **Click-to-call is already wired into CRM leads** — a "📞 Call"
  button appears on any lead with a phone number if you have
  `callcenter` access. Adding it to Clients or Proposals is the same
  pattern: call `dialCall(phone, name, contactId, contactType)`.
- **Real-time agent presence for inbound routing** — right now
  `AGENT_IDENTITIES` is a static list. To only ring agents who are
  actually online, have `voice-webhook.js` query a Firestore
  `agent_presence` collection (written by the browser on
  `Device.on('registered')` / on tab close) instead of reading the env
  var.
- **WhatsApp follow-up automation** — the outcome buttons already
  capture "Interested" / "Call Back" / etc. per call; hooking a WhatsApp
  Business API send into `saveCallOutcome()` is the natural next step,
  as the original design doc describes.
- **AI call summaries** — `recordingUrl` is already saved on each call
  doc when recording is on; a Cloud Function or scheduled job that
  transcribes and summarizes new recordings is a clean V3 addition.
