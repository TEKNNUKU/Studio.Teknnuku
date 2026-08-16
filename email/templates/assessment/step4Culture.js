const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step4Culture(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">What TEKNNUKU actually is</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      While you wait to hear from us, ${data.name}, a bit of context: TEKNNUKU Studio is the venture-building arm of the TEKNNUKU ecosystem. We don't just advise founders — we design, build, and validate businesses ourselves, and extend that same capability to clients.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Whoever joins the team ends up working across real ventures, not hypothetical case studies. That's the kind of place we're building.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'A bit of context while you wait.', bodyHtml });
}

module.exports = { step4Culture };
