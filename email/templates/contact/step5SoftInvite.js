const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step5SoftInvite(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#F2EDE4;line-height:1.3;">Still here if useful, ${data.name}</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      If it'd help to talk through whatever prompted your original message, happy to hop on a quick call — genuinely no pressure either way.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'No pressure either way.', bodyHtml });
}

module.exports = { step5SoftInvite };
