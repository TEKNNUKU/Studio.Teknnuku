// Reusable header bar for every TEKNNUKU email.
function header() {
  return `
    <tr>
      <td style="padding:32px 40px 24px;background:#080808;border-radius:12px 12px 0 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <span style="font-family:Georgia,serif;font-weight:800;font-size:20px;letter-spacing:.02em;color:#F2EDE4;text-transform:uppercase;">TEKNNUKU</span>
              <span style="font-family:Georgia,serif;font-weight:800;font-size:20px;letter-spacing:.02em;color:#C89B14;text-transform:uppercase;">Studio</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

module.exports = { header };
