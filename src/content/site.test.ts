import { describe, expect, it } from 'vitest';
import { site } from './site';

describe('site.nav', () => {
  it('R06: site.nav es Servicios, Referencias, Metodología hacia anclas', () => {
    expect(site.nav.map((i) => i.label)).toEqual(['Servicios', 'Referencias', 'Metodología']);
    expect(site.nav.map((i) => i.href)).toEqual(['/#servicios', '/#referencias', '/#metodo']);
    expect(site.nav.map((i) => i.href)).not.toContain('/metodologia');
    expect(site.nav.map((i) => i.href)).not.toContain('/proyectos');
  });
});
