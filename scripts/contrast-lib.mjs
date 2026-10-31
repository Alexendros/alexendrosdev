// Utilidades puras de contraste y parsing de tokens, compartidas entre
// scripts/check-contrast.mjs (CI) y src/pages/design-system.astro (build).
// Sin dependencias ni E/S: el consumidor lee el CSS y pasa el string.

/* ---------- color (sRGB) ---------- */

export function hexToRgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`Hex inválido: ${hex}`);
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

export function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Mezcla por canal en sRGB (dos colores opacos, t en 0..1).
export function mix(a, b, t) {
  return a.map((v, i) => Math.round(v * t + b[i] * (1 - t)));
}

export function rgbToHex([r, g, b]) {
  const h = (v) => v.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/* ---------- parsing de tokens ---------- */

export function parseDeclarations(block) {
  // Sin comentarios: un `--x: y;` dentro de un comentario no debe
  // inyectar tokens basura ni romper la comparación de variantes.
  const clean = block.replace(/\/\*[\s\S]*?\*\//g, '');
  const props = {};
  const re = /--([\w-]+)\s*:\s*([^;]+);/g;
  let m;
  while ((m = re.exec(clean)) !== null) props[m[1]] = m[2].trim();
  return props;
}

// Extrae el bloque {...} que sigue a startRe con llaves balanceadas.
export function extractBlock(source, startRe) {
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
/** Convierte oklch(L% C H[/A]) a sRGB 0–255 (aproximación CSS Color 4). */
export function oklchToRgb(raw) {
  const m = raw
    .replace(/\s+/g, ' ')
    .trim()
    .match(/^oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.%]+)?\s*\)$/i);
  if (!m) throw new Error(`oklch inválido: ${raw}`);
  let L = Number(m[1]);
  if (L > 1) L /= 100;
  const C = Number(m[2]);
  const H = Number(m[3]);
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const mm = m_ ** 3;
  const s = s_ ** 3;
  const rLin = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s;
  const toSrgb = (c) => {
    const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(255, Math.max(0, v * 255)));
  };
  return [toSrgb(rLin), toSrgb(gLin), toSrgb(bLin)];
}

export function resolveValue(raw, props, chain = []) {
  const value = raw.replace(/\s+/g, ' ').trim();
  if (HEX_RE.test(value)) return hexToRgb(value);
  if (/^oklch\(/i.test(value)) return oklchToRgb(value);
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

export function toRgb(resolved, backdrop) {
  return resolved && resolved.mixBase ? mix(resolved.mixBase, backdrop, resolved.alpha) : resolved;
}

// Extrae los tokens de una hoja: tema claro (:root) y, si el bloque
// @tema-oscuro existe y sus dos variantes coinciden, tema oscuro.
export function extractThemes(css) {
  const rootBlock = extractBlock(css, /:root\s*\{/);
  if (!rootBlock) throw new Error('No se encontró el bloque :root');
  const light = parseDeclarations(rootBlock);

  const darkSectionMatch = css.match(/\/\*\s*@tema-oscuro:inicio[\s\S]*?@tema-oscuro:fin\s*\*\//);
  let dark = null;
  let darkConsistent = false;
  let darkPartial = false;
  if (darkSectionMatch) {
    const section = darkSectionMatch[0];
    const mediaBlock = extractBlock(section, /@media\s*\(prefers-color-scheme:\s*dark\)\s*\{/);
    const dataBlock = extractBlock(section, /:root\[data-theme='dark'\]\s*\{/);
    darkPartial = Boolean(mediaBlock) !== Boolean(dataBlock);
    if (mediaBlock && dataBlock) {
      const mediaProps = parseDeclarations(mediaBlock);
      const dataProps = parseDeclarations(dataBlock);
      // Comparación insensible al orden de declaraciones.
      const sorted = (o) =>
        Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
      darkConsistent = JSON.stringify(sorted(mediaProps)) === JSON.stringify(sorted(dataProps));
      dark = { ...light, ...mediaProps };
    }
  }
  return { light, dark, darkConsistent, darkPartial };
}

/**
 * Extrae bloques `@plugin "daisyui/theme" { … }` de theme.css.
 * Devuelve un mapa name → declaraciones (sin las claves name/default/…).
 */
export function extractDaisyThemes(css) {
  const themes = {};
  const re = /@plugin\s+"daisyui\/theme"\s*\{/g;
  let match;
  while ((match = re.exec(css)) !== null) {
    const open = css.indexOf('{', match.index);
    let depth = 0;
    let end = -1;
    for (let i = open; i < css.length; i += 1) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) throw new Error('Bloque daisyui/theme sin cerrar');
    const body = css.slice(open + 1, end);
    const props = {};
    for (const line of body.split(';')) {
      const trimmed = line.replace(/\/\*[\s\S]*?\*\//g, '').trim();
      if (!trimmed) continue;
      const colon = trimmed.indexOf(':');
      if (colon === -1) continue;
      let key = trimmed.slice(0, colon).trim();
      const val = trimmed.slice(colon + 1).trim();
      if (key.startsWith('--')) key = key.slice(2);
      props[key] = val;
    }
    const name = (props.name || '').replace(/^["']|["']$/g, '');
    if (!name) throw new Error('Tema daisyUI sin name');
    themes[name] = props;
  }
  return themes;
}
