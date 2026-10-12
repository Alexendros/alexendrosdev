import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractThemes, resolveValue, toRgb, rgbToHex } from '../../scripts/contrast-lib.mjs';

const root = process.cwd();
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
const { light, dark } = extractThemes(css) as unknown as {
  light: Record<string, string>;
  dark: Record<string, string>;
};

const metaColors = [
  ...layout.matchAll(
    /<meta name="theme-color" content="#([0-9a-f]{6})" media="\(prefers-color-scheme: (light|dark)\)" \/>/g
  )
];

const bgHex = (theme: Record<string, string>) =>
  rgbToHex(toRgb(resolveValue(theme.bg, theme), [255, 255, 255]));

describe('theme-color sincronizado con --bg', () => {
  it('hay un meta theme-color por tema', () => {
    expect(metaColors.map((m) => m[2])).toEqual(['light', 'dark']);
  });

  it('el meta claro coincide con --bg del tema claro', () => {
    const meta = metaColors.find((m) => m[2] === 'light');
    expect(meta).toBeDefined();
    expect(bgHex(light)).toBe(`#${meta?.[1]}`);
  });

  it('el meta oscuro coincide con --bg del tema oscuro', () => {
    const meta = metaColors.find((m) => m[2] === 'dark');
    expect(meta).toBeDefined();
    expect(bgHex(dark)).toBe(`#${meta?.[1]}`);
  });
});
