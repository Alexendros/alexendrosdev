import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Conserva redirects históricos de web-para (no reintroducir la ruta). */
describe('redirects web-para (vercel.json)', () => {
  it('mantiene 301 de /servicios/web-para hacia /#servicios', () => {
    const raw = readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8');
    const config = JSON.parse(raw) as {
      redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
    };
    const hits = (config.redirects ?? []).filter((item) =>
      item.source.startsWith('/servicios/web-para')
    );
    expect(hits.length).toBeGreaterThanOrEqual(1);
    for (const hit of hits) {
      expect(hit.destination).toBe('/#servicios');
      expect(hit.permanent).toBe(true);
    }
  });
});
