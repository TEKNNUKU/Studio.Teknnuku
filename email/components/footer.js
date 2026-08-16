// Reusable footer for every TEKNNUKU email — consistent identity + unsubscribe.
function footer(unsubscribeUrl) {
  return `
    <tr>
      <td style="padding:28px 40px;background:#0e0e0e;border-radius:0 0 12px 12px;border-top:1px solid rgba(200,155,20,.15);">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <p style="margin:0 0 4px;font-family:Georgia,serif;font-weight:700;font-size:13px;color:#F2EDE4;">TEKNNUKU Studio</p>
              <p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:11px;color:rgba(242,237,228,.5);font-style:italic;">We Don't Just Build Websites. We Build Businesses That Grow.</p>
              <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;color:rgba(242,237,228,.4);">
                <a href="mailto:hello@teknnuku.xyz" style="color:#C89B14;text-decoration:none;">hello@teknnuku.xyz</a>
                &nbsp;·&nbsp;
                <a href="https://teknnuku.xyz" style="color:#C89B14;text-decoration:none;">teknnuku.xyz</a>
              </p>
              ${unsubscribeUrl ? `
              <p style="margin:14px 0 0;font-family:Arial,sans-serif;font-size:10px;color:rgba(242,237,228,.3);">
                Don't want these emails? <a href="${unsubscribeUrl}" style="color:rgba(242,237,228,.5);">Unsubscribe</a>
              </p>` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

module.exports = { footer };
