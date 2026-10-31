# Inventario v1 — página única daisyUI

Fecha: 2026-10-31. Cada componente, página y `style=` tiene destino. Nada queda sin mapa.

## Componentes actuales

| Componente                | Uso actual                                                     | Destino                                                                                                     |
| ------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Header.astro`            | Layout                                                         | Sustituye por navbar sticky daisyUI (`navbar`, menú móvil `dropdown` sobre `<details>`, `theme-controller`) |
| `Footer.astro`            | Layout                                                         | Sustituye por `footer` daisyUI con tres columnas `<nav>`                                                    |
| `SkipLink.astro`          | Layout                                                         | Se mantiene; clases `btn` + `sr-only` / `focus:not-sr-only`                                                 |
| `Hero.astro`              | `index`                                                        | Sustituye por `sections/Hero.astro` (mockup-browser decorativo + lista real + stats)                        |
| `ServiceCard.astro`       | index, servicios, design-system                                | Sustituye por cards de vías en `sections/Servicios.astro` (`card card-border`, `badge`)                     |
| `ProjectCard.astro`       | referencias/index                                              | Sustituye por cards en `sections/Referencias.astro` + ficha canónica                                        |
| `DetailIsland.astro`      | servicios/index, referencias/index                             | Sustituye por `<dialog class="modal">` + `<template>` por ítem; índices de listado desaparecen (ancla)      |
| `ContactForm.astro`       | contacto                                                       | Sustituye por `sections/Contacto.astro` (fase 3)                                                            |
| `NeedsConfigurator.astro` | servicios/index                                                | Se elimina con el índice de servicios; la elección de vía vive en el formulario                             |
| `Button.astro`            | varias páginas                                                 | Sustituye por utilidades `btn` de daisyUI                                                                   |
| `Badge.astro`             | design-system                                                  | Sustituye por `badge`; se elimina cuando nadie lo importe                                                   |
| `Link.astro`              | varias páginas                                                 | Sustituye por `link` / anclas; se elimina cuando nadie lo importe                                           |
| `PageHead.astro`          | contacto, 404, design-system                                   | Sustituye por título + clase `.eyebrow` en páginas que se quedan                                            |
| `Eyebrow.astro`           | PageHead, design-system                                        | Sustituye por clase `.eyebrow` en CSS; se elimina cuando nadie lo importe                                   |
| `Container.astro`         | casi todas las páginas                                         | Sustituye por contenedor utilitario (`mx-auto max-w-6xl px-4`); se elimina al final                         |
| `Grid.astro`              | index, metodo, sobre-mi, servicios, referencias, design-system | Sustituye por utilidades `grid` / `gap-*`; se elimina                                                       |
| `Stack.astro`             | design-system                                                  | Se elimina con design-system / utilidades                                                                   |
| `AxisCard.astro`          | solo design-system                                             | Se elimina                                                                                                  |
| `BlueprintMotif.astro`    | Hero, 404                                                      | Se elimina (hero nuevo; 404 sin motivo blueprint)                                                           |
| `Dimension.astro`         | referencias/[slug], design-system                              | Se elimina (decoración; ficha sin líneas dimension)                                                         |
| `Layout.astro`            | todas                                                          | Se mantiene y se adapta al marco daisyUI + `theme-init.js`                                                  |

## Páginas actuales

| Ruta                                                      | Destino                                                                              |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `/` (`index.astro`)                                       | Página única con anclas `#top`, `#servicios`, `#referencias`, `#metodo`, `#contacto` |
| `/servicios`                                              | Redirección 301 → `/#servicios`                                                      |
| `/servicios/[slug]`                                       | Se mantiene (canónica SEO); mismo marco                                              |
| `/referencias`                                            | Redirección 301 → `/#referencias`                                                    |
| `/referencias/[slug]`                                     | Se mantiene (canónica SEO); mismo marco                                              |
| `/metodo`                                                 | Redirección 301 → `/#metodo`                                                         |
| `/contacto`                                               | Redirección 301 → `/#contacto`                                                       |
| `/sobre-mi`                                               | Redirección 301 → `/experiencia`; página nueva `experiencia.astro`                   |
| `/design-system`                                          | Se elimina; 301 a `https://designsystem.alexendros.dev/` (destino fijo)              |
| `/identidad`, `/privacidad`, `/cookies`, `/accesibilidad` | Se mantienen; mismo marco                                                            |
| `/404`                                                    | Se mantiene; mismo marco                                                             |
| `/articulos/[slug]`                                       | Se mantiene; mismo marco                                                             |
| `/r/[code]`                                               | Se mantiene (SSR); destino fijo `/#contacto`; cookie solo con código de lista        |
| `/api/contact`, `/api/csp-report`                         | Sin cambios de lógica (salvo campo de vías/`sitio` en esquema, fase 3)               |

Redirecciones antiguas que apuntaban a `/metodo`, `/servicios` o `/referencias` (índice) pasan a saltar directas al ancla correspondiente, sin cadenas. Las que llegan a una ficha que se queda no se tocan.

## Atributos `style=` (22)

| Ubicación                                | Qué hace                                                      | Cómo se elimina                                       |
| ---------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| `Hero.astro` ×4 (`--i:0…3`)              | Retardo de entrada del hero                                   | Clases `.rise-1`…`.rise-4` en CSS                     |
| `Dimension.astro` ×3 (`--i`)             | Animación de líneas                                           | Componente eliminado                                  |
| `Grid.astro` ×1 (`gap: var(--space-*)`)  | Gap dinámico                                                  | Utilidad Tailwind `gap-*`                             |
| `Stack.astro` ×1 (`gap: var(--space-*)`) | Gap dinámico                                                  | Utilidad Tailwind; componente eliminado               |
| `referencias/index.astro` ×1 (`--i`)     | Retardo reveal                                                | Índice → ancla; animación con `.rise-n` si hace falta |
| `design-system.astro` ×12                | Demos de tokens (bg, font-size, width, radius, shadow, `--i`) | Página eliminada / redirigida                         |

## Scripts y CSS relacionados (mapa)

| Pieza                                 | Destino                                                              |
| ------------------------------------- | -------------------------------------------------------------------- |
| `src/scripts/header.ts`               | Sustituido por menú `<details>` + tema en fichero propio             |
| `src/scripts/reveal.ts`               | Sustituido por CSS `rise` (estado final = visible sin JS)            |
| `src/scripts/contactForm.ts`          | Adaptado al formulario daisyUI (fase 3); honeypot `website` intacto  |
| `src/scripts/needsConfigurator.ts`    | Se elimina con NeedsConfigurator                                     |
| `src/styles/global.css` (1044 líneas) | Reducir a &lt;250: marco, rise, impresión, foco, tipografía base     |
| `public/theme-init.js` (nuevo)        | Clase `js` + recuerdo de tema; un solo fichero en `<head>` sin defer |

## Secciones nuevas (fase 2+)

| Fichero                      | Ancla / rol               |
| ---------------------------- | ------------------------- |
| `sections/Hero.astro`        | `#top`                    |
| `sections/Servicios.astro`   | `#servicios`              |
| `sections/Referencias.astro` | `#referencias`            |
| `sections/Metodo.astro`      | `#metodo`                 |
| `sections/Faq.astro`         | `#faq` (dentro de método) |
| `sections/Contacto.astro`    | `#contacto`               |
