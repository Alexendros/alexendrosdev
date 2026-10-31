import { test, expect, type Page, type Route } from '@playwright/test';

async function fillContactForm(
  page: Page,
  opts: { name?: string; message?: string; email?: string } = {}
) {
  const name = opts.name ?? 'Test Cliente';
  const message = opts.message ?? 'Necesito información sobre el informe comercial.';
  const email = opts.email ?? 'test@example.com';
  await page.locator('input[name="via"][value="revisar"]').check();
  await page.getByLabel(/^Mensaje$/).fill(message);
  await page.getByLabel(/^Nombre$/).fill(name);
  await page.getByLabel(/^Correo electrónico$/).fill(email);
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

test('F04: contacto valida y envía', async ({ page }) => {
  await mockContact(page, async (route) => {
    expect(route.request().headers()['content-type'] ?? '').toMatch(/application\/json/i);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });

  await page.goto('/contacto');
  await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();

  await page.locator('input[name="via"][value="revisar"]').check();
  await page.getByLabel(/^Mensaje$/).fill('Necesito información sobre el informe comercial.');
  await page.getByLabel(/^Nombre$/).fill('A');
  await page.getByLabel(/^Correo electrónico$/).fill('test@example.com');
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByLabel(/^Nombre$/).fill('Test Cliente');
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/Solicitud enviada/i, { timeout: 10000 });
});

test('F04: sin correo no se envía', async ({ page }) => {
  let posted = false;
  await mockContact(page, async (route) => {
    posted = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });

  await page.goto('/contacto');
  await page.locator('input[name="via"][value="revisar"]').check();
  await page.getByLabel(/^Mensaje$/).fill('Necesito información sobre el informe comercial.');
  await page.getByLabel(/^Nombre$/).fill('Test Cliente');
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(posted).toBe(false);
});

test('UI-01: hidratación no roba el foco', async ({ page }) => {
  await page.goto('/contacto');
  await expect(page.getByRole('button', { name: /Solicitar propuesta/ })).toBeEnabled({
    timeout: 10000
  });
  const active = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el) return null;
    return { tag: el.tagName, id: el.id, text: el.textContent?.slice(0, 40) ?? '' };
  });
  expect(active?.tag).not.toBe('H2');
});

test('UI-02: errores de envío con aria-invalid', async ({ page }) => {
  await page.goto('/contacto');
  await page.locator('input[name="via"][value="revisar"]').check();
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  const name = page.getByLabel(/^Nombre$/);
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#contact-name-error')).toBeVisible();
});

test('UI-04: datos conservados tras 503', async ({ page }) => {
  await mockContact(page, async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false, status: 'retryable_failure' })
    });
  });
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('alert')).toContainText(/no disponible/i);
  await expect(page.getByLabel(/^Mensaje$/)).toHaveValue(/informe comercial/i);
});

test('UI-05: reintento conserva Idempotency-Key', async ({ page }) => {
  const keys: string[] = [];
  let calls = 0;
  await mockContact(page, async (route) => {
    calls += 1;
    const key = route.request().headers()['idempotency-key'] ?? '';
    keys.push(key);
    if (calls === 1) {
      await route.abort('connectionfailed');
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'e2e', replay: false })
    });
  });

  await page.goto('/contacto');
  await fillContactForm(page);
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('alert')).toContainText(/No se pudo enviar|tarda más|no sabemos/i, {
    timeout: 10000
  });
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/Solicitud enviada/i, { timeout: 10000 });
  expect(keys.length).toBeGreaterThanOrEqual(2);
  expect(keys[0]).toBeTruthy();
  expect(keys[0]).toBe(keys[1]);
});

test('CFG-04: motivo y módulos válidos muestran nombres', async ({ page }) => {
  await page.goto('/contacto?motivo=propuestaComercial&modulos=contenidos,tienda');
  await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();
  await expect(page.locator('#contact-reason')).toHaveValue('propuestaComercial', {
    timeout: 10_000
  });
  const modules = page.locator('[data-contact-modules]');
  await expect(modules).toBeVisible();
  await expect(modules.locator('strong')).toHaveText(
    'Integración de catálogo y pagos, Panel de contenidos'
  );
});

test('CFG-05: params hostiles no inventan condiciones ni XSS', async ({ page }) => {
  await page.goto(
    '/contacto?motivo=hack&precio=1&modulos=evil,<script>alert(1)</script>,tienda,tienda'
  );
  await expect(page.locator('#contact-reason')).toHaveValue('informacionCliente', {
    timeout: 10_000
  });
  const modules = page.locator('[data-contact-modules]');
  await expect(modules).toBeVisible();
  await expect(modules.locator('strong')).toHaveText('Integración de catálogo y pagos');
  await expect(modules).not.toContainText(/script|evil|precio|1\s*€/i);
  await expect(page.locator('body')).not.toContainText('alert(1)');
});

test('CFG-06: servicio y proyecto allowlisted; desconocidos se descartan', async ({ page }) => {
  await page.goto(
    '/contacto?servicio=informe-comercial&proyecto=front-valencia&precio=999&servicio=evil'
  );
  await expect(page.locator('#contact-service')).toHaveValue('informe-comercial', {
    timeout: 10_000
  });
  await expect(page.locator('#contact-project')).toHaveValue('front-valencia');
  await expect(page.locator('body')).not.toContainText('999');
});

test('T-CON-07: 200 ok sin status accepted no es éxito', async ({ page }) => {
  await mockContact(page, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('alert')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(/Solicitud enviada/i)).toHaveCount(0);
});

test('T-CON-01b: accepted con replay true muestra éxito', async ({ page }) => {
  await mockContact(page, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        status: 'accepted',
        requestId: 'replay-1',
        replay: true
      })
    });
  });
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/Solicitud enviada/i, { timeout: 10_000 });
});

test('AXD-005: correo visible si el script no hidrata', async ({ page }) => {
  await page.route('**/contactForm*', (route) => route.abort());
  await page.goto('/contacto');
  const nojs = page.locator('[data-contact-nojs]');
  await expect(nojs).toBeVisible({ timeout: 10_000 });
  await expect(nojs.getByRole('link', { name: /contratacion@alexendros\.dev/i })).toBeVisible();
});

test.describe('UI-07: sin JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('correo y alternativa sin JS visibles', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.getByRole('heading', { name: 'Contacto', exact: true })).toBeVisible();
    const nojs = page.locator('[data-contact-nojs]');
    await expect(nojs).toBeVisible();
    await expect(nojs).toContainText(/necesita JavaScript/i);
    await expect(nojs.getByRole('link', { name: /contratacion@alexendros\.dev/i })).toBeVisible();
    await expect(page.locator('noscript')).toHaveCount(1);
    await expect(page.locator('form[action*="api/contact"]')).toHaveCount(0);
  });
});

test('UI-06: 202 no es éxito; 200 accepted sí; 409 comprensible', async ({ page }) => {
  let mode: 'processing' | 'accepted' | 'conflict' = 'processing';
  await mockContact(page, async (route) => {
    if (mode === 'processing') {
      await route.fulfill({
        status: 202,
        contentType: 'application/json',
        headers: { 'Retry-After': '5' },
        body: JSON.stringify({ ok: false, status: 'processing', requestId: 'proc-1' })
      });
      return;
    }
    if (mode === 'conflict') {
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        body: JSON.stringify({ ok: false, status: 'conflict' })
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, status: 'accepted', requestId: 'ok-1', replay: false })
    });
  });

  await page.goto('/contacto');
  await fillContactForm(page);

  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/procesando/i);
  await expect(page.getByRole('status')).not.toContainText(/Solicitud enviada/i);

  mode = 'accepted';
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('status')).toContainText(/Solicitud enviada/i);

  mode = 'conflict';
  await page.goto('/contacto');
  await fillContactForm(page);
  await page.getByRole('button', { name: /Solicitar propuesta/ }).click();
  await expect(page.getByRole('alert')).toContainText(/no coincide|envío anterior/i);
});
