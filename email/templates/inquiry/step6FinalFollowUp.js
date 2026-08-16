const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step6FinalFollowUp(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">We'll leave it here, ${data.name}.</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      This is the last email in this series — we don't want to be the inbox clutter nobody asked for. Your original request is still on file, and if timing wasn't right, that's completely fine.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Reply anytime and it'll reach a real person.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'The last one in this series.', bodyHtml });
}

module.exports = { step6FinalFollowUp };
