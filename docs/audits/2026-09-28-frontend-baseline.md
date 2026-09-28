# Baseline de auditoría frontend — 2026-09-28

Rama: `cursor/frontend-audit`. Medido sobre build local (`pnpm build` + `pnpm preview`, puerto 4321), no sobre producción.

## Métricas Lighthouse (home)

| Métrica          | Desktop | Móvil   | Objetivo (prompt §6) |
| ---------------- | ------- | ------- | -------------------- |
| Performance      | 1.00    | 0.99    | ≥ 0.95               |
| Accesibilidad    | 1.00    | 1.00    | 1.00                 |
| Best Practices   | 0.96    | 0.96    | 1.00                 |
| SEO              | 1.00    | 1.00    | 1.00                 |
| LCP              | 0.4 s   | 1.7 s   | < 2.0 s              |
| CLS              | 0       | 0       | < 0.05               |
| TBT              | 0 ms    | 0 ms    | —                    |
| Peso transferido | 133 KiB | 171 KiB | < 400 KB             |

- Los 404 en consola del baseline local son `/_vercel/insights/script.js` y `/_vercel/speed-insights/script.js`: solo existen desplegado en Vercel, no en `serve` local. No es un defecto real.
- `cache-insight` con TTL 0 es artefacto del servidor local `serve`; en Vercel los assets `/_astro/` llevan caché inmutable.

## Enlaces (linkinator, recursivo)

Todos los enlaces internos y externos devuelven 200. Sin enlaces rotos.

## axe-core / e2e

13/13 tests e2e en verde; 0 violaciones axe en `/`, `/servicios`, `/servicios/produccion-sitios-web`, `/servicios/landing-10-dias`, `/proyectos`, `/proyectos/front-valencia`, `/como-trabajo`, `/contacto`.

## Contraste (`pnpm check:contrast`)

Todos los pares de tokens en verde (mínimo 4.5:1 texto, 3:1 acentos) sobre el tema cianotipo actual. Se reescribirá para la paleta clara en la Fase 2.

## Tabla de hallazgos

| hallazgo                                                                       | archivo:línea                                                            | severidad | fix propuesto                                                                             | estado           |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | --------- | ----------------------------------------------------------------------------------------- | ---------------- |
| Nav sin `aria-current` (solo color visual)                                     | src/components/Header.astro:19,82,92                                     | P0        | `aria-current="page"` en desktop y móvil                                                  | corregido        |
| 4 enlaces "Ver qué incluye →" idénticos (nombre accesible ambiguo)             | src/components/ServiceCard.astro:20                                      | P1        | card-link: enlace único en el título con `::after` estirado; texto auxiliar `aria-hidden` | corregido        |
| Ídem "Ver caso →" en casos                                                     | src/components/ProjectCard.astro:31                                      | P1        | mismo patrón card-link                                                                    | corregido        |
| `alt` genérico "Captura de {title}"                                            | src/components/ProjectCard.astro:20, src/pages/proyectos/[slug].astro:24 | P1        | campo `coverAlt` descriptivo en `src/content/projects.ts`                                 | corregido        |
| Imágenes sin `decoding="async"`                                                | ProjectCard, proyectos/[slug]                                            | P2        | atributo añadido                                                                          | corregido        |
| Sitemap sin `/servicios/landing-10-dias`                                       | public/sitemap.xml                                                       | P2        | URL añadida (15→16)                                                                       | corregido        |
| JSON-LD solo `Person`; falta `ProfessionalService`                             | src/layouts/Layout.astro                                                 | P2        | `@graph` con Person + ProfessionalService (`areaServed: Valencia`, `priceRange: €€`)      | corregido        |
| OG image única (`/og/default.png`) para todas las páginas                      | src/layouts/Layout.astro:20                                              | P2        | `gen-og.mts` genera OG por servicio y proyecto; prop `ogImage` en Layout                  | corregido        |
| "↗" visible sin `aria-hidden`                                                  | src/pages/contacto.astro:52                                              | P3        | span `aria-hidden`                                                                        | corregido        |
| Precios con espacio normal ("Desde 1.500 €")                                   | src/content/services.ts, contact.ts, LandingBanner.astro:30              | P3        | espacio fino no separable U+202F antes del €                                              | corregido        |
| `stroke="#ffffff"` hardcodeado                                                 | src/components/BlueprintMotif.astro:14                                   | P2        | `stroke="currentColor"`                                                                   | corregido        |
| `bg-white` hardcodeado en tarjeta QR                                           | src/components/BookingOptions.astro:44                                   | P3        | valor fijo deliberado: el QR requiere fondo claro para ser escaneable; documentado        | justificado      |
| Hex en QR (`#ffffff`/`#141a21`)                                                | src/lib/qrSvg.ts:7-8                                                     | P3        | fijos a propósito (escaneabilidad); comentario añadido                                    | justificado      |
| `CAL_BRAND #FFC53D`                                                            | src/lib/calBooking.ts:3                                                  | P3        | color de marca del embed de Cal.com (tercero); comentario añadido                         | justificado      |
| Headers de seguridad (CSP, HSTS, nosniff, Referrer-Policy, Permissions-Policy) | vercel.json                                                              | P2        | ya existían; verificado                                                                   | sin acción       |
| `rel="noopener noreferrer"` en externos                                        | Footer, BookingOptions, ContactForm, [slug]                              | P2        | ya presente en todos                                                                      | sin acción       |
| H1 sin problema de espacio (afirmación del prompt no reproducible)             | src/components/Hero.astro:14-17                                          | P0        | verificado: la coma cierra la línea y el span continúa; lectura correcta                  | sin acción       |
| FIG. 04 sin contenido intermedio                                               | src/pages/index.astro:64-76                                              | —         | intencional: título + texto + CTA; no es un acordeón roto                                 | sin acción       |
| Tira "Servicios · Casos · Ejes · Contacto"                                     | src/components/Dimension.astro                                           | —         | decorativa (`aria-hidden`, oculta en móvil), no parece enlace; se mantiene así            | sin acción       |
| Sin scripts `lint:css`, `lint:a11y`, `check:links`                             | package.json                                                             | P2        | `check:links` y `lint:a11y` añadidos; `lint:css` llega con stylelint en Fase 2            | parcial          |
| `transition: all`                                                              | —                                                                        | —         | 0 ocurrencias                                                                             | OK               |
| `!important`                                                                   | src/styles/global.css:129                                                | P3        | 1 ocurrencia (reduce-motion del banner); se elimina en la reescritura de capas (Fase 2)   | pendiente Fase 2 |
| Modo oscuro                                                                    | —                                                                        | —         | se evalúa en Fase 2 solo si valida contraste                                              | pendiente Fase 2 |

## Decisiones ante ambigüedades

1. El prompt asumía un tema claro editorial; el sitio real era oscuro cianotipo OKLCH. El propietario decidió migrar al tema claro del prompt (Fase 2).
2. Los 404 de `/_vercel/*` en local y el TTL 0 de caché son artefactos del servidor local, no defectos.
3. QR y Cal.com mantienen colores fijos por requisitos de terceros/escaneabilidad; quedan documentados como excepciones a la regla de tokens.
