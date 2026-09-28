// Valida el contraste WCAG de los pares semánticos del design system
// (ADR 0011, tema claro editorial + tema oscuro opcional) y los
// guardrails de fuente única: los literales viven en global.css
// (primitivos hex + semánticos por var()); tailwind.config.mjs solo
// referencia var()/color-mix.
// Uso: node scripts/check-contrast.mjs — sale con 1 si algún par falla.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const css = readFileSync(join(root, 'src/styles/global.css'), 'utf8');
const tailwind = readFileSync(join(root, 'tailwind.config.mjs'), 'utf8');

/* ---------- utilidades de color (sRGB) ---------- */

function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Hex inválido: ${hex}`);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Mezcla por canal en sRGB (dos colores opacos, t en 0..1).
function mix(a, b, t) {
  return a.map((v, i) => Math.round(v * t + b[i] * (1 - t)));
}

/* ---------- parsing de tokens ---------- */

function parseDeclarations(block) {
  const props = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(block)) !== null) props[m[1]] = m[2].trim();
  return props;
}

// Extrae el bloque {...} que sigue a startRe con llaves balanceadas.
function extractBlock(source, startRe) {
  const start = source.search(startRe);
  if (start === -1) return null;
  const open = source.indexOf('{', start);
  if (open === -1) throw new Error('Bloque CSS mal formado');
  let depth = 0;
  for (let i = open; i < source.length; i += 1) {
    if (source[i] === '{') depth += 1;
    else if (source[i] === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(open, i + 1);
    }
  }
  throw new Error('Bloque CSS sin cerrar');
}

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const VAR_RE = /^var\(\s*--([\w-]+)\s*\)$/;

// Resuelve un valor de token a RGB: hex directo, var() encadenado o
// color-mix(in srgb, X%%, transparent) sobre un fondo dado.
function resolveValue(raw, props, chain = []) {
  const value = raw.replace(/\s+/g, ' ').trim();
  if (HEX_RE.test(value)) return hexToRgb(value);
  const varMatch = value.match(VAR_RE);
  if (varMatch) {
    const name = varMatch[1];
    if (chain.includes(name)) throw new Error(`Ciclo en var(): ${[...chain, name].join(' → ')}`);
    if (!(name in props)) throw new Error(`Token --${name} sin definir`);
    return resolveValue(props[name], props, [...chain, name]);
  }
  const mixMatch = value.match(/^color-mix\(in srgb, var\(--([\w-]+)\) ([\d.]+)%, transparent\)$/);
  if (mixMatch) {
    const [, name, pct] = mixMatch;
    if (chain.includes(name)) throw new Error(`Ciclo en var(): ${[...chain, name].join(' → ')}`);
    if (!(name in props)) throw new Error(`Token --${name} sin definir`);
    const base = resolveValue(props[name], props, [...chain, name]);
    return { mixBase: base, alpha: Number(pct) / 100 };
  }
  throw new Error(`Valor de token no soportado: ${value}`);
}

function toRgb(resolved, backdrop) {
  return resolved && resolved.mixBase ? mix(resolved.mixBase, backdrop, resolved.alpha) : resolved;
}

/* ---------- extracción de temas ---------- */

const rootBlock = extractBlock(css, /:root\s*\{/);
if (!rootBlock) throw new Error('No se encontró el bloque :root en global.css');

const lightProps = parseDeclarations(rootBlock);

// Tema oscuro: solo se publica si existe el bloque marcado y sus dos
// variantes (media query y data-theme) coinciden exactamente.
const darkSectionMatch = css.match(/\/\*\s*@tema-oscuro:inicio[\s\S]*?@tema-oscuro:fin\s*\*\//);
let darkProps = null;
if (darkSectionMatch) {
  const section = darkSectionMatch[0];
  const mediaBlock = extractBlock(section, /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{/);
  const dataBlock = extractBlock(section, /:root\[data-theme='dark'\]\s*\{/);
  if (mediaBlock && dataBlock) {
    const mediaProps = parseDeclarations(mediaBlock);
    const dataProps = parseDeclarations(dataBlock);
    if (JSON.stringify(mediaProps) !== JSON.stringify(dataProps)) {
      console.log('FAIL  tema oscuro: las variantes @media y data-theme no coinciden');
      process.exit(1);
    }
    darkProps = { ...lightProps, ...mediaProps };
  }
}

/* ---------- pares a validar ---------- */

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

validateTheme('claro ', lightProps);
if (darkProps && Object.keys(darkProps).length > 0) {
  validateTheme('oscuro', darkProps);
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
