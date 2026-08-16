// Reusable sign-off used at the end of the body content, before the footer.
function signature(name) {
  return `
    <p style="margin:28px 0 0;font-family:Arial,sans-serif;font-size:14px;color:rgba(242,237,228,.85);line-height:1.6;">
      — ${name || 'The TEKNNUKU Studio Team'}
    </p>
  `;
}

module.exports = { signature };
