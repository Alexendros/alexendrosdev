import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { services } from '../src/content/services';
import { projects } from '../src/content/projects';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'og');

// Paleta de marca (docs/design-system.md): azul profundo sobre papel claro.
const BRAND = '#0f3778';
const PAPER = '#f6f8fc';
const LINE = '#d9e0ee';

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Parte un texto en líneas de ~maxChars sin cortar palabras (máx. 2 líneas;
    si hay truncado, la segunda línea cierra con "…"). */
function wrap(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  let truncated = false;
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
      if (lines.length === 2) {
        truncated = true;
        break;
      }
    } else {
      line = next;
    }
  }
  if (!truncated && line) {
    if (lines.length === 2) truncated = true;
    else lines.push(line);
  }
  if (truncated && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/[.,;:]$/, '')}…`;
  }
  return lines;
}

function ogSvg(kicker: string, title: string, subtitle: string): string {
  // DejaVu Sans Bold a 68px avanza ~39px/carácter desde x=80: el máximo
  // seguro antes del borde interior (x=1152) son ~25 caracteres.
  const titleLines = wrap(title, 25);
  const subtitleLines = wrap(subtitle, 58);
  const titleTspans = titleLines
    .map(
      (l, i) =>
        `<text x="80" y="${280 + i * 84}" fill="${PAPER}" font-family="DejaVu Sans, sans-serif" font-size="68" font-weight="700">${escapeXml(l)}</text>`
    )
    .join('\n  ');
  const subTspans = subtitleLines
    .map(
      (l, i) =>
        `<text x="80" y="${300 + titleLines.length * 84 + i * 40}" fill="${LINE}" font-family="DejaVu Sans, sans-serif" font-size="30">${escapeXml(l)}</text>`
    )
    .join('\n  ');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${BRAND}"/>
  <rect x="48" y="48" width="1104" height="534" rx="24" fill="none" stroke="${PAPER}" stroke-opacity="0.25" stroke-width="2"/>
  <text x="80" y="150" fill="${LINE}" font-family="DejaVu Sans Mono, monospace" font-size="26" letter-spacing="6">${escapeXml(kicker)}</text>
  ${titleTspans}
  ${subTspans}
  <text x="80" y="560" fill="${PAPER}" font-family="DejaVu Sans Mono, monospace" font-size="24" font-weight="700">alexendros.dev</text>
</svg>`;
}

async function writeOg(relPath: string, kicker: string, title: string, subtitle: string) {
  const out = join(outDir, relPath);
  mkdirSync(dirname(out), { recursive: true });
  await sharp(Buffer.from(ogSvg(kicker, title, subtitle)))
    .png()
    .toFile(out);
  console.log('Wrote', out);
}

await writeOg(
  'default.png',
  'DISEÑO WEB · VALENCIA',
  'Webs claras y útiles',
  'Para profesionales y pequeños negocios'
);
for (const s of services) {
  await writeOg(`servicios/${s.slug}.png`, 'SERVICIO', s.title, s.short);
}
for (const p of projects) {
  await writeOg(`proyectos/${p.slug}.png`, 'CASO', p.title, p.short);
}
