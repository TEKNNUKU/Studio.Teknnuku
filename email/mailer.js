const nodemailer = require('nodemailer');

// Don't hardcode smtp.zoho.com — Zoho's actual SMTP host depends on whether
// your organization is on a free or paid data center (smtp.zoho.com vs
// smtppro.zoho.com). Set ZOHO_SMTP_HOST explicitly in your Vercel env vars
// to whatever your Zoho account's Mail → Settings → SMTP page says.
let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  const port = Number(process.env.ZOHO_SMTP_PORT || 465);
  transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.ZOHO_SMTP_USER,
      pass: process.env.ZOHO_SMTP_PASSWORD
    }
  });
  return transporter;
}

// The email addresses you have on Zoho. The authenticated account
// (ZOHO_SMTP_USER) must actually be allowed to send as whichever of these
// you use — confirm in Zoho whether studio@ is an alias on the same
// mailbox or a separate one before relying on it as a "from" address.
const senders = {
  general: 'TEKNNUKU Studio <hello@teknnuku.xyz>',
  studio: 'TEKNNUKU Studio <studio@teknnuku.xyz>'
};

async function sendEmail({ to, subject, html, replyTo, from }) {
  const t = getTransporter();
  return t.sendMail({
    from: from || senders.general,
    to,
    replyTo: replyTo || 'hello@teknnuku.xyz',
    subject,
    html
  });
}

// Checks DNS, connection, TLS, and auth against Zoho without sending an
// email — call this once after setting your env vars to confirm the SMTP
// config is actually correct before anything tries to send for real.
async function verifyConnection() {
  const t = getTransporter();
  return t.verify();
}

module.exports = { senders, sendEmail, verifyConnection };
