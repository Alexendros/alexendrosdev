import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CAL_EMBED_SCRIPT, CAL_ORIGIN, calEventUrl, PUBLIC_CAL_LINKS } from './calBooking';

describe('calEventUrl', () => {
  it('compone las URLs canónicas de Cal.com', () => {
    expect(calEventUrl('alexendros/diagnostico')).toBe('https://cal.com/alexendros/diagnostico');
    expect(calEventUrl('/alexendros/sesion-tecnica')).toBe(
      'https://cal.com/alexendros/sesion-tecnica'
    );
  });
});

describe('CSP para embed Cal.com', () => {
  const vercel = JSON.parse(
    readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8')
  ) as {
    headers: { headers: { key: string; value: string }[] }[];
  };
  const csp =
    vercel.headers
      .flatMap((block) => block.headers)
      .find((h) => h.key === 'Content-Security-Policy')?.value ?? '';

  it('permite script, connect y frame de app.cal.com y cal.com', () => {
    expect(CAL_ORIGIN).toBe('https://cal.com');
    expect(CAL_EMBED_SCRIPT).toBe('https://app.cal.com/embed/embed.js');
    expect(PUBLIC_CAL_LINKS.some((link) => /retainer/i.test(link))).toBe(false);
    expect(csp).toMatch(/script-src[^;]*https:\/\/app\.cal\.com/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/app\.cal\.com/);
    expect(csp).toMatch(/connect-src[^;]*https:\/\/cal\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/app\.cal\.com/);
    expect(csp).toMatch(/frame-src[^;]*https:\/\/cal\.com/);
  });
});
