const { defaultLayout } = require('../../layouts/default.js')
const { button } = require('../../components/button.js')
const { signature } = require('../../components/signature.js')

function step4Resource(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#F2EDE4;line-height:1.3;">Something that might be useful</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      ${data.name}, no strings attached — if you're figuring out where your business stands online, our free 2-minute Business Growth Assessment gives you an instant score and a few concrete next steps.
    </p>
    ${data.diagnosticLink ? button('Try the Free Assessment', data.diagnosticLink) : ''}
    ${signature()}
  `;
  return defaultLayout({ preheader: 'No strings attached.', bodyHtml });
}

module.exports = { step4Resource };
