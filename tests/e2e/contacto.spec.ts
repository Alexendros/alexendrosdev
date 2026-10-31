import { test, expect, type Page, type Route } from '@playwright/test';

async function fillContactForm(
  page: Page,
  opts: {
    name?: string;
    message?: string;
    email?: string;
    via?: string;
    sitio?: string;
    otra?: string;
  } = {}
) {
  const name = opts.name ?? 'Test Cliente';
  const message = opts.message ?? 'Necesito información sobre el informe comercial.';
  const email = opts.email ?? 'test@example.com';
  const via = opts.via ?? 'revisar';
  await page.locator(`input[name="via"][value="${via}"]`).check();
  if (opts.otra) {
    await page.locator('input[name="via"][value="otra"]').check();
    await page.getByLabel('Describir la otra necesidad').fill(opts.otra);
  }
  await page.getByLabel(/^Mensaje$/).fill(message);
  await page.getByLabel(/^Nombre$/).fill(name);
  await page.getByLabel(/^Correo electrónico$/).fill(email);
  if (opts.sitio) await page.getByLabel(/Sitio web actual/).fill(opts.sitio);
  await page.getByLabel(/Acepto/).check();
}

async function mockContact(
  page: Page,
  handler: (route: Route) => Promise<void> | void
): Promise<void> {
  await page.route('**/api/contact', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fulfill({
        status: 405,
        headers: { Allow: 'POST', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Method not allowed' })
      });
      return;
    }
    await handler(route);
  });
}

test('vacío: foco al primer error', async ({ page }) => {
  await page.goto('/contacto');
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('alert').first()).toBeVisible();
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();
});

test('Otra vacía: error de detalle', async ({ page }) => {
  await page.goto('/contacto');
  await page.locator('input[name="via"][value="otra"]').check();
  await page.getByLabel(/^Nombre$/).fill('Test Cliente');
  await page.getByLabel(/^Correo electrónico$/).fill('test@example.com');
  await page.getByLabel(/^Mensaje$/).fill('Necesito algo fuera del catálogo habitual.');
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.locator('#contact-otra-error')).toBeVisible();
  await expect(page.locator('#contact-otra-error')).toContainText(/otra necesidad/i);
});

test('correo inválido', async ({ page }) => {
  await page.goto('/contacto');
  await fillContactForm(page, { email: 'no-es-correo' });
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.locator('#contact-email-error')).toBeVisible();
});

test('envio simulado correcto', async ({ page }) => {
  await mockContact(page, async (route) => {
    const body = route.request().postDataJSON() as { vias?: string[]; sitio?: string };
    expect(body.vias).toContain('revisar');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/Solicitud enviada/i, { timeout: 10000 });
});

test('envio con sitio relleno llega al API', async ({ page }) => {
  const posted: { body?: { sitio?: string; honeypot?: string } } = {};
  await mockContact(page, async (route) => {
    posted.body = route.request().postDataJSON() as { sitio?: string; honeypot?: string };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });
  await page.goto('/contacto');
  await fillContactForm(page, { sitio: 'https://empresa.es' });
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/Solicitud enviada/i, { timeout: 10000 });
  expect(posted.body?.sitio).toBe('https://empresa.es');
  expect(posted.body?.honeypot == null || posted.body?.honeypot === '').toBe(true);
});

test('trampa website rellena se envía como honeypot', async ({ page }) => {
  const posted: { body?: { honeypot?: string } } = {};
  await mockContact(page, async (route) => {
    posted.body = route.request().postDataJSON() as { honeypot?: string };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.locator('#contact-website').evaluate((el: HTMLInputElement) => {
    el.value = 'http://spam.example';
  });
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/Solicitud enviada/i, { timeout: 10000 });
  expect(posted.body?.honeypot).toBe('http://spam.example');
});

test.describe('sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('aviso con correo; sin POST JSON', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();
    const nojs = page.locator('[data-contact-nojs]');
    await expect(nojs).toBeVisible();
    await expect(nojs.getByRole('link', { name: /contratacion@alexendros\.dev/i })).toBeVisible();
    await expect(page.locator('noscript')).toHaveCount(1);
    await expect(page.locator('form[action*="api/contact"]')).toHaveCount(0);
  });
});
