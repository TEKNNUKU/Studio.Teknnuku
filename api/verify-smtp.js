const { verifyConnection } = require('../email/mailer.js');

// Hit this from a browser, curl, or the "Verify SMTP" button in the admin
// panel's Communications tab to confirm your Zoho credentials actually work
// — without sending a real email and without needing Node.js installed
// locally. Protected by the same secret as the manual automation trigger.
module.exports = async (req, res) => {
  const providedSecret = req.headers['x-automation-secret'] || req.query.secret;
  if (providedSecret !== process.env.AUTOMATION_TRIGGER_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — pass ?secret=YOUR_AUTOMATION_TRIGGER_SECRET or the x-automation-secret header' });
  }

  try {
    await verifyConnection();
    return res.status(200).json({ ok: true, message: 'SMTP connection verified — host, port, and login all check out.' });
  } catch (err) {
    return res.status(200).json({ ok: false, error: err.message });
  }
};
