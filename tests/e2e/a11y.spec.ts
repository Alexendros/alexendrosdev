import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const routes = [
  '/',
  '/servicios',
  '/servicios/produccion-sitios-web',
  '/servicios/landing-10-dias',
  '/proyectos',
  '/proyectos/front-valencia',
  '/como-trabajo',
  '/contacto'
];

for (const route of routes) {
  test(`a11y ${route} - 0 violaciones`, async ({ page }) => {
    await page.goto(route);
    // El reveal de entrada (400 ms, solo no-preference) deja texto
    // semitransparente durante la animación; se analiza el estado final.
    await page.waitForTimeout(600);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      `Violaciones en ${route}: ${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([]);
  });
}
