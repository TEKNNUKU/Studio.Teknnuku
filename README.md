# TEKNNUKU Email Automation — Setup Guide

Watches all 5 of your public form collections (`intake_leads`, `fgp_applications`,
`service_inquiries`, `contact_messages`, `applicants`) and runs every submission
through a tailored 6-step email sequence — confirmation + internal alert
immediately, then follow-ups at day 1, 3, 5, and 7 — sent via your existing
Zoho mailboxes. **None of your existing forms need to change.** The engine
finds new submissions itself by polling, rather than requiring your forms to
call it directly.

## What's in this zip

```
admin.html                  ← your admin panel, updated with a new
                               Communications panel (visibility into
                               automation status + email logs, plus
                               pause/resume per sequence)
api/
  process-automation.js     ← the engine (cron-triggered)
  _firebaseAdminEmail.js    ← shared Firebase Admin init (renamed to avoid
                               colliding with the Call Center's own admin
                               init file, if you're merging into that project)
email/
  mailer.js                 ← Zoho SMTP transport (Nodemailer)
  layouts/default.js        ← shared visual shell every email uses
  components/               ← header, footer, button, signature
  templates/
    adminNotification.js    ← shared internal-alert template
    assessment/  fgp/  inquiry/  contact/  applicant/
                             ← 5 template files each, one per sequence step
automation/
  sequences.js               ← defines all 5 sequences as data
firebase/
  firestore.rules            ← updated rules (adds automations + emailLogs)
package.json
vercel.json
README.md
```

## Part 1 — Merging with your Call Center deployment

If you already deployed the Call Center system into the same Vercel project,
**your existing `vercel.json` needs to be replaced with the one in this zip**
— it's not a diff, it's the full merged config covering both the Call
Center's 3 functions and this system's `process-automation` function plus its
cron schedule. Don't just drop this `vercel.json` in blindly without checking
you haven't since added anything else to your old one that needs preserving.

The `api/_firebaseAdminEmail.js` file is deliberately named differently from
the Call Center's `api/_firebaseAdmin.js` so dropping both into the same
`/api` folder won't overwrite either one.

If you're **not** merging with the Call Center project, ignore the above —
just drop everything in as-is.

## Part 2 — Zoho SMTP setup

1. Log into Zoho Mail admin and go to **Settings → Mail Accounts** to confirm
   whether `hello@teknnuku.xyz` is on a free or paid organization plan — this
   determines your actual SMTP host. **Don't assume** `smtp.zoho.com`; check
   your account's own SMTP configuration page for the exact hostname (it may
   be `smtppro.zoho.com` if you're on a paid plan).
2. If your account has two-factor authentication on, generate an
   **app-specific password** for SMTP (Zoho Account → Security → App
   Passwords) — don't use your normal login password.
3. Confirm whether `studio@teknnuku.xyz` is an **alias** on the same mailbox
   as `hello@teknnuku.xyz`, or a fully separate mailbox. If separate, the
   account you authenticate SMTP with must actually be authorized to send as
   whichever address you use in `from:`.

## Part 3 — Firebase service account

Same as the Call Center setup, if you haven't already got one:

1. Firebase Console → Project Settings → Service Accounts → **Generate new
   private key**.
2. Base64-encode the whole file: `base64 -i your-key.json | tr -d '\n'`
   (Mac/Linux) or the PowerShell equivalent on Windows.
3. Save that string — it's your `FIREBASE_SERVICE_ACCOUNT_KEY` env var. If
   you already set this for the Call Center deployment in the same Vercel
   project, you can reuse the exact same value.

## Part 4 — Vercel environment variables

| Variable | Value |
|---|---|
| `ZOHO_SMTP_HOST` | Whatever Part 2 told you (`smtp.zoho.com` or `smtppro.zoho.com`) |
| `ZOHO_SMTP_PORT` | `465` (SSL) or `587` (TLS) |
| `ZOHO_SMTP_USER` | `hello@teknnuku.xyz` |
| `ZOHO_SMTP_PASSWORD` | Your app-specific password from Part 2 |
| `ADMIN_NOTIFY_EMAIL` | Where internal "new submission" alerts should land, e.g. `hello@teknnuku.xyz` |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Base64 string from Part 3 |
| `SITE_URL` | `https://studio.teknnuku.xyz` (or your actual domain — used to build links in emails) |
| `ADMIN_URL` | Same domain, used for the "View in Admin Panel" link in internal alerts |
| `AUTOMATION_TRIGGER_SECRET` | Any random string — lets you manually trigger a run for testing without waiting for the cron schedule (see Part 6) |

## Part 5 — About the cron schedule, honestly

**Your Vercel account is on the Hobby plan**, which currently limits Cron
Jobs to a maximum of once per day — not the every-few-minutes schedule that
would make emails feel truly instant. I've set `vercel.json` to run daily at
09:00 UTC as a safe default that will actually deploy and run on your plan.

What this means practically: someone who submits a form today gets their
confirmation email the *next* time the cron fires — up to ~24 hours later,
not near-instant. If that delay isn't acceptable, you have two options:
upgrade to a Vercel Pro plan (which supports much more frequent cron
schedules — change the `schedule` value in `vercel.json` to `"*/5 * * * *"`
for every 5 minutes once you've upgraded), or trigger the engine another way
(e.g. an external free cron-ping service hitting your endpoint every few
minutes, using the `AUTOMATION_TRIGGER_SECRET` header — see Part 6).

## Part 6 — Testing before it's live

**Verify your SMTP credentials work, without sending anything:**
```js
// Run this once locally with your env vars set, or temporarily add a
// console.log(await verifyConnection()) call inside process-automation.js
const { verifyConnection } = require('./email/mailer.js');
await verifyConnection(); // throws if host/port/auth are wrong
```

**Manually trigger a full run** (bypasses the cron schedule, useful for
testing without waiting a day):
```bash
curl -X POST https://your-domain.vercel.app/api/process-automation \
  -H "x-automation-secret: YOUR_AUTOMATION_TRIGGER_SECRET"
```
This finds any new submissions across all 5 collections and sends whatever
steps are due. Submit a real test entry through one of your forms first,
then run this — you should get the immediate confirmation + internal alert.

## Part 7 — Deploy the updated Firestore rules

`firebase/firestore.rules` in this zip is your **complete, current** rules
file — includes everything from before plus the two new collections this
system uses (`automations`, `emailLogs`). Deploy it the same way as your last
rules update.

## What each of the 5 sequences actually says

All five follow the same 6-step cadence (immediate confirmation + immediate
internal alert, then day 1/3/5/7 follow-ups) but the tone and content are
deliberately different per source:

- **Assessment** (`intake_leads`) — sales nurture: growth problems, common
  mistakes, strategy session invite.
- **FGP** (`fgp_applications`) — application status: program recap, traction
  stats, slots reminder.
- **Inquiry** (`service_inquiries`) — lighter sales touch: how you work, proof,
  a discovery call invite.
- **Contact** (`contact_messages`) — deliberately the softest sequence, since
  these are the least qualified/most generic entry point — mostly check-ins,
  not a sales push.
- **Applicant** (`applicants`) — recruiting tone throughout, not sales: hiring
  process, culture, status updates.

Edit any individual email's copy in `email/templates/<sequence>/`, or change
timing/ordering in `automation/sequences.js`.

## The Communications panel

Open `admin.html` → sidebar → **Communications** (visible to Founder, Ops
Lead, Sales Manager, and Content Lead by default — change this in
`ROLE_PERMISSIONS` if you want other roles to see it). You'll find:

- **Stats** — active sequences, completed, sent today, and failed sends (this
  last one turns red if anything's actually broken — check the Zoho
  credentials first if you see failures).
- **Active & Recent Sequences** — every automation, who it's for, which
  sequence, what step it's on, when the next email goes out, and a
  Pause/Resume button per row.
- **Email Log** — every email actually sent or attempted, searchable by
  recipient or subject.

Nothing in this panel writes automation records directly — those are
engine-owned (see Part 7's rules comment). The one write it does perform is
flipping `status` to `paused`/`active` on an automation, which the engine
respects on its next run.

## Extending this later

- **Stopping a sequence when someone converts** (e.g. an assessment lead
  books a consultation) — the same `status` field the Pause button uses can
  be set programmatically from elsewhere in your codebase too.
- **Real-time agent presence for inbound routing** — not applicable here,
  that's a Call Center note.
- **AI-summarized weekly digest** of automation performance — the data's
  already structured for it in `emailLogs`; a scheduled job that aggregates
  and emails a summary to the team is a natural next step.
