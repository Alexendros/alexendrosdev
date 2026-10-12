#!/usr/bin/env node
/**
 * Detecta coma/punto y coma pegados a una letra minúscula en la misma línea
 * de literales JS y de texto markup en Astro/JSX (p. ej. «clientes,no»).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const TARGETS = [
  'src/content',
  'src/components/Hero.astro',
  'src/components/StickyCta.astro',
  'src/components/ExitIntent.tsx',
  'src/components/ContactForm.tsx',
  'src/components/consent/CookieBanner.tsx',
  'src/pages/index.astro',
  'src/pages/contacto.astro',
  'src/pages/cookies.astro',
  'src/pages/privacidad.astro',
  'src/pages/identidad.astro'
];
const EXT = /\.(astro|tsx|ts)$/;
const BAD_LINE = /[,;][a-záéíóúñü]/;

function stringLiterals(source) {
  const out = [];
  const re = /(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g;
  let m;
  while ((m = re.exec(source))) {
    const body = m[0].slice(1, -1);
    if (body.length < 4) continue;
    if (!/[a-záéíóúñü]/i.test(body)) continue;
    out.push(body);
  }
  return out;
}

/** Texto entre tags tras quitar frontmatter, script y style. */
function markupTextChunks(source) {
  let s = source.replace(/^---[\s\S]*?---\s*/, '');
  // Cierre con \s* antes de > (CodeQL js/bad-tag-filter).
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, ' ');
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, ' ');
  const out = [];
  const re = />([^<]+)</g;
  let m;
  while ((m = re.exec(s))) {
    const t = m[1].replace(/\{[^}]*\}/g, ' ').trim();
    if (t.length > 2 && /[a-záéíóúñü]/i.test(t)) out.push(t);
  }
  return out;
}

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (EXT.test(name)) files.push(p);
  }
  return files;
}

function collectFiles() {
  const files = [];
  for (const t of TARGETS) {
    const abs = join(ROOT, t);
    try {
      const st = statSync(abs);
      if (st.isDirectory()) walk(abs, files);
      else files.push(abs);
    } catch {
      /* ruta opcional */
    }
  }
  return files;
}

function scanChunks(file, chunks, hits) {
  for (const lit of chunks) {
    for (const line of lit.split('\n')) {
      if (!BAD_LINE.test(line)) continue;
      const m = line.match(BAD_LINE);
      hits.push({
        file: relative(ROOT, file),
        snippet: line.trim().slice(Math.max(0, (m?.index ?? 0) - 16), (m?.index ?? 0) + 20)
      });
    }
  }
}

const hits = [];
for (const file of collectFiles()) {
  const src = readFileSync(file, 'utf8');
  scanChunks(file, stringLiterals(src), hits);
  if (/\.(astro|tsx)$/.test(file)) {
    scanChunks(file, markupTextChunks(src), hits);
  }
}

if (hits.length) {
  console.error('check:copy — coma/punto y coma sin espacio antes de letra minúscula:');
  for (const h of hits) {
    console.error(`  ${h.file}: …${h.snippet}…`);
  }
  process.exit(1);
}

console.log('check:copy OK');
