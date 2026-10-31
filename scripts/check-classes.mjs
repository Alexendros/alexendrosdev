#!/usr/bin/env node
/**
 * Guardrail de markup en .astro/.tsx/.ts/.js bajo src/:
 * sombras Tailwind por defecto, /alpha de tema, hex, bg-black/text-white,
 * style=, is:inline e innerHTML.
 * El JSON-LD (`type="application/ld+json"`) puede vivir en la página sin is:inline.
 * Uso: pnpm check:classes
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const TARGET_DIRS = ['src'];
const EXT = /\.(astro|tsx|ts|js)$/;

const RULES = [
  {
    id: 'shadow-default',
    re: /\bshadow-(?:sm|md|lg|xl|2xl)\b/,
    message: 'usa var(--shadow-*) / clase propia, no shadow-(sm|md|lg|xl|2xl)',
    markupOnly: true
  },
  {
    id: 'theme-alpha',
    re: /\b(?:bg|text|border)-(?:bg|fg|primary|primaryHover|primarySoft|primaryGhost|muted|border|card|ink|danger|subtle|scrim)\/\d+\b/,
    message: 'Tailwind v3 no aplica /N sobre var(); usa color-mix o token',
    markupOnly: true
  },
  {
    id: 'arbitrary-hex',
    re: /\[[^\]]*?#[0-9a-fA-F]{3,8}[^\]]*?\]/,
    message: 'hex arbitrario en clase; usa tokens semánticos',
    markupOnly: true
  },
  {
    id: 'bg-black',
    re: /\bbg-black\b/,
    message: 'bg-black prohibido; usa tokens',
    markupOnly: true
  },
  {
    id: 'text-white',
    re: /\btext-white\b/,
    message: 'text-white prohibido; usa text-ink / tokens',
    markupOnly: true
  },
  {
    id: 'style-attr',
    re: /\bstyle\s*=/,
    message: 'atributo style= prohibido; usa clases o CSS',
    markupOnly: true
  },
  {
    id: 'is-inline',
    re: /\bis:inline\b/,
    message: 'is:inline prohibido (JSON-LD va sin is:inline en la página)',
    markupOnly: false
  },
  {
    id: 'inner-html',
    re: /\.innerHTML\b/,
    message: 'innerHTML prohibido; usa DOM APIs o <template>',
    markupOnly: false
  }
];

function walk(dir, files = []) {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name.startsWith('.')) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, files);
    else if (EXT.test(name) && !/\.test\.(ts|tsx|js)$/.test(name)) files.push(p);
  }
  return files;
}

function stripFrontmatterAndScripts(source) {
  return source
    .replace(/^---[\s\S]*?---\s*/, '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script\b[^>]*>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style\b[^>]*>/gi, ' ');
}

export function scanSource(source, fileLabel = 'input') {
  const hits = [];
  const markup = stripFrontmatterAndScripts(source);
  for (const rule of RULES) {
    const haystack = rule.markupOnly ? markup : source;
    rule.re.lastIndex = 0;
    if (!rule.re.test(haystack)) continue;
    rule.re.lastIndex = 0;
    const m = haystack.match(rule.re);
    hits.push({ file: fileLabel, id: rule.id, snippet: m?.[0] ?? '', message: rule.message });
  }
  return hits;
}

export function scanRepo(root = ROOT) {
  const files = [];
  for (const d of TARGET_DIRS) walk(join(root, d), files);
  const hits = [];
  for (const file of files) {
    hits.push(...scanSource(readFileSync(file, 'utf8'), relative(root, file)));
  }
  return hits;
}

const invokedAsCli =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (invokedAsCli) {
  const hits = scanRepo();
  if (hits.length) {
    console.error('check:classes — clases prohibidas:');
    for (const h of hits) {
      console.error(`  ${h.file}: ${h.id} «${h.snippet}» — ${h.message}`);
    }
    process.exit(1);
  }
  console.log('check:classes OK');
}
