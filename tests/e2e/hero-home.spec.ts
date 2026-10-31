import { test, expect } from '@playwright/test';

const H1 = 'Auditoría, diseño y construcción de páginas web, tiendas y herramientas para negocios.';
const TITLE = 'Alexendros — Tecnologías y servicios informáticos';

const OLD_STRINGS = [
  'Webs y software a medida. Y revisión de la tuya.',
  'Cuéntame qué necesitas',
  'Explorar servicios',
  'Tecnología clara para negocios: auditoría, diseño y desarrollo',
  'Protocolos claros de gestión para empresas',
  'Servicios informáticos y tecnologías para empresas y particulares.'
] as const;

test('Hero home: copy, CTAs, metadatos y sin cadenas antiguas', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('#top');
  await expect(hero.getByRole('heading', { level: 1, name: H1 })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);

  await expect(hero.getByRole('link', { name: 'Solicitar propuesta' })).toHaveAttribute(
    'href',
    '#contacto'
  );
  await expect(hero.getByRole('link', { name: 'Ver servicios' })).toHaveAttribute(
    'href',
    '#servicios'
  );

  await expect(page).toHaveTitle(TITLE);

  const bodyText = await page.locator('body').innerText();
  for (const old of OLD_STRINGS) {
    expect(bodyText, `cadena antigua presente: ${old}`).not.toContain(old);
  }
});
