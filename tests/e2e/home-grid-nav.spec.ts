import { test, expect } from '@playwright/test';

test('home muestra las 4 ofertas en rejilla estática sin autoplay', async ({ page }) => {
  await page.goto('/');
  const grid = page.locator('[data-services-grid]');
  await expect(grid).toBeVisible();
  await expect(grid.locator(':scope > *')).toHaveCount(4);
  // Sin JS de slider: no hay autoplay ni diapositivas ocultas.
  await expect(page.locator('[data-service-slider]')).toHaveCount(0);
});

test('navegación móvil abre/cierra con teclado y gestiona el foco', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const menuButton = page.locator('#menu-button');
  const mobileNav = page.locator('#mobile-nav');
  await expect(menuButton).toBeVisible();
  await expect(mobileNav).toBeHidden();

  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await expect(mobileNav).toBeVisible();
  // Al abrir, el foco va al primer enlace.
  await expect(mobileNav.locator('a').first()).toBeFocused();

  // Cierre con Escape devuelve el foco al botón.
  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  await expect(mobileNav).toBeHidden();
  await expect(menuButton).toBeFocused();
});
