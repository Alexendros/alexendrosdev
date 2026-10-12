import { test, expect } from '@playwright/test';

/**
 * Subconjunto always-on en CI (job e2e-critical).
 * axe/LHCI completo sigue detrás del label `e2e`.
 */
test.describe('critical paths', () => {
  test('home responde y marca es visible', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.ok()).toBeTruthy();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.locator('a[href="/contacto"]').first()).toBeVisible();
  });

  test('header sticky no es transparente', async ({ page }) => {
    await page.goto('/');
    const alpha = await page.evaluate(() => {
      const header = document.getElementById('site-header');
      if (!header) return 0;
      const raw = getComputedStyle(header).backgroundColor;
      if (!raw || raw === 'transparent') return 0;
      const comma = raw.match(/rgba?\(([^)]+)\)/);
      if (comma) {
        const parts = comma[1].split(',').map((part) => Number.parseFloat(part));
        return parts.length === 4 ? (parts[3] ?? 0) : 1;
      }
      const slash = raw.match(/\/\s*([\d.]+)\s*\)?\s*$/);
      return slash ? Number.parseFloat(slash[1]) : 1;
    });
    expect(alpha).toBeGreaterThan(0);
  });

  test('contacto muestra formulario usable', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.getByRole('heading', { name: 'Formulario de contacto' })).toBeVisible();
    await expect(page.getByLabel('Motivo*')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible();
  });

  test('sin consentimiento no hay trackers data-tracker', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script[data-tracker]')).toHaveCount(0);
    expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  });
});
