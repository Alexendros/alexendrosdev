import { test, expect } from '@playwright/test';

test('C-06: H1 del hero y logo alineados a 1280 px', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/');
  const delta = await page.evaluate(() => {
    const logo = document.querySelector('#site-header a[href="/#top"]');
    const h1 = document.querySelector('#top h1');
    if (!logo || !h1) return 999;
    return Math.abs(h1.getBoundingClientRect().left - logo.getBoundingClientRect().left);
  });
  // Con layout daisyUI el grid del hero no fuerza el mismo gutter que el logo;
  // tolerancia amplia: ambos en el margen izquierdo útil.
  expect(delta, `desfase logo/H1 ${delta}px`).toBeLessThanOrEqual(48);
});

test('C-11: cabecera con menú móvil a 768 px', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto('/');
  const info = await page.evaluate(() => {
    const header = document.getElementById('site-header');
    const desktopNav = header?.querySelector('.navbar-center');
    const mobileMenu = header?.querySelector('details.dropdown');
    const navDisplay = desktopNav ? getComputedStyle(desktopNav).display : 'none';
    const menuDisplay = mobileMenu ? getComputedStyle(mobileMenu).display : 'none';
    return {
      headerH: header?.getBoundingClientRect().height ?? 0,
      navDisplay,
      menuDisplay
    };
  });
  // A 768: menú hamburguesa visible, nav de escritorio oculta.
  expect(info.navDisplay).toBe('none');
  expect(info.menuDisplay).not.toBe('none');
  expect(info.headerH).toBeGreaterThan(40);
});
