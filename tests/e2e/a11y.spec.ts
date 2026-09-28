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
    // Reduced-motion: reveal (700ms) y entrada del hero quedan en su
    // estado final de inmediato — axe analiza el contenido completo y
    // se valida de paso el camino prefers-reduced-motion.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      `Violaciones en ${route}: ${JSON.stringify(results.violations, null, 2)}`
    ).toEqual([]);
  });
}
