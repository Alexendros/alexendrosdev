import { test, expect, type Page } from '@playwright/test';

const CONSENT_KEY = 'consent_v1';

async function readConsentStorage(page: Page): Promise<Record<string, unknown> | null> {
  return page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  }, CONSENT_KEY);
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
  });
});

test('TEST-CMP-01: sin consentimiento no hay trackers activos', async ({ page }) => {
  await page.goto('/');

  expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  expect(await page.evaluate(() => 'fbq' in window)).toBe(false);
  await expect(page.locator('script[data-tracker]')).toHaveCount(0);
  await expect(
    page.locator('script[data-tracker="ga4"], script[data-tracker="meta-pixel"]')
  ).toHaveCount(0);
});

test('TEST-CMP-02a: el banner muestra 3 botones con el mismo peso y persiste al aceptar', async ({
  page
}) => {
  await page.goto('/');

  const accept = page.getByRole('button', { name: 'Aceptar todo' }).first();
  const reject = page.getByRole('button', { name: 'Rechazar todo' }).first();
  const configure = page.getByRole('button', { name: 'Configurar' }).first();

  await expect(accept).toBeVisible();
  await expect(reject).toBeVisible();
  await expect(configure).toBeVisible();

  const acceptClass = await accept.getAttribute('class');
  const rejectClass = await reject.getAttribute('class');
  expect(acceptClass).toContain('cm__btn');
  expect(acceptClass).toBe(rejectClass);

  await accept.click();

  const consent = await readConsentStorage(page);
  expect(consent).not.toBeNull();
  expect(Object.keys(consent ?? {}).sort()).toEqual(
    ['analytics', 'marketing', 'necessary', 'preferences', 'timestamp', 'version'].sort()
  );
  expect(consent?.necessary).toBe(true);
  expect(consent?.analytics).toBe(true);
});

test('TEST-CMP-02b: al rechazar todo analytics y marketing quedan a false', async ({ page }) => {
  await page.goto('/');

  const reject = page.getByRole('button', { name: 'Rechazar todo' }).first();
  await expect(reject).toBeVisible();
  await reject.click();

  const consent = await readConsentStorage(page);
  expect(consent).not.toBeNull();
  expect(consent?.analytics).toBe(false);
  expect(consent?.marketing).toBe(false);
  expect(consent?.necessary).toBe(true);
});

test('TEST-CMP-02c: configurar abre el modal de preferencias con la categoría técnica bloqueada', async ({
  page
}) => {
  await page.goto('/');

  const configure = page.locator('#cc-main .cm__btn--secondary');
  await expect(configure).toBeVisible();
  await configure.click();

  await expect(page.getByText('Preferencias de cookies')).toBeVisible();
  await expect(page.getByText('Cookies técnicas').first()).toBeVisible();
  await expect(page.locator('.pm input[type="checkbox"][disabled]')).toHaveCount(1);
});

test('TEST-CMP-03: el botón "Configurar cookies" del pie reabre las preferencias', async ({
  page
}) => {
  await page.goto('/');

  const footerTrigger = page
    .locator('footer')
    .getByRole('button', { name: /Configurar cookies/i })
    .first();
  await expect(footerTrigger).toBeVisible();
  await footerTrigger.click();

  await expect(page.getByText('Preferencias de cookies')).toBeVisible();
});

test('TEST-LEGAL-02: el pie enlaza a las páginas legales y /cookies lista la tabla', async ({
  page
}) => {
  await page.goto('/');

  const footer = page.locator('footer');
  await expect(footer.getByRole('link', { name: /Aviso legal/i }).first()).toHaveAttribute(
    'href',
    '/aviso-legal'
  );
  await expect(footer.getByRole('link', { name: /Privacidad/i }).first()).toHaveAttribute(
    'href',
    '/privacidad'
  );
  await expect(footer.getByRole('link', { name: /Cookies/i }).first()).toHaveAttribute(
    'href',
    '/cookies'
  );

  await page.goto('/cookies');
  const table = page.getByRole('table').first();
  await expect(table).toBeVisible();
  for (const header of ['Nombre', 'Titular', 'Finalidad', 'Duración', 'Tipo']) {
    await expect(table.getByRole('columnheader', { name: header })).toBeVisible();
  }
});
