import { test, expect } from '@playwright/test';

test('slider de ofertas rota y responde a controles', async ({ page }) => {
  await page.goto('/');
  const slider = page.locator('[data-service-slider]');
  const counter = slider.locator('[data-counter]');
  // El hover pausa el autoplay (6 s) para aserciones deterministas.
  await slider.hover();
  await expect(counter).toHaveText('01/04');
  await slider.locator('[data-next]').click();
  await expect(counter).toHaveText('02/04');
  await slider.press('ArrowRight');
  await expect(counter).toHaveText('03/04');
  await slider.locator('[data-dot]').nth(3).click();
  await expect(counter).toHaveText('04/04');
  await slider.locator('[data-prev]').click();
  await expect(counter).toHaveText('03/04');
  await expect(slider.locator('[data-slide]').nth(2)).toHaveAttribute('aria-hidden', 'false');
});
