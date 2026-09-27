/**
 * Capturas desktop/móvil para docs/audits/2026-09-28-simplificacion-v2/after/
 * Uso: PLAYWRIGHT_BROWSERS_PATH=$HOME/.cache/ms-playwright node scripts/capture-audit-shots.mjs
 * Requiere preview en http://127.0.0.1:4321
 */
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.AUDIT_BASE_URL ?? 'http://127.0.0.1:4321';
const OUT = path.resolve('docs/audits/2026-09-28-simplificacion-v2/after');

const routes = [
  { path: '/', name: 'home' },
  { path: '/servicios/', name: 'servicios' },
  { path: '/contacto/', name: 'contacto' },
  { path: '/sobre-mi/', name: 'sobre-mi' },
  { path: '/proyectos/front-valencia/', name: 'proyectos_front-valencia' }
];

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 360, height: 800 }
];

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  for (const route of routes) {
    await page.goto(`${BASE}${route.path}`, { waitUntil: 'networkidle' });
    // Dejar terminar reveal (400 ms) + un margen.
    await page.waitForTimeout(700);
    const file = path.join(OUT, `${route.name}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log('wrote', file);
  }
}

await browser.close();
console.log('OK capturas en', OUT);
