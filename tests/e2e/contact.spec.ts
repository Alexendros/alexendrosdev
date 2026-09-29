import { test, expect } from '@playwright/test';

test('contact form validacion Zod y envio', async ({ page }) => {
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

  await page.goto('/contacto');

  // Paso 1: datos de contacto. Nombre inválido -> error de paso.
  await page.getByLabel('Nombre*').fill('A');
  await page.getByRole('button', { name: /Siguiente/ }).click();
  await expect(page.getByRole('alert')).toBeVisible();

  await page.getByLabel('Nombre*').fill('Test Cliente');
  await page.getByLabel('Email*').fill('test@example.com');
  await page.getByRole('button', { name: /Siguiente/ }).click();

  // Paso 2: proyecto (asunto y presupuesto opcionales).
  await expect(page.getByText(/Paso 2 de 3/)).toBeVisible();
  await page.getByRole('button', { name: /Siguiente/ }).click();

  // Paso 3: mensaje y consentimiento.
  await expect(page.getByText(/Paso 3 de 3/)).toBeVisible();
  await page
    .getByLabel(/Cuéntame tu caso/)
    .fill('Proyecto ecommerce Stripe presupuesto 5k deadline 1 mes web actual https://example.com');
  await page.getByLabel(/Acepto/).check();
  await page.getByRole('button', { name: /Enviar/ }).click();
  await expect(page.getByRole('status')).toContainText(/Mensaje enviado/i, { timeout: 10000 });
});

test('contacto muestra reservas Cal públicas, QR y no el retainer', async ({ page }) => {
  await page.goto('/contacto');

  await expect(page.getByRole('heading', { name: 'Reserva una sesión' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'O escríbeme' })).toBeVisible();
  await expect(page.getByLabel('Nombre*')).toBeVisible();

  const diagnostico = page.getByRole('link', { name: 'Reservar diagnóstico', exact: true });
  await expect(diagnostico).toHaveAttribute('href', 'https://cal.com/alexendros/diagnostico');
  await expect(diagnostico).toHaveAttribute('data-cal-link', 'alexendros/diagnostico');

  const sesion = page.getByRole('link', { name: 'Reservar sesión técnica', exact: true });
  await expect(sesion).toHaveAttribute('href', 'https://cal.com/alexendros/sesion-tecnica');
  await expect(sesion).toHaveAttribute('data-cal-link', 'alexendros/sesion-tecnica');

  await expect(page.getByText('75 €', { exact: true })).toBeVisible();
  await expect(page.getByText('150 €', { exact: true })).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Código QR para reservar Diagnóstico/ })
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /Código QR para reservar Sesión técnica/ })
  ).toBeVisible();
  await expect(page.getByText('Escanea para reservar')).toHaveCount(2);
  await expect(page.locator('body')).not.toContainText(/retainer/i);
});
