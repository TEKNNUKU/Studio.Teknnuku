const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step3HiringProcess(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">What happens next</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      ${data.name}, so you're not left guessing — here's roughly how our process works: we review applications as they come in, shortlist candidates for a conversation, and move quickly once we know someone's a fit. We're a small, hands-on team, so there's no lengthy multi-round gauntlet.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      If you're shortlisted, you'll hear from us directly — no automated status page to refresh.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'No lengthy multi-round gauntlet.', bodyHtml });
}

module.exports = { step3HiringProcess };
