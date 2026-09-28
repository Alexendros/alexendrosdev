// Valida el contraste WCAG de los pares semánticos del design system
// (ADR 0011, tema claro editorial + tema oscuro opcional) y los
// guardrails de fuente única: los literales viven en global.css
// (primitivos hex + semánticos por var()); tailwind.config.mjs solo
// referencia var()/color-mix. La matemática de color y el parsing de
// tokens se comparten con src/pages/design-system.astro vía
// scripts/contrast-lib.mjs.
// Uso: node scripts/check-contrast.mjs — sale con 1 si algún par falla.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractThemes, resolveValue, toRgb, ratio } from './contrast-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const tailwind = readFileSync(join(root, 'tailwind.config.mjs'), 'utf8');

const SEMANTIC = [
  'bg',
  'bg-subtle',
  'fg',
  'fg-muted',
  'brand',
  'brand-hover',
  'brand-fg',
  'border',
  'card',
  'danger'
];

// [nombre, texto, fondo, mínimo]. --brand se usa como color de texto
// (precios, enlaces, kickers), así que su mínimo es 4.5:1, no 3:1.
const PAIRS = [
  ['fg/bg (texto principal)', 'fg', 'bg', 4.5],
  ['fg-muted/bg (texto secundario)', 'fg-muted', 'bg', 4.5],
  ['brand-fg/brand (texto de CTAs)', 'brand-fg', 'brand', 4.5],
  ['brand/bg (acento como texto)', 'brand', 'bg', 4.5],
  ['fg/card (texto en tarjetas)', 'fg', 'card', 4.5],
  ['fg-muted/card (secundario en tarjetas)', 'fg-muted', 'card', 4.5],
  ['danger/card (errores en tarjetas)', 'danger', 'card', 4.5],
  ['danger/bg (errores sobre fondo)', 'danger', 'bg', 4.5],
  ['brand-fg/brand-hover (CTAs en hover)', 'brand-fg', 'brand-hover', 4.5]
];

let failed = 0;

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
    // Los pares son colores opacos: se comparan directamente sobre el
    // fondo del propio par (bg, card, brand o brand-hover).
    const fgRgb = toRgb(resolved[fgName], bg);
    const backdrop = toRgb(resolved[bgName], bg);
    const r = ratio(fgRgb, backdrop);
    const ok = r >= min;
    if (!ok) failed += 1;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${label} ${name}: ${r.toFixed(2)}:1 (mínimo ${min}:1)`);
  }

  // Indicador de foco: la clase .focus-ring usa outline sólido --brand
  // (WCAG 1.4.11, ≥3:1 sobre fondo y tarjeta). El token --focus-ring es
  // un color-mix al 55%: se informa compuesto sobre ambos fondos.
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

const { light, dark, darkConsistent } = extractThemes(css);
validateTheme('claro ', light);
if (dark && Object.keys(dark).length > 0) {
  if (!darkConsistent) {
    failed += 1;
    console.log('FAIL  tema oscuro: las variantes @media y data-theme no coinciden');
  }
  validateTheme('oscuro', dark);
} else {
  console.log('INFO  tema oscuro no publicado (sin bloque @tema-oscuro)');
}

/* ---------- guardrails de fuente única ---------- */

const oklchInCss = (css.match(/oklch\(/g) ?? []).length;
if (oklchInCss > 0) {
  failed += 1;
  console.log(
    `FAIL  global.css contiene ${oklchInCss} literal(es) oklch (la paleta es hex en :root)`
  );
} else {
  console.log('PASS  global.css sin literales oklch (paleta hex en :root)');
}

const hexInTailwind = (tailwind.match(/#[0-9a-f]{3,8}\b/gi) ?? []).length;
const oklchInTailwind = (tailwind.match(/oklch\(/g) ?? []).length;
if (hexInTailwind + oklchInTailwind > 0) {
  failed += 1;
  console.log(
    `FAIL  tailwind.config.mjs contiene ${hexInTailwind} hex y ${oklchInTailwind} oklch (usar var()/color-mix)`
  );
} else {
  console.log('PASS  tailwind.config.mjs sin literales de color (referencia var()/color-mix)');
}

if (failed > 0) {
  console.error(`\n${failed} comprobación(es) fallida(s).`);
  process.exit(1);
}
console.log('\nContraste y fuente única: OK.');
