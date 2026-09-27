import { test, expect } from '@playwright/test';

test('skip link salta al contenido principal con teclado', async ({ page }) => {
  await page.goto('/');
  const skip = page.getByRole('link', { name: 'Saltar al contenido' });
  const main = page.locator('#contenido');

  await expect(main).toBeAttached();

  // Primer Tab enfoca el skip link (primer focoable del documento).
  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#contenido$/);
  // Tras activar el ancla, el destino #contenido queda en viewport y
  // el hash del documento apunta al main.
  await expect(main).toBeInViewport();
});
