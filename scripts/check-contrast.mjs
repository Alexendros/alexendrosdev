// Valida el contraste WCAG de los tokens de producto (global.css) y de los
// temas daisyUI alexlight/alexdark (theme.css). Uso: pnpm check:contrast.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractThemes,
  extractDaisyThemes,
  resolveValue,
  toRgb,
  ratio,
  mix
} from './contrast-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const themeCss = readFileSync(join(root, 'src/styles/theme.css'), 'utf8');

const SEMANTIC = [
  'bg',
  'bg-subtle',
  'fg',
  'fg-muted',
  'brand',
  'brand-hover',
  'brand-fg',
  'border',
  'border-strong',
  'card',
  'danger',
  'primary-ghost'
];

const PAIRS = [
  ['fg/bg (texto principal)', 'fg', 'bg', 4.5],
  ['fg-muted/bg (texto secundario)', 'fg-muted', 'bg', 4.5],
  ['brand-fg/brand (texto de CTAs)', 'brand-fg', 'brand', 4.5],
  ['brand/bg (acento como texto)', 'brand', 'bg', 4.5],
  ['fg/card (texto en tarjetas)', 'fg', 'card', 4.5],
  ['fg-muted/card (secundario en tarjetas)', 'fg-muted', 'card', 4.5],
  ['danger/card (errores en tarjetas)', 'danger', 'card', 4.5],
  ['danger/bg (errores sobre fondo)', 'danger', 'bg', 4.5],
  ['brand-fg/brand-hover (CTAs en hover)', 'brand-fg', 'brand-hover', 4.5],
  ['brand/card (acento como texto en tarjetas)', 'brand', 'card', 4.5],
  ['fg/bg-subtle (texto sobre fondo sutil)', 'fg', 'bg-subtle', 4.5],
  ['fg/primary-ghost (texto sobre superficie ghost)', 'fg', 'primary-ghost', 4.5],
  ['border-strong/card (frontera de inputs)', 'border-strong', 'card', 3.0],
  ['border-strong/bg (frontera de inputs)', 'border-strong', 'bg', 3.0]
];

const DAISY_ROLES = [
  'base-100',
  'base-200',
  'base-300',
  'base-content',
  'primary',
  'primary-content',
  'secondary',
  'secondary-content',
  'accent',
  'accent-content',
  'neutral',
  'neutral-content',
  'info',
  'info-content',
  'success',
  'success-content',
  'warning',
  'warning-content',
  'error',
  'error-content'
];

let failed = 0;
/** @type {string[]} */
const softWarnings = [];

function validateTheme(label, props) {
  const resolved = {};
  for (const name of SEMANTIC) {
    if (!(name in props)) {
      failed += 1;
      console.log(`FAIL  ${label}: falta --${name}`);
      continue;
    }
    try {
      resolved[name] = resolveValue(props[name], props);
    } catch (err) {
      failed += 1;
      console.log(`FAIL  ${label}: no se pudo resolver --${name}: ${err.message}`);
    }
  }
  const bg = toRgb(resolved.bg, [255, 255, 255]);
  const card = toRgb(resolved.card, bg);

  for (const [name, fgName, bgName, min] of PAIRS) {
    if (!resolved[fgName] || !resolved[bgName]) continue;
    const fgRgb = toRgb(resolved[fgName], bg);
    const backdrop = toRgb(resolved[bgName], bg);
    const r = ratio(fgRgb, backdrop);
    const ok = r >= min;
    if (!ok) failed += 1;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} ${name}: ${r.toFixed(2)}:1 (mínimo ${min}:1)`);
  }

  if (resolved.brand) {
    const ringRaw = props['focus-ring'] ?? '';
    const ringMatch = ringRaw.match(
      /color-mix\(in srgb, var\([^)]+\)\s+[\d.]+%\s*,\s*transparent\)/
    );
    if (!ringMatch) {
      failed += 1;
      console.log(`FAIL  ${label}: --focus-ring sin color-mix reconocible`);
    } else {
      const ring = resolveValue(ringMatch[0], props);
      const ringRgb = toRgb(ring, bg);
      const rBg = ratio(ringRgb, bg);
      const rCard = ratio(ringRgb, card);
      const ok = Math.min(rBg, rCard) >= 3.0;
      if (!ok) failed += 1;
      console.log(
        `${ok ? 'PASS' : 'FAIL'}  ${label} focus-ring sobre bg/card: ${Math.min(rBg, rCard).toFixed(2)}:1 (mínimo 3:1)`
      );
    }
  }
}

function daisyKey(role) {
  return `color-${role}`;
}

function validateDaisyTheme(label, props) {
  const resolved = {};
  for (const role of DAISY_ROLES) {
    const key = daisyKey(role);
    if (!(key in props)) {
      failed += 1;
      console.log(`FAIL  ${label}: falta --${key}`);
      continue;
    }
    try {
      resolved[role] = resolveValue(props[key], props);
    } catch (err) {
      failed += 1;
      console.log(`FAIL  ${label}: no se pudo resolver --${key}: ${err.message}`);
    }
  }

  const contentPairs = [
    ['primary', 'primary-content'],
    ['secondary', 'secondary-content'],
    ['accent', 'accent-content'],
    ['neutral', 'neutral-content'],
    ['info', 'info-content'],
    ['success', 'success-content'],
    ['warning', 'warning-content'],
    ['error', 'error-content']
  ];

  for (const [bgRole, fgRole] of contentPairs) {
    if (!resolved[bgRole] || !resolved[fgRole]) continue;
    const r = ratio(toRgb(resolved[fgRole]), toRgb(resolved[bgRole]));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} ${fgRole}/${bgRole}: ${r.toFixed(2)}:1 (mínimo 4.5:1)`
    );
  }

  for (const base of ['base-100', 'base-200', 'base-300']) {
    if (!resolved['base-content'] || !resolved[base]) continue;
    const r = ratio(toRgb(resolved['base-content']), toRgb(resolved[base]));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} base-content/${base}: ${r.toFixed(2)}:1 (mínimo 4.5:1)`
    );
  }

  // text-accent y badge-accent sobre bases.
  for (const base of ['base-100', 'base-200']) {
    if (!resolved.accent || !resolved[base]) continue;
    const r = ratio(toRgb(resolved.accent), toRgb(resolved[base]));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} text-accent/${base}: ${r.toFixed(2)}:1 (mínimo 4.5:1)`
    );
  }

  if (resolved['accent-content'] && resolved.accent) {
    const r = ratio(toRgb(resolved['accent-content']), toRgb(resolved.accent));
    const ok = r >= 4.5;
    if (!ok) failed += 1;
    console.log(
      `${ok ? 'PASS' : 'FAIL'}  ${label} badge-accent (accent-content/accent): ${r.toFixed(2)}:1 (mínimo 4.5:1)`
    );
  }

  // badge-soft ≈ texto accent sobre mezcla 20% accent + base.
  for (const base of ['base-100', 'base-200']) {
    if (!resolved.accent || !resolved[base]) continue;
    const softBg = mix(toRgb(resolved.accent), toRgb(resolved[base]), 0.2);
    const r = ratio(toRgb(resolved.accent), softBg);
    const ok = r >= 4.5;
    if (!ok) {
      softWarnings.push(`${label} badge-soft/accent sobre ${base}: ${r.toFixed(2)}:1`);
      console.log(
        `WARN  ${label} badge-soft accent/${base}: ${r.toFixed(2)}:1 (<4.5; fase 2 usa badge-outline)`
      );
    } else {
      console.log(`PASS  ${label} badge-soft accent/${base}: ${r.toFixed(2)}:1 (mínimo 4.5:1)`);
    }
  }
}

const { light, dark, darkConsistent, darkPartial } = extractThemes(css);
validateTheme('claro', light);
if (darkPartial) {
  failed += 1;
  console.log(
    'FAIL  tema oscuro: existe @tema-oscuro pero falta una de las dos variantes (@media o data-theme)'
  );
} else if (dark && Object.keys(dark).length > 0) {
  if (!darkConsistent) {
    failed += 1;
    console.log('FAIL  tema oscuro: las variantes @media y data-theme no coinciden');
  }
  validateTheme('oscuro', dark);
} else {
  console.log('INFO  tema oscuro de producto no publicado (sin bloque @tema-oscuro)');
}

const daisyThemes = extractDaisyThemes(themeCss);
for (const name of ['alexlight', 'alexdark']) {
  if (!daisyThemes[name]) {
    failed += 1;
    console.log(`FAIL  falta tema daisyUI ${name} en theme.css`);
    continue;
  }
  validateDaisyTheme(name, daisyThemes[name]);
}

/* Literales oklch: solo en theme.css. */
const oklchInGlobal = (css.match(/oklch\(/g) ?? []).length;
if (oklchInGlobal > 0) {
  failed += 1;
  console.log(
    `FAIL  global.css contiene ${oklchInGlobal} literal(es) oklch (deben vivir en theme.css)`
  );
} else {
  console.log('PASS  global.css sin literales oklch (paleta hex en @layer theme)');
}

const layout = readFileSync(join(root, 'src/layouts/Layout.astro'), 'utf8');
const themeLight = layout.match(
  /theme-color[^>]*content="(#[0-9a-fA-F]{3,8})"[^>]*prefers-color-scheme:\s*light/
);
const themeDark = layout.match(
  /theme-color[^>]*content="(#[0-9a-fA-F]{3,8})"[^>]*prefers-color-scheme:\s*dark/
);
const paper50 = css.match(/--paper-50:\s*(#[0-9a-fA-F]{3,8})/);
const darkBg = css.match(
  /@media\s*\(prefers-color-scheme:\s*dark\)[\s\S]*?--bg:\s*(#[0-9a-fA-F]{3,8})/
);
if (!themeLight || !themeDark || !paper50 || !darkBg) {
  failed += 1;
  console.log('FAIL  no se pudieron leer theme-color o tokens --paper-50/--bg oscuro');
} else if (
  themeLight[1].toLowerCase() !== paper50[1].toLowerCase() ||
  themeDark[1].toLowerCase() !== darkBg[1].toLowerCase()
) {
  failed += 1;
  console.log(
    `FAIL  theme-color (${themeLight[1]}/${themeDark[1]}) ≠ tokens (${paper50[1]}/${darkBg[1]})`
  );
} else {
  console.log(
    `PASS  theme-color alineado a tokens (${themeLight[1]} claro / ${themeDark[1]} oscuro)`
  );
}

if (softWarnings.length) {
  console.log(
    `\nINFO  badge-soft por debajo de AA en ${softWarnings.length} par(es); la fase 2 usará badge-outline.`
  );
}

if (failed > 0) {
  console.error(`\n${failed} comprobación(es) fallida(s).`);
  process.exit(1);
}
console.log('\nContraste y fuente única: OK.');
