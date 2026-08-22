# TEKNNUKU Email Automation — Setup Guide

Watches all 5 of your public form collections (`intake_leads`, `fgp_applications`,
`service_inquiries`, `contact_messages`, `applicants`) and runs every submission
through a tailored 6-step email sequence.

**Update: the first confirmation email is now genuinely instant**, not
delayed until the next cron run. Steps 1-2 (the "we got it" confirmation +
internal team alert) fire the moment someone submits a form. Steps 3-6 (the
day 1/3/5/7 follow-ups, where a day's precision doesn't matter) still run on
the daily cron. This needed three small, safe additions to your existing
forms — see "How instant delivery actually works" below for exactly what
changed and why it can't break your forms even if the email service is
having a bad day.

## What's in this zip

```
admin.html                  ← your admin panel, with a Communications panel
                               (automation status, email logs, pause/resume,
                               and — new — Verify SMTP / Run Now buttons for
                               testing without a terminal)
frontend/
  index.html                 ← updated: fires instant confirmations for
                               Assessment, Contact, and Service Inquiry forms
  intakeform.html             ← updated: same, for the standalone assessment page
  fgp-application.html        ← updated: same, for Founding Growth Partners
api/
  process-automation.js     ← daily cron sweep (now a thin wrapper — see below)
  send-confirmation.js      ← NEW: instant step 1-2 trigger, called by the forms
  verify-smtp.js            ← NEW: browser-friendly SMTP credential check
  _firebaseAdminEmail.js    ← shared Firebase Admin init (renamed to avoid
                               colliding with the Call Center's own admin
                               init file, if you're merging into that project)
automation/
  engine.js                  ← NEW: the actual send/log/advance logic, shared
                               by both process-automation.js and
                               send-confirmation.js so they can't drift apart
  sequences.js                ← defines all 5 sequences as data
email/
  mailer.js                 ← Zoho SMTP transport (Nodemailer)
  layouts/default.js        ← shared visual shell every email uses
  components/               ← header, footer, button, signature
  templates/
    adminNotification.js    ← shared internal-alert template
    assessment/  fgp/  inquiry/  contact/  applicant/
                             ← 5 template files each, one per sequence step
firebase/
  firestore.rules            ← updated rules (adds automations + emailLogs)
package.json
vercel.json
README.md
```

## Troubleshooting

**"Function Runtimes must have a valid version, for example `now-php@1.0.0`"**
— this means `vercel.json` has an invalid `runtime` value somewhere (like
`"nodejs20.x"`). That field is only for specifying a third-party community
runtime package version, not for pinning the Node.js version — Vercel
auto-detects Node functions on its own. To control the Node version, use
`"engines": {"node": "20.x"}` in `package.json` instead (already set in this
delivery). If you still hit this error, check whether your repo has an
older `vercel.json` with `runtime` entries left over from a previous deploy
and make sure it's been fully replaced by the one in this zip.

**"Request failed: Unexpected token 'A', "A server e"... is not valid
JSON"** on "Run Automation Now" — this was a real bug, now fixed, in an
earlier version of this delivery. `findOrCreateAutomations` was checking
each candidate submission against Firestore individually (up to 250
sequential queries on a busy run), slow enough on a cold serverless start to
exceed Vercel's function timeout — when Vercel kills a function for running
too long, it returns its own plain-text error page instead of JSON, which
is exactly what that parse error was seeing. Fixed by fetching all
already-tracked automations once up front and checking membership in
memory instead of querying per-document. If you're on a version of this
zip from before this fix, replace `automation/engine.js` with the one
here.

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
Jobs to a maximum of once per day. I've set `vercel.json` to run daily at
09:00 UTC as a safe default that will actually deploy and run on your plan.

This used to mean confirmation emails could be delayed up to a day — that's
fixed now (see "How instant delivery actually works" below). What's still on
the daily schedule is just steps 3-6, the day 1/3/5/7 nurture follow-ups,
where a day's precision genuinely doesn't matter. If you ever want those
tighter too, upgrading to Vercel Pro lets you change the `schedule` value in
`vercel.json` to something like `"*/15 * * * *"` for every 15 minutes.

**Or, for free:** Vercel's own Cron Jobs feature is what's capped at daily
on Hobby — but nothing stops a completely separate service from calling
your `/api/process-automation` URL like any other visitor would, as often
as you like. That's what cron-job.org (or similar free services) gives you.

### Setting up cron-job.org

1. At [console.cron-job.org](https://console.cron-job.org), click
   **CREATE CRONJOB**.
2. **Title:** anything, e.g. "TEKNNUKU Email Automation".
3. **URL:** `https://studio.teknnuku.xyz/api/process-automation`
4. **Schedule:** pick how often — every 15-30 minutes is plenty, since the
   urgent part (the first confirmation) is already instant; this schedule
   only affects how promptly the day 1/3/5/7 follow-ups fire once they
   become due, and a day's precision doesn't need minute-level accuracy.
5. Find the section for custom **HTTP headers** (it's under the job's
   request/method settings — look for "Headers" or "Advanced") and add one:
   - Name: `x-automation-secret`
   - Value: your `AUTOMATION_TRIGGER_SECRET` from Part 4
6. Save and enable it.

This doesn't replace your Vercel cron — both can run side by side safely,
since re-running the sweep never sends a duplicate email (each automation
only advances past a step once).

## How instant delivery actually works

Each of the three form files now does this, right after its existing
Firestore save succeeds:

```js
fetch('/api/send-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ collection: 'intake_leads', docId: docRef.id })
}).catch(() => {});
```

Three things make this safe to add without any risk to your forms:

1. **It's fire-and-forget.** The form doesn't `await` this call or check its
   result — the person sees their normal success message exactly as before,
   instantly, whether or not the email side works.
2. **Failure is silently swallowed** (`.catch(() => {})`). If Zoho is down,
   your Vercel deployment has an issue, or anything else goes wrong, the form
   submission itself is completely unaffected.
3. **The daily cron is still the safety net.** If the instant call never
   fires or fails outright, `process-automation.js`'s daily sweep will still
   find that submission and send its confirmation — just up to a day later
   instead of instantly. Nobody's confirmation email silently vanishes
   forever; worst case, it's just not instant.

The endpoint itself (`send-confirmation.js`) never trusts anything the form
sends except *which* collection and *which* document — it always re-reads
the actual submitted data from Firestore before building the email, so
there's no way to spoof email content or send to an arbitrary address
through this endpoint.

## Part 6 — Testing before it's live

You don't need a terminal or curl for any of this — it's all built into the
admin panel now.

1. Open `admin.html` → **Communications** in the sidebar.
2. At the top, paste your `AUTOMATION_TRIGGER_SECRET` (the same value you
   set in Vercel's environment variables) into the password field. It's
   saved in your browser so you won't need to re-enter it every visit.
3. Click **✓ Verify SMTP** first. This checks your Zoho host, port, and
   login are all correct — without sending a single email. If it fails,
   the error message tells you exactly what's wrong (usually a wrong host,
   port, or password).
4. Once that passes, submit a real test entry through one of your actual
   forms (the assessment, a contact message, whatever's easiest to test).
   You should get the confirmation email within seconds now — that's the
   instant path working.
5. Click **▶ Run Automation Now** to manually trigger the daily sweep
   without waiting for its schedule — useful for testing the day 3/5/7
   follow-ups without actually waiting days (temporarily back-date an
   automation's `nextRunAt` in Firestore if you want to test a later step
   without waiting).

If you'd rather use curl or a browser URL directly (e.g. for scripting or
automated monitoring), both endpoints also accept the secret as a query
parameter, so this works too — paste it straight into a browser address bar:
```
https://your-domain.vercel.app/api/verify-smtp?secret=YOUR_AUTOMATION_TRIGGER_SECRET
```

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

- **Testing & Manual Trigger** — the secret field, Verify SMTP, and Run Now
  buttons described in Part 6 above.
- **Stats** — active sequences, completed, sent today, and failed sends (this
  last one turns red if anything's actually broken — check the Zoho
  credentials first if you see failures).
- **Active & Recent Sequences** — every automation, who it's for, which
  sequence, what step it's on, when the next email goes out, and a
  Pause/Resume button per row.
- **Email Log** — every email actually sent or attempted, searchable by
  recipient or subject.

Nothing in this panel writes automation records directly — those are
engine-owned (see Part 7's rules comment). The only writes it performs are
flipping `status` to `paused`/`active` on an automation, and triggering the
two test endpoints — everything else is read-only visibility.

## Extending this later

- **Stopping a sequence when someone converts** (e.g. an assessment lead
  books a consultation) — the same `status` field the Pause button uses can
  be set programmatically from elsewhere in your codebase too.
- **Real-time agent presence for inbound routing** — not applicable here,
  that's a Call Center note.
- **AI-summarized weekly digest** of automation performance — the data's
  already structured for it in `emailLogs`; a scheduled job that aggregates
  and emails a summary to the team is a natural next step.
