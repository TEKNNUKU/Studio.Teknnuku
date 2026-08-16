const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step1Received(data) {
  const bodyHtml = `
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#C89B14;text-transform:uppercase;letter-spacing:.08em;">Message Received</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Thanks for reaching out, ${data.name}.</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Your message came through and we'll get back to you within 24 hours. If it's urgent, feel free to reach us directly on WhatsApp.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'We\'ll get back to you within 24 hours.', bodyHtml });
}

module.exports = { step1Received };
