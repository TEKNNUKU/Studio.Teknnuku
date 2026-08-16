const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step3CheckIn(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#F2EDE4;line-height:1.3;">Just checking in, ${data.name}</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Hope you heard back from someone on the team about your message. If not, just reply here and we'll chase it down.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Hope you heard back from someone.', bodyHtml });
}

module.exports = { step3CheckIn };
