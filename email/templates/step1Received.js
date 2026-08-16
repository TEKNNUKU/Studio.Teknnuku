const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step1Received(data) {
  const bodyHtml = `
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#C89B14;text-transform:uppercase;letter-spacing:.08em;">Application Received</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Thanks for applying, ${data.name}.</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Your application${data.role ? ` for <strong style="color:#F2EDE4;">${data.role}</strong>` : ''} has been received and is in the queue for review. We read every application personally — we'll follow up as soon as we've had a proper look.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'We read every application personally.', bodyHtml });
}

module.exports = { step1Received };
