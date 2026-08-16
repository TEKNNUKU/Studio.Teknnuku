const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step1Received(data) {
  const bodyHtml = `
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#C89B14;text-transform:uppercase;letter-spacing:.08em;">Request Received</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Got it, ${data.name}.</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Your request${data.service ? ` for <strong style="color:#F2EDE4;">${data.service}</strong>` : ''} has landed with the team. Someone will follow up personally within one business day with next steps — no automated runaround.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Someone will follow up within one business day.', bodyHtml });
}

module.exports = { step1Received };
