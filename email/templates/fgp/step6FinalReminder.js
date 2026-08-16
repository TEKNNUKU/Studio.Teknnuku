const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step6FinalReminder(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">One week in — here's where things stand</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      ${data.name}, it's been a week since your application for <strong style="color:#F2EDE4;">${data.business || 'your business'}</strong> came in. Applications are reviewed carefully, not on a fixed schedule, so a short wait doesn't mean anything either way.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      If selected, you'll hear from us directly to schedule your Discovery Call. If you have any questions in the meantime, just reply to this email.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'A short wait doesn\'t mean anything either way.', bodyHtml });
}

module.exports = { step6FinalReminder };
