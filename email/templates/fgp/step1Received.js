const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step1Received(data) {
  const bodyHtml = `
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#C89B14;text-transform:uppercase;letter-spacing:.08em;">Application Received</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Thanks for applying, ${data.name}.</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Your application for <strong style="color:#F2EDE4;">${data.business || 'your business'}</strong> to become a TEKNNUKU Founding Growth Partner is in. We're reviewing applications on commitment, readiness for growth, and potential impact — not business size, so there's nothing more you need to do right now.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Only 10 businesses will be selected. If you're shortlisted, we'll reach out to schedule a short Business Discovery Call before final acceptance.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Only 10 businesses will be selected.', bodyHtml });
}

module.exports = { step1Received };
