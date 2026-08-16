const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step4CaseStudy(data) {
  const bodyHtml = `
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Does this actually work?</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Fair question, ${data.name}. Since starting, TEKNNUKU has delivered 10+ projects, generated $250k+ in revenue for the businesses we've worked with, and holds an 89% client retention rate — meaning the people we work with tend to stick around, because the systems keep working after we hand them over.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      We're not the right fit for everyone, and we'd rather tell you that upfront than waste your time.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Fair question.', bodyHtml });
}

module.exports = { step4CaseStudy };
