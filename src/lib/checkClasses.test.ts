import { describe, expect, it } from 'vitest';
import { scanSource } from '../../scripts/check-classes.mjs';

describe('check:classes (C-08)', () => {
  it('falla con shadow-lg, /alpha, hex, bg-black y text-white', () => {
    // Concatenar evita que Tailwind escanee literales de clase en el fixture.
    const bad = [
      '<div class="',
      'shadow-' + 'lg',
      ' bg-primary' + '/50',
      ' text-[#' + 'ff0000]',
      ' bg-' + 'black',
      ' text-' + 'white',
      '"></div>'
    ].join('');
    const hits = scanSource(bad, 'fixture.astro');
    const ids = new Set(hits.map((h) => h.id));
    expect(ids.has('shadow-default')).toBe(true);
    expect(ids.has('theme-alpha')).toBe(true);
    expect(ids.has('arbitrary-hex')).toBe(true);
    expect(ids.has('bg-black')).toBe(true);
    expect(ids.has('text-white')).toBe(true);
  });

  it('acepta clases semánticas del design system', () => {
    const ok = `<div class="bg-card text-fg border-border shadow-none"></div>`;
    expect(scanSource(ok)).toEqual([]);
  });

  it('falla con style=, is:inline e innerHTML', () => {
    expect(
      scanSource('<p style="color:red">x</p>', 's.astro').some((h) => h.id === 'style-attr')
    ).toBe(true);
    expect(
      scanSource('<script is:inline></script>', 'i.astro').some((h) => h.id === 'is-inline')
    ).toBe(true);
    expect(scanSource('el.innerHTML = "x"', 'x.ts').some((h) => h.id === 'inner-html')).toBe(true);
  });
});
