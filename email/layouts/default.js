const { header } = require('../components/header.js')
const { footer } = require('../components/footer.js')

// Every template produces just its inner content (a headline + body HTML
// string); this layout wraps that content in the consistent TEKNNUKU shell
// (dark card, gold accents, header/footer) so no template has to repeat
// boilerplate HTML or reinvent the visual identity.
function defaultLayout({ preheader, bodyHtml, unsubscribeUrl }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TEKNNUKU Studio</title>
</head>
<body style="margin:0;padding:0;background:#1a1510;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#1a1510;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          ${header()}
          <tr>
            <td style="padding:36px 40px;background:#111;">
              ${bodyHtml}
            </td>
          </tr>
          ${footer(unsubscribeUrl)}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

module.exports = { defaultLayout };
