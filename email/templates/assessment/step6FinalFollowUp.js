const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step6FinalFollowUp(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#F2EDE4;line-height:1.3;">Closing the loop, ${data.name}</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      It's been a week since your application came in. Our hiring timeline isn't fixed, so this isn't a rejection — just letting you know review is still active. If anything changes, you'll hear from us directly.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Thanks again for your interest in TEKNNUKU.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'This isn\'t a rejection.', bodyHtml });
}

module.exports = { step6FinalFollowUp };
