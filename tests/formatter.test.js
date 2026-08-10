const { formatNotification } = require('../src/lib/formatter');

describe('formatNotification', () => {
  test('renders title, service and severity in HTML layout', () => {
    const html = formatNotification({
      title: 'Backup completado',
      service: 'billing-worker',
      severity: 'info',
    });

    expect(html).toBe(
      'ℹ️ <b>Backup completado</b>\n' +
      '<b>Servicio:</b> billing-worker\n' +
      '<b>Severidad:</b> INFO'
    );
  });

  test('uses warning emoji for warning severity', () => {
    const html = formatNotification({ title: 't', service: 's', severity: 'warning' });
    expect(html.startsWith('⚠️')).toBe(true);
    expect(html).toContain('<b>Severidad:</b> WARNING');
  });

  test('uses critical emoji for critical severity', () => {
    const html = formatNotification({ title: 't', service: 's', severity: 'critical' });
    expect(html.startsWith('🔴')).toBe(true);
    expect(html).toContain('<b>Severidad:</b> CRITICAL');
  });

  test('appends detail after a blank line when present', () => {
    const html = formatNotification({
      title: 't',
      service: 's',
      severity: 'info',
      detail: '12.4 GB en 3m 12s',
    });
    expect(html.endsWith('\n\n12.4 GB en 3m 12s')).toBe(true);
  });

  test('omits detail section when not provided', () => {
    const html = formatNotification({ title: 't', service: 's', severity: 'info' });
    expect(html).not.toContain('\n\n');
  });

  test('escapes HTML special characters in all fields', () => {
    const html = formatNotification({
      title: '<script>alert("x")</script>',
      service: 'a & b',
      severity: 'info',
      detail: '5 < 6 & 7 > 4',
    });
    expect(html).toContain('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(html).toContain('a &amp; b');
    expect(html).toContain('5 &lt; 6 &amp; 7 &gt; 4');
    expect(html).not.toContain('<script>');
  });
});
