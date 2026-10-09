import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Regresión: si se relajan CSP / frame-ancestors / HSTS en vercel.json,
 * este test falla. Complementa el threat-model (ASVS L1 cabeceras).
 */
describe('security headers (vercel.json)', () => {
  const config = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
    headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
  };

  const globalHeaders = config.headers?.find((h) => h.source === '/(.*)')?.headers ?? [];
  const byKey = Object.fromEntries(globalHeaders.map((h) => [h.key.toLowerCase(), h.value]));

  it('exige CSP con frame-ancestors none y sin unsafe-eval', () => {
    const csp = byKey['content-security-policy'] ?? '';
    expect(csp).toMatch(/frame-ancestors\s+'none'/);
    expect(csp).not.toMatch(/unsafe-eval/);
  });

  it('exige X-Frame-Options DENY y HSTS con preload', () => {
    expect(byKey['x-frame-options']?.toUpperCase()).toBe('DENY');
    expect(byKey['strict-transport-security'] ?? '').toMatch(/max-age=\d+/);
    expect(byKey['strict-transport-security'] ?? '').toMatch(/preload/i);
  });

  it('exige Referrer-Policy y X-Content-Type-Options', () => {
    expect(byKey['x-content-type-options']?.toLowerCase()).toBe('nosniff');
    expect(byKey['referrer-policy']).toBeTruthy();
  });
});
