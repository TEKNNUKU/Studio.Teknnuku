const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step5StatusCheckin(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#F2EDE4;line-height:1.3;">Still reviewing, ${data.name}</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Your application${data.role ? ` for ${data.role}` : ''} is still in review — we appreciate your patience. We'll be in touch directly the moment there's a real update, rather than sending you empty status emails.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'We appreciate your patience.', bodyHtml });
}

module.exports = { step5StatusCheckin };
