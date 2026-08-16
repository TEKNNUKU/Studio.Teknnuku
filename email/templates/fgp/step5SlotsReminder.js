const { defaultLayout } = require('../../layouts/default.js')
const { signature } = require('../../components/signature.js')

function step5SlotsReminder(data) {
  const bodyHtml = `
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#C89B14;text-transform:uppercase;letter-spacing:.08em;">Applications Still Open</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;color:#F2EDE4;line-height:1.3;">Still only 10 spots, ${data.name}.</h1>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      Just a quick note while your application for <strong style="color:#F2EDE4;">${data.business || 'your business'}</strong> is being reviewed — we're keeping the Founding Growth Partners cohort deliberately small, because the whole point is hands-on implementation, not a webinar full of strangers.
    </p>
    <p style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:15px;color:rgba(242,237,228,.85);line-height:1.7;">
      No action needed on your end — we just wanted you to know where things stand.
    </p>
    ${signature()}
  `;
  return defaultLayout({ preheader: 'Deliberately small, on purpose.', bodyHtml });
}

module.exports = { step5SlotsReminder };
