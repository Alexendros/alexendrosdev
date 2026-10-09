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

  test('contacto muestra formulario usable', async ({ page }) => {
    await page.goto('/contacto');
    await expect(page.getByLabel('Nombre*')).toBeVisible();
    await expect(page.getByLabel('Email*')).toBeVisible();
  });

  test('sin consentimiento no hay trackers data-tracker', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script[data-tracker]')).toHaveCount(0);
    expect(await page.evaluate(() => 'gtag' in window)).toBe(false);
  });
});
