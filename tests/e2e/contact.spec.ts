import { test, expect } from '@playwright/test';

async function mockContactApi(page: import('@playwright/test').Page): Promise<void> {
  await page.route('**/api/contact', async (route) => {
    const req = route.request();
    if (req.method() === 'POST') {
      expect(req.headers()['content-type'] ?? '').toMatch(/application\/json/i);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true })
      });
      return;
    }
    await route.fulfill({
      status: 405,
      headers: { Allow: 'POST', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    });
  });
}

test('F04: todos los campos visibles en una pantalla, sin pasos', async ({ page }) => {
  await page.goto('/contacto');

  await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();
  await expect(page.getByLabel('Motivo*')).toBeVisible();
  await expect(page.getByLabel('Nombre*')).toBeVisible();
  await expect(page.getByLabel('Categoría')).toBeVisible();
  await expect(page.getByRole('radio', { name: 'Correo electrónico' })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'WhatsApp' })).toBeVisible();
  await expect(page.getByLabel('Correo electrónico*')).toBeVisible();
  await expect(page.getByLabel('Tu petición*')).toBeVisible();
  await expect(page.getByLabel(/Acepto/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible();

  await expect(page.getByRole('button', { name: /Continuar/ })).toHaveCount(0);
  await expect(page.getByText(/Paso \d+ de \d+/)).toHaveCount(0);
});

test('F04: envío válido hace POST y confirma', async ({ page }) => {
  await mockContactApi(page);

  await page.goto('/contacto');
  await page.getByLabel('Nombre*').fill('Test Cliente');
  await page.getByRole('radio', { name: 'Correo electrónico' }).check();
  await page.getByLabel('Correo electrónico*').fill('test@example.com');
  await page.getByLabel('Tu petición*').fill('Necesito información sobre el informe comercial.');
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByRole('status')).toContainText(/Mensaje enviado/i, { timeout: 10000 });
});

test('F04: WhatsApp sin teléfono no envía', async ({ page }) => {
  let posted = false;
  await page.route('**/api/contact', async (route) => {
    if (route.request().method() === 'POST') posted = true;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true })
    });
  });

  await page.goto('/contacto');
  await page.getByRole('radio', { name: 'WhatsApp' }).check();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(posted).toBe(false);
});

test('validación: nombre corto muestra error accesible y mueve el foco', async ({ page }) => {
  await page.goto('/contacto');
  await page.getByLabel('Nombre*').fill('A');
  await page.getByRole('button', { name: 'Enviar' }).click();

  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/Nombre/);
  await expect(page.getByLabel('Nombre*')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Nombre*')).toBeFocused();
});

test('contacto preselecciona el motivo desde ?servicio= de la URL', async ({ page }) => {
  await page.goto('/contacto?servicio=informe-comercial');
  await expect(page.locator('#contact-reason')).toHaveValue('propuestaComercial');
});

test('?motivo= explícito tiene prioridad sobre ?servicio=', async ({ page }) => {
  await page.goto('/contacto?servicio=informe-comercial&motivo=proyectoEspecial');
  await expect(page.locator('#contact-reason')).toHaveValue('proyectoEspecial');
});

test('contacto muestra canales horizontales y sin servicios de entrada', async ({ page }) => {
  await page.goto('/contacto');

  await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Servicios de entrada' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Perfiles y correo' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Formulario', exact: true })).toHaveCount(0);

  const canales = page.locator('#contenido');
  await expect(canales.getByRole('link', { name: 'contratacion@alexendros.dev' })).toBeVisible();
  await expect(canales.getByRole('link', { name: 'GitHub' })).toBeVisible();
  await expect(canales.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/retainer/i);
  await expect(page.locator('body')).not.toContainText(/diagnóstico/i);
});
