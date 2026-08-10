const SEVERITY_EMOJI = {
  info: 'ℹ️',
  warning: '⚠️',
  critical: '🔴',
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatNotification({ title, service, severity, detail }) {
  const emoji = SEVERITY_EMOJI[severity];
  let html =
    `${emoji} <b>${escapeHtml(title)}</b>\n` +
    `<b>Servicio:</b> ${escapeHtml(service)}\n` +
    `<b>Severidad:</b> ${escapeHtml(severity.toUpperCase())}`;

  if (detail) {
    html += `\n\n${escapeHtml(detail)}`;
  }

  return html;
}

module.exports = { formatNotification };
