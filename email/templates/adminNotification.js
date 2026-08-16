const { defaultLayout } = require('../layouts/default.js')
const { button } = require('../components/button.js')

const FORM_LABELS = {
  assessment: 'Business Growth Assessment',
  fgp: 'Founding Growth Partners Application',
  inquiry: 'Service Inquiry',
  contact: 'Contact Message',
  applicant: 'Job Application'
};

function adminNotification(data) {
  const label = FORM_LABELS[data.formType] || 'Form Submission';
  const rows = (data.fields || [])
    .map(f => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid rgba(200,155,20,.1);font-family:Arial,sans-serif;font-size:12px;color:rgba(242,237,228,.5);text-transform:uppercase;letter-spacing:.04em;width:140px;">${f.label}</td>
        <td style="padding:8px 0;border-bottom:1px solid rgba(200,155,20,.1);font-family:Arial,sans-serif;font-size:14px;color:#F2EDE4;">${f.value || '—'}</td>
      </tr>
    `).join('');

  const bodyHtml = `
    <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:12px;color:#C89B14;text-transform:uppercase;letter-spacing:.08em;">New ${label}</p>
    <h1 style="margin:0 0 20px;font-family:Georgia,serif;font-size:24px;color:#F2EDE4;">${data.name || 'Someone'} just submitted a ${label.toLowerCase()}</h1>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      ${rows}
    </table>
    ${data.adminUrl ? button('View in Admin Panel', data.adminUrl) : ''}
  `;
  return defaultLayout({ preheader: `New ${label} from ${data.name || 'a visitor'}`, bodyHtml });
}

module.exports = { adminNotification };
