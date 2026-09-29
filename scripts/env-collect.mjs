#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CDP_URL = process.env.CDP_URL ?? 'http://127.0.0.1:9222';
const ENV_FILE = resolve(process.cwd(), '.env.local');
const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const OPEN_ONLY = args.has('--open-only');

const CONSTANTS = {
  PUBLIC_SITE_URL: 'https://alexendros.dev',
  PUBLIC_POSTHOG_HOST: 'https://eu.i.posthog.com',
  PUBLIC_GTM_SS_DOMAIN: 'metrics.alexendros.dev',
  PUBLIC_COOKIE_CONSENT_VERSION: '1',
  EMAIL_FROM: 'hola@alexendros.dev',
  EMAIL_FROM_NAME: 'Alexendros'
};

const TARGETS = [
  {
    keys: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    label: 'Upstash → base de datos → REST API',
    url: 'https://console.upstash.com/',
    patterns: [/https:\/\/[a-z0-9-]+\.upstash\.io/]
  },
  {
    keys: ['PUBLIC_TURNSTILE_SITE_KEY'],
    label: 'Cloudflare → Turnstile → sitio → Site Key',
    url: 'https://dash.cloudflare.com/?to=/:account/turnstile',
    patterns: [/0x4[A-Za-z0-9_-]{18,}/]
  },
  {
    keys: ['TURNSTILE_SECRET_KEY'],
    label: 'Cloudflare Turnstile → Secret Key (solo se muestra al crear)',
    url: 'https://dash.cloudflare.com/?to=/:account/turnstile',
    manual: true
  },
  {
    keys: ['NOTION_TOKEN'],
    label: 'Notion → integraciones internas → secreto',
    url: 'https://www.notion.so/my-integrations',
    patterns: [/\b(?:ntn|secret)_[A-Za-z0-9]{20,}/]
  },
  {
    keys: ['CAL_WEBHOOK_SECRET'],
    label: 'Cal.com → Developer → Webhooks → signing secret',
    url: 'https://app.cal.com/settings/developer/webhooks',
    manual: true
  },
  {
    keys: ['PUBLIC_GA4_ID'],
    label: 'GA4 → Admin → Data streams → Measurement ID',
    url: 'https://analytics.google.com/analytics/web/',
    patterns: [/\bG-[A-Z0-9]{6,12}\b/]
  },
  {
    keys: ['PUBLIC_GTM_ID'],
    label: 'GTM → contenedor web → Container ID',
    url: 'https://tagmanager.google.com/',
    patterns: [/\bGTM-[A-Z0-9]{4,9}\b/]
  },
  {
    keys: ['PUBLIC_POSTHOG_KEY'],
    label: 'PostHog EU → Project settings → Project API key',
    url: 'https://eu.posthog.com/project/settings',
    patterns: [/\bphc_[A-Za-z0-9]{20,}/]
  },
  {
    keys: ['PUBLIC_CLARITY_ID'],
    label: 'Clarity → proyecto → Project ID',
    url: 'https://clarity.microsoft.com/projects',
    manual: true
  },
  {
    keys: ['PUBLIC_META_PIXEL_ID', 'META_PIXEL_ID'],
    label: 'Meta → Events Manager → píxel → Pixel ID',
    url: 'https://business.facebook.com/events_manager2/list/pixel/',
    manual: true
  },
  {
    keys: ['META_CAPI_TOKEN'],
    label: 'Meta → Events Manager → Settings → Conversions API → token',
    url: 'https://business.facebook.com/events_manager2/list/pixel/',
    patterns: [/\bEAA[A-Za-z0-9]{30,}/]
  },
  {
    keys: ['META_CAPI_TEST_EVENT_CODE'],
    label: 'Meta → Events Manager → Test Events → Test Event Code',
    url: 'https://business.facebook.com/events_manager2/list/pixel/',
    patterns: [/\bTEST\d{3,}\b/]
  },
  {
    keys: ['PUBLIC_LINKEDIN_PARTNER_ID'],
    label: 'LinkedIn → Campaign Manager → Measure → Insight Tag → Partner ID',
    url: 'https://www.linkedin.com/campaignmanager/accounts',
    manual: true
  },
  {
    keys: ['RESEND_API_KEY'],
    label: 'Resend → API Keys → Sending access',
    url: 'https://resend.com/api-keys',
    patterns: [/\bre_[A-Za-z0-9]{8,}/]
  },
  {
    keys: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'],
    label: 'Proton → Settings → IMAP/SMTP → token SMTP',
    url: 'https://account.proton.me/mail/imap-smtp',
    manual: true
  },
  {
    keys: [],
    label: 'Resend → Domains → verificar alexendros.dev (SPF/DKIM)',
    url: 'https://resend.com/domains',
    manual: true
  },
  {
    keys: [],
    label: 'Google Tag Manager → contenedor Server-Side',
    url: 'https://tagmanager.google.com/',
    manual: true
  }
];

function _readEnvFile() {
  if (!existsSync(ENV_FILE)) return new Map();
  const entries = new Map();
  for (const line of readFileSync(ENV_FILE, 'utf8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) entries.set(match[1], match[2]);
  }
  return entries;
}

function writeEnvFile(found) {
  const lines = existsSync(ENV_FILE) ? readFileSync(ENV_FILE, 'utf8').split('\n') : [];
  const index = new Map();
  lines.forEach((line, position) => {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (match) index.set(match[1], position);
  });
  let written = 0;
  let skipped = 0;
  for (const [key, value] of found) {
    if (!value) continue;
    const position = index.get(key);
    if (position !== undefined) {
      if (!FORCE) {
        skipped += 1;
        continue;
      }
      lines[position] = `${key}=${value}`;
      written += 1;
      continue;
    }
    lines.push(`${key}=${value}`);
    index.set(key, lines.length - 1);
    written += 1;
  }
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') lines.pop();
  writeFileSync(ENV_FILE, `${lines.join('\n')}\n`, { mode: 0o600 });
  return { written, skipped };
}

async function scanPage(page, target) {
  const sources = [];
  for (const selector of target.selectors ?? []) {
    const locator = page.locator(selector).first();
    const count = await locator.count().catch(() => 0);
    if (!count) continue;
    sources.push(await locator.innerText().catch(() => ''));
    sources.push((await locator.getAttribute('value').catch(() => null)) ?? '');
  }
  sources.push(
    await page
      .locator('body')
      .innerText()
      .catch(() => '')
  );
  for (const source of sources) {
    if (!source) continue;
    for (const pattern of target.patterns ?? []) {
      const match = source.match(pattern);
      if (match) return match[0];
    }
  }
  return null;
}

function report(status, label, detail = '') {
  const icon = { auto: '✔', manual: '→', miss: '?', error: '✖' }[status] ?? '·';
  console.log(`${icon} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function main() {
  const found = new Map(Object.entries(CONSTANTS));
  if (!found.has('UNSUBSCRIBE_SECRET'))
    found.set('UNSUBSCRIBE_SECRET', randomBytes(32).toString('hex'));

  const browser = await chromium.connectOverCDP(CDP_URL).catch((error) => {
    console.error(`No se pudo conectar a Vivaldi en ${CDP_URL}`);
    console.error('Cierra Vivaldi y arráncalo con:  vivaldi --remote-debugging-port=9222');
    console.error(String(error?.message ?? error));
    process.exit(1);
  });

  const context = browser.contexts()[0];
  if (!context) {
    console.error('CDP conectado pero sin contexto de navegador utilizable.');
    process.exit(1);
  }

  for (const target of TARGETS) {
    let page;
    try {
      page = await context.newPage();
    } catch (error) {
      report('error', target.label, String(error?.message ?? error));
      continue;
    }
    try {
      await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
      await page.waitForTimeout(2_500);
      if (OPEN_ONLY || target.manual || !target.patterns?.length) {
        report('manual', target.label, 'abierto en Vivaldi');
        page = null;
        continue;
      }
      const value = await scanPage(page, target);
      if (value) {
        for (const key of target.keys) found.set(key, value);
        report('auto', target.label, target.keys.join(', '));
      } else {
        report('miss', target.label, 'no detectado; revisa la pestaña');
        page = null;
        continue;
      }
    } catch (error) {
      report('error', target.label, String(error?.message ?? error));
    } finally {
      if (page) await page.close().catch(() => {});
    }
  }

  const { written, skipped } = writeEnvFile(found);
  console.log('');
  console.log(
    `.env.local → ${written} valores escritos, ${skipped} conservados${FORCE ? '' : ' (usa --force para sobrescribir)'}`
  );
  console.log('Los valores no se imprimen: revísalos en .env.local');
  await browser.close().catch(() => {});
}

await main();
