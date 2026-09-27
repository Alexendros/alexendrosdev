// Valida el contraste WCAG de los pares de color del design system (§3.1)
// y el guardrail de fuente única (los literales viven en global.css :root,
// tailwind.config.mjs solo referencia var()).
// Uso: node scripts/check-contrast.mjs
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const tailwind = readFileSync(join(root, 'tailwind.config.mjs'), 'utf8');

function parseOklch(value) {
  const m = value
    .trim()
    .match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\s*\)$/);
  if (!m) throw new Error(`No es oklch: ${value}`);
  return {
    L: Number(m[1]),
    C: Number(m[2]),
    H: Number(m[3]),
    A: m[4] === undefined ? 1 : Number(m[4])
  };
}

function oklchToLinearSrbg({ L, C, H }) {
  const rad = (H * Math.PI) / 180;
  const a = C * Math.cos(rad);
  const b = C * Math.sin(rad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ];
}

const toSrgb = (c) => {
  const cl = Math.min(1, Math.max(0, c));
  return cl <= 0.0031308 ? 12.92 * cl : 1.055 * cl ** (1 / 2.4) - 0.055;
};

// Compone un color con alfa sobre un fondo opaco (ambos en sRGB 0-1).
function composite(fg, bg) {
  const [fr, fgg, fb] = oklchToLinearSrbg(fg).map(toSrgb);
  if (fg.A >= 1) return [fr, fgg, fb];
  return [
    fr * fg.A + bg[0] * (1 - fg.A),
    fgg * fg.A + bg[1] * (1 - fg.A),
    fb * fg.A + bg[2] * (1 - fg.A)
  ];
}

function luminance([r, g, b]) {
  const f = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const vars = {};
for (const m of css.matchAll(/--([\w-]+)\s*:\s*(oklch\([^)]+\))/g)) vars[m[1]] = parseOklch(m[2]);

for (const v of ['bg', 'fg', 'primary', 'muted', 'border', 'card']) {
  if (!vars[v]) throw new Error(`Falta --${v} en :root`);
}

const bg = composite(vars.bg, [0, 0, 0]);
// Pares §3.1: [nombre, color texto (o fondo), fondo, mínimo AA]
const pairs = [
  ['fg/bg (texto principal)', 'fg', 'bg', 4.5],
  ['muted/bg (texto secundario)', 'muted', 'bg', 4.5],
  ['bg/primary (texto de CTAs)', 'bg', 'primary', 4.5],
  ['primary/bg (acento sobre fondo)', 'primary', 'bg', 3.0],
  ['fg/card (texto en tarjetas)', 'fg', 'card', 4.5],
  ['muted/card (secundario en tarjetas)', 'muted', 'card', 4.5]
];

let failed = 0;
for (const [name, fgName, bgName, min] of pairs) {
  const bgRgb = bgName === 'bg' ? bg : composite(vars[bgName], bg);
  const fgRgb = composite(vars[fgName], bgName === 'bg' ? bg : composite(vars[bgName], bg));
  void bgRgb;
  const r = ratio(fgRgb, bgName === 'bg' ? bg : composite(vars[bgName], bg));
  const ok = r >= min;
  if (!ok) failed += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}: ${r.toFixed(2)}:1 (mínimo ${min}:1)`);
}

// Par informativo: reserva Blueprint Lab (sin umbral bloqueante hasta fase 1).
if (vars['bp-bg'] && vars['bp-fg']) {
  const r = ratio(composite(vars['bp-fg'], [0, 0, 0]), composite(vars['bp-bg'], [0, 0, 0]));
  console.log(`INFO  bp-fg/bp-bg (reserva Blueprint Lab): ${r.toFixed(2)}:1`);
}

// Guardrail de fuente única: tailwind no debe contener literales oklch.
const literals = (tailwind.match(/oklch\(/g) ?? []).length;
if (literals > 0) {
  failed += 1;
  console.log(`FAIL  tailwind.config.mjs contiene ${literals} literal(es) oklch (usar var())`);
} else {
  console.log('PASS  tailwind.config.mjs sin literales oklch (referencia var())');
}

if (failed > 0) {
  console.error(`\n${failed} comprobación(es) fallida(s).`);
  process.exit(1);
}
console.log('\nContraste y fuente única: OK.');
