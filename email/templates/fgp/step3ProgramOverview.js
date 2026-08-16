const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step3ProgramOverview(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">While you wait — here's exactly what the program includes</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      ${data.name}, in case it's useful while your application is under review, here's the shape of the 8 weeks if you're selected:
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
      <tr><td style="padding:8px 0;border-bottom:1px solid rgba(200,155,20,.12);font-family:Arial,sans-serif;font-size:14px;color:rgba(242,237,228,.85);"><strong style="color:#F2EDE4;">Weeks 1–2:</strong> Business Growth Assessment, Growth Score, and a personalized roadmap</td></tr>
      <tr><td style="padding:8px 0;border-bottom:1px solid rgba(200,155,20,.12);font-family:Arial,sans-serif;font-size:14px;color:rgba(242,237,228,.85);"><strong style="color:#F2EDE4;">Weeks 3–6:</strong> Implementation of your priority Growth System, hands-on</td></tr>
      <tr><td style="padding:8px 0;font-family:Arial,sans-serif;font-size:14px;color:rgba(242,237,228,.85);"><strong style="color:#F2EDE4;">Weeks 7–8:</strong> Results measurement, testimonial, and your Founding Partner recognition</td></tr>
    </table>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      We'll be in touch as soon as a decision is made on ${data.business || 'your application'}.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Here\'s the shape of the 8 weeks.', bodyHtml });
}

module.exports = { step3ProgramOverview };
