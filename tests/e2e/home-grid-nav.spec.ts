import { test, expect } from '@playwright/test';

test('F02: home sin scroll horizontal a 320, 390 y 768px', async ({ page }) => {
  for (const width of [320, 390, 768]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth, `scrollWidth ${scrollWidth} > viewport ${width}`).toBeLessThanOrEqual(
      width
    );
  }
});

test('F03: el hero propone la oferta con CTA a servicios y contacto', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('[data-hero]');
  await expect(hero.getByRole('link', { name: 'Ver servicios' })).toBeVisible();
  await expect(hero.getByRole('link', { name: 'Contactar' })).toBeVisible();
});

test('F01: home es hero + nav; sin secciones en página', async ({ page }) => {
  await page.goto('/');

  const h1 = page.getByRole('heading', {
    level: 1,
    name: /Aquí se crean productos digitales que son reflejo de/
  });
  await expect(h1).toBeVisible();
  await expect(h1).toHaveAccessibleName(
    /emprendimientos personales novedosos de alto impacto social y reputación profesional.*sociedades empresariales con sólidas estructuras productivas.*historia y obra de seres humanos con valores ejemplares/
  );
  await expect(page.getByText(/Diseño y publico webs y portales/)).toBeVisible();
  await expect(page.getByText(/Pare las rotativas/)).toHaveCount(0);
  await expect(page.getByText(/SI TIENES UN NEGOCIO/i)).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  const visiblePhrases = await page
    .locator('[data-hero] .hero-slot-item')
    .evaluateAll((els) => els.filter((el) => Number(getComputedStyle(el).opacity) > 0.2).length);
  expect(visiblePhrases).toBe(1);

  const banner = page.getByRole('banner');
  await expect(banner.getByRole('link', { name: 'Contactar' })).toBeVisible();
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Contactar' })).toHaveCount(
    0
  );

  const emptyFrames = await page.evaluate(async () => {
    const gaps: number[] = [];
    const t0 = performance.now();
    while (performance.now() - t0 < 9500) {
      const opacities = [...document.querySelectorAll('.hero-slot-item')].map((el) =>
        Number(getComputedStyle(el).opacity)
      );
      if (!opacities.some((o) => o > 0.2)) gaps.push(Math.round(performance.now() - t0));
      await new Promise((r) => setTimeout(r, 150));
    }
    return gaps;
  });
  expect(emptyFrames, `H1 vacío en t=${emptyFrames.join(',')}`).toEqual([]);

  await expect(banner.getByRole('link', { name: 'Servicios', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Publicaciones', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Metodología', exact: true })).toBeVisible();
  await expect(banner.getByRole('link', { name: 'Valores', exact: true })).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Servicios', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Publicaciones', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Metodología', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Valores', exact: true })).toHaveCount(0);
  await expect(page.getByText('DISEÑO WEB · VALENCIA')).toHaveCount(0);
  await expect(page.getByText('Disponible para nuevos proyectos')).toHaveCount(0);
});
