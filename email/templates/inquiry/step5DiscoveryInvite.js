const { defaultLayout } = require('../../layouts/default.js')
const { button } = require('../../components/button.js')
const { signature } = require('../../components/signature.js')

function step5DiscoveryInvite(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Want to just talk it through, ${data.name}?</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Sometimes it's faster to just get on a short call than keep going back and forth over email. If that'd help, grab a time that works for you — no obligation, no pressure.
    </p>
    ${data.consultationLink ? button('Book a Call', data.consultationLink) : ''}
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Sometimes it\'s faster to just talk.', bodyHtml });
}

module.exports = { step5DiscoveryInvite };
