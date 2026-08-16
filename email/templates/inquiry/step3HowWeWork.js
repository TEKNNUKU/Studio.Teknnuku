const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step3HowWeWork(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">How we actually work</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      ${data.name}, while we get things moving on your request, here's the short version of our process: <strong style="color:#F2EDE4;">Design → Build → Validate → Scale.</strong>
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      We don't just advise from the sidelines — we build alongside you, the same way we build our own ventures inside the TEKNNUKU ecosystem. If we take your project on, we treat it exactly as we treat our own.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Design → Build → Validate → Scale.', bodyHtml });
}

module.exports = { step3HowWeWork };
