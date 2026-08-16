const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step4SocialProof(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Why businesses actually finish this program</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      ${data.name}, while you wait, a few honest numbers from what TEKNNUKU has already built: 10+ projects delivered, $250k+ in revenue generated for the businesses we've worked with, and an 89% client retention rate.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      That retention number is the one we're proudest of — it means people who work with us tend to keep working with us, because the systems we build actually hold up after launch.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      That's the standard we're holding the Founding Growth Partners cohort to as well.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'A few honest numbers.', bodyHtml });
}

module.exports = { step4SocialProof };
