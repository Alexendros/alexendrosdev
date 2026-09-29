#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const INVENTORY_PATH = join(ROOT, 'docs', 'cookies-inventory.json');
const SELF = fileURLToPath(import.meta.url);

const SCAN_ROOTS = [
  { label: 'src', dir: join(ROOT, 'src') },
  { label: 'static', dir: join(ROOT, '.vercel', 'output', 'static') }
];

const TEXT_EXTENSIONS = new Set([
  '.js',
  '.mjs',
  '.cjs',
  '.ts',
  '.tsx',
  '.jsx',
  '.astro',
  '.html',
  '.css',
  '.json',
  '.txt',
  '.svg',
  '.xml',
  '.map',
  '.webmanifest'
]);

const HARDCODED_PIXEL_HOSTS = [
  'googletagmanager.com',
  'google-analytics.com',
  'connect.facebook.net',
  'clarity.ms',
  'i.posthog.com',
  'snap.licdn.com',
  'doubleclick.net',
  'analytics.tiktok.com',
  'static.ads-twitter.com'
];

const KNOWN_TRACKER_COOKIES = [
  '_ga',
  '_ga_*',
  '_gid',
  '_gat',
  '_gac_*',
  '_gcl_au',
  '_fbp',
  '_fbc',
  '_clck',
  '_clsk',
  'ph_*_posthog',
  'li_sugr',
  'li_fat_id',
  'bcookie',
  'bscookie',
  '_uetvid',
  '_uetsid',
  'IDE',
  'NID',
  'ANID',
  'DSID',
  '__hstc',
  '__hssc',
  '__hssrc',
  'hubspotutk',
  'ajs_*',
  'amplitude_id*',
  'mp_*_mixpanel',
  'intercom-*'
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patternToBody(pattern) {
  return pattern.split('*').map(escapeRegExp).join('.*');
}

function toMatcher(pattern) {
  return new RegExp(`^${patternToBody(pattern)}$`);
}

function toScanner(pattern) {
  const body = patternToBody(pattern);
  if (pattern.includes('*')) return new RegExp(body, 'g');
  return new RegExp(`(?<![A-Za-z0-9_])${body}(?![A-Za-z0-9_])`, 'g');
}

function isListed(name, inventoryMatchers) {
  return inventoryMatchers.some((matcher) => matcher.test(name));
}

function loadInventory() {
  if (!existsSync(INVENTORY_PATH)) {
    throw new Error(`No existe el inventario: ${relative(ROOT, INVENTORY_PATH)}`);
  }
  const parsed = JSON.parse(readFileSync(INVENTORY_PATH, 'utf8'));
  const cookies = Array.isArray(parsed.cookies) ? parsed.cookies : [];
  const patterns = cookies
    .map((cookie) => (typeof cookie?.name === 'string' ? cookie.name : null))
    .filter((name) => Boolean(name));
  const known = Array.isArray(parsed.knownCookies) ? parsed.knownCookies : [];
  return { patterns, known };
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      yield full;
    }
  }
}

function collectFiles() {
  const files = [];
  for (const root of SCAN_ROOTS) {
    if (!existsSync(root.dir)) continue;
    for (const file of walk(root.dir)) {
      if (file === SELF) continue;
      if (!TEXT_EXTENSIONS.has(file.slice(file.lastIndexOf('.')))) continue;
      let size = 0;
      try {
        size = statSync(file).size;
      } catch {
        continue;
      }
      if (size > 2_000_000) continue;
      files.push({ root: root.label, file });
    }
  }
  return files;
}

function readText(file) {
  try {
    const buffer = readFileSync(file);
    if (buffer.includes(0)) return null;
    return buffer.toString('utf8');
  } catch {
    return null;
  }
}

function scanText(text, source, scans, inventoryMatchers, violations) {
  for (const scan of scans) {
    for (const match of text.matchAll(scan.regex)) {
      const name = match[0];
      if (!isListed(name, inventoryMatchers)) {
        violations.push({
          kind: 'cookie',
          name,
          origin: scan.label,
          source
        });
      }
    }
  }

  const assignment = /document\.cookie\s*=\s*[`'"]([^=;`'"]+)=/g;
  for (const match of text.matchAll(assignment)) {
    const name = match[1].trim();
    if (name && !isListed(name, inventoryMatchers)) {
      violations.push({ kind: 'assignment', name, origin: 'document.cookie', source });
    }
  }

  const setCookie = /Set-Cookie["'`\s:]*([A-Za-z0-9_.-]+)=/gi;
  for (const match of text.matchAll(setCookie)) {
    const name = match[1].trim();
    if (name && !isListed(name, inventoryMatchers)) {
      violations.push({ kind: 'set-cookie', name, origin: 'Set-Cookie', source });
    }
  }
}

function scanHardcodedPixels(text, source, violations) {
  const pixel = /<(?:script|img|iframe)[^>]+(?:src|href)\s*=\s*["'][^"']*([^"'/]+)[^"']*["']/gi;
  for (const match of text.matchAll(pixel)) {
    const url = match[0];
    const host = HARDCODED_PIXEL_HOSTS.find((candidate) => url.includes(candidate));
    if (host) {
      violations.push({ kind: 'pixel', name: host, origin: 'html', source });
    }
  }
}

async function runDynamic(baseUrl) {
  let chromium;
  try {
    ({ chromium } = await import('@playwright/test'));
  } catch {
    try {
      ({ chromium } = await import('playwright'));
    } catch {
      console.warn('[cookies:audit] Playwright no disponible; se omite la fase dinámica.');
      return [];
    }
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  const routes = ['/', '/servicios/', '/proyectos/', '/como-trabajo/', '/contacto/', '/cookies'];

  try {
    await page.goto(new URL('/', baseUrl).href, { waitUntil: 'domcontentloaded' });
    const accept = page.getByRole('button', { name: 'Aceptar todo' }).first();
    await accept.click({ timeout: 10_000 });
    for (const route of routes) {
      await page
        .goto(new URL(route, baseUrl).href, { waitUntil: 'domcontentloaded' })
        .catch(() => {});
    }
    const cookies = await context.cookies();
    return cookies.map((cookie) => cookie.name);
  } finally {
    await browser.close();
  }
}

async function main() {
  const { patterns, known } = loadInventory();
  const allPatterns = [...patterns, ...known, ...KNOWN_TRACKER_COOKIES];
  const inventoryMatchers = patterns.map(toMatcher);
  const scans = allPatterns.map((pattern) => ({
    pattern,
    label: pattern,
    regex: toScanner(pattern)
  }));

  const files = collectFiles();
  const violations = [];

  for (const { root, file } of files) {
    const text = readText(file);
    if (text === null) continue;
    const source = relative(ROOT, file);
    scanText(text, source, scans, inventoryMatchers, violations);
    if (root === 'static' && file.endsWith('.html')) {
      scanHardcodedPixels(text, source, violations);
    }
  }

  console.log(`[cookies:audit] Inventario: ${patterns.length} cookies declaradas.`);
  console.log(`[cookies:audit] Archivos analizados (estático): ${files.length}.`);

  if (process.env.AUDIT_BASE_URL) {
    console.log(`[cookies:audit] Fase dinámica contra ${process.env.AUDIT_BASE_URL}...`);
    try {
      const cookieNames = await runDynamic(process.env.AUDIT_BASE_URL);
      if (cookieNames.length > 0) {
        for (const name of cookieNames) {
          if (!isListed(name, inventoryMatchers)) {
            violations.push({
              kind: 'runtime-cookie',
              name,
              origin: 'playwright',
              source: 'runtime'
            });
          }
        }
        console.log(`[cookies:audit] Cookies observadas en runtime: ${cookieNames.join(', ')}.`);
      }
    } catch (error) {
      console.warn(
        `[cookies:audit] Fase dinámica omitida: ${error instanceof Error ? error.message : error}`
      );
    }
  }

  if (violations.length > 0) {
    console.error('\n[cookies:audit] FALLÓ: se detectaron cookies o píxeles no declarados:\n');
    for (const violation of violations) {
      console.error(
        `  - [${violation.kind}] "${violation.name}" (${violation.origin}) en ${violation.source}`
      );
    }
    console.error('\nAñade estas cookies a docs/cookies-inventory.json o elimina la referencia.');
    process.exitCode = 1;
    return;
  }

  console.log('[cookies:audit] OK: no hay cookies ni píxeles de terceros fuera del inventario.');
}

main().catch((error) => {
  console.error('[cookies:audit] Error inesperado:', error);
  process.exitCode = 1;
});
