#!/usr/bin/env node
/**
 * Genera public/cv.pdf a partir de los campos de profile (sin copiar PDFs externos).
 * Uso: node scripts/build-cv-pdf.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const profilePath = resolve(root, 'src/content/profile.ts');
const outPath = resolve(root, 'public/cv.pdf');

const src = readFileSync(profilePath, 'utf8');

function extractString(key) {
  const re = new RegExp(`${key}:\\s*'((?:\\\\'|[^'])*)'`);
  const m = src.match(re);
  if (!m) return '';
  return m[1].replace(/\\'/g, "'");
}

function extractArrayBodies(blockKey) {
  const block = src.match(new RegExp(`${blockKey}:\\s*\\[([\\s\\S]*?)\\n\\s*\\],`));
  if (!block) return [];
  const titles = [...block[1].matchAll(/title:\\s*'((?:\\\\'|[^'])*)'/g)].map((m) =>
    m[1].replace(/\\'/g, "'")
  );
  const bodies = [...block[1].matchAll(/body:\\s*'((?:\\\\'|[^'])*)'/g)].map((m) =>
    m[1].replace(/\\'/g, "'")
  );
  return titles.map((title, i) => `${title}: ${bodies[i] ?? ''}`);
}

function extractStringList(key) {
  const block = src.match(new RegExp(`${key}:\\s*\\[([\\s\\S]*?)\\]`));
  if (!block) return [];
  return [...block[1].matchAll(/'((?:\\\\'|[^'])*)'/g)].map((m) => m[1].replace(/\\'/g, "'"));
}

const name = extractString('name');
const role = extractString('role');
const summary = extractString('summary');
const meta = extractString('metaLine');
const trajectory = extractString('trajectory');
const work = extractArrayBodies('workWithMe');
const trust = extractStringList('trustBar');

const lines = [
  name,
  role,
  meta,
  '',
  summary,
  '',
  'Trayectoria',
  trajectory,
  '',
  'Ventajas del encargo',
  ...work,
  '',
  'Modalidad de colaboración',
  ...trust.map((t) => `• ${t}`),
  '',
  '(Hueco anotado: voz en primera persona y bloque del libro — pendiente de Alejandro.)'
];

function escapePdf(text) {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrap(text, width = 90) {
  const words = text.split(/\s+/);
  const out = [];
  let row = '';
  for (const w of words) {
    const next = row ? `${row} ${w}` : w;
    if (next.length > width) {
      if (row) out.push(row);
      row = w;
    } else row = next;
  }
  if (row) out.push(row);
  return out.length ? out : [''];
}

const contentLines = [];
let y = 800;
for (const line of lines) {
  for (const part of wrap(line)) {
    contentLines.push(`BT /F1 11 Tf 50 ${y} Td (${escapePdf(part)}) Tj ET`);
    y -= 16;
    if (y < 50) break;
  }
  if (y < 50) break;
}

const stream = contentLines.join('\n');
const objects = [];
objects.push('1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj');
objects.push('2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj');
objects.push(
  '3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>endobj'
);
objects.push(
  `4 0 obj<< /Length ${Buffer.byteLength(stream, 'utf8')} >>stream\n${stream}\nendstream\nendobj`
);
objects.push('5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj');

let pdf = '%PDF-1.4\n';
const offsets = [0];
for (const obj of objects) {
  offsets.push(Buffer.byteLength(pdf, 'utf8'));
  pdf += `${obj}\n`;
}
const xref = Buffer.byteLength(pdf, 'utf8');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
for (let i = 1; i < offsets.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
pdf += `trailer<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, pdf);
console.log(`Wrote ${outPath}`);
