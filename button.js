// Reusable call-to-action button. Table-based for email client compatibility
// (real <button> and many CSS properties are unreliable across email clients).
function button(label, url) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
      <tr>
        <td style="border-radius:8px;background:linear-gradient(135deg,#C89B14,#daa820);">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 30px;font-family:Arial,sans-serif;font-weight:700;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#080808;text-decoration:none;">
            ${label} &rarr;
          </a>
        </td>
      </tr>
    </table>
  `;
}

module.exports = { button };
