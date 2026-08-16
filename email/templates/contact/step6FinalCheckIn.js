const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step6FinalCheckIn(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#F2EDE4;line-height:1.3;">Last note, ${data.name}</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      We'll leave it here for now. The door's always open — just reply whenever, if ever, it's useful.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'The door\'s always open.', bodyHtml });
}

module.exports = { step6FinalCheckIn };
