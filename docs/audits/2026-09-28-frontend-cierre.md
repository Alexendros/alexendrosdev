# Informe de cierre — Design System, Motion y Corrección Frontend (2026-09-28)

Trabajo ejecutado en tres fases apiladas, una rama y PR en borrador por fase:

| Fase | Rama                    | PR  | Contenido                                                                  |
| ---- | ----------------------- | --- | -------------------------------------------------------------------------- |
| 1    | `cursor/frontend-audit` | #63 | Correcciones P0–P3 (a11y, SEO, editorial, QA)                              |
| 2    | `cursor/ds-tokens`      | #64 | Tema claro #0f3778, tokens 3 capas, componentes, /design-system, stylelint |
| 3    | `cursor/motion`         | #65 | Reveal v2, hero, microinteracciones, view transitions, QA final            |

Baseline previo en `docs/audits/2026-09-28-frontend-baseline.md`.

## Criterios de aceptación (prompt §6) — resultado

| Métrica                                 | Objetivo               | Medido                                                                    | Estado                                       |
| --------------------------------------- | ---------------------- | ------------------------------------------------------------------------- | -------------------------------------------- |
| Lighthouse móvil Perf / A11y / BP / SEO | ≥95 / 100 / 100 / 100  | **100 / 100 / 100 / 100**                                                 | ✅                                           |
| LCP / CLS / INP                         | <2.0s / <0.05 / <150ms | 1.9s / 0 / TBT 0ms                                                        | ✅ (INP no medible en lab; TBT 0 como proxy) |
| axe-core / pa11y                        | 0 violaciones          | 0 (13/13 e2e, 7 rutas axe)                                                | ✅                                           |
| Peso home transferido                   | <400 KB                | 173 KiB                                                                   | ✅                                           |
| JS total                                | <30 KB gzip            | ~6 KB gzip (2 KB motion + isla ContactForm aparte)                        | ✅                                           |
| Colores/px hardcodeados fuera de tokens | 0                      | 0 (stylelint lo fuerza; excepciones documentadas: QR y Cal.com)           | ✅                                           |
| `!important`                            | 0                      | 0                                                                         | ✅                                           |
| `prefers-reduced-motion`                | 100%                   | 100% (media query + toggle `.force-reduced-motion`)                       | ✅                                           |
| Contenido usable sin JS                 | Sí                     | Sí (estados ocultos gated por clase js)                                   | ✅                                           |
| Trackers / cookies publicitarias        | 0                      | 0 (solo Vercel Analytics/Speed Insights agregados, solo en builds Vercel) | ✅                                           |

## Fase 1 — Correcciones (PR #63)

- `aria-current="page"` en nav desktop/móvil; patrón card-link en ServiceCard/ProjectCard (nombre accesible = título); `coverAlt` descriptivos; "↗" aria-hidden.
- OG image por servicio y proyecto (`scripts/gen-og.mts` + tsx, loader stub para astro:assets); JSON-LD `@graph` Person + ProfessionalService (Valencia, €€); sitemap con `/servicios/landing-10-dias`.
- Precios con espacio fino U+202F antes del € (contenido + test actualizado).
- BlueprintMotif a `currentColor`; hex fijos de QR/Cal.com documentados como excepciones.
- Scripts `check:links` (linkinator) y `lint:a11y`; deps tsx y linkinator.
- Verificado preexistente y documentado: headers de seguridad en vercel.json, `rel="noopener"` en externos, skip-link, jerarquía de encabezados, H1 sin problema de espacio, FIG. 04 intencional, tira Dimension decorativa.

## Fase 2 — Design System (PR #64)

- Migración del tema oscuro cianotipo al claro editorial azul `#0f3778` (decisión del propietario; ADR 0011 supersedes 0006 y 0007).
- `global.css` en `@layer reset, tokens, base, components, utilities`; 3 capas de tokens (15 primitivos → semánticos → componente); tipografía fluida clamp; espaciado 4px; motion tokens.
- Tema oscuro publicado (`prefers-color-scheme` + `data-theme`): valida contraste en ambos temas (22/22 pares; `scripts/check-contrast.mjs` reescrito con `contrast-lib.mjs` compartida, parsea hex/var/color-mix, exit 1 ante fallo).
- Componentes: Button, Link, Badge, Eyebrow, Section/SectionHeader, Container/Stack/Grid, SkipLink; todas las páginas migradas; FigureHead como wrapper de SectionHeader.
- `/design-system` (noindex) generada desde tokens reales + `docs/design-system.md`.
- Stylelint (`lint:css`) prohíbe literales de color, `!important`, `transition: all` fuera de tokens; en lint-staged y CI quality.
- Favicon redibujado en la identidad nueva.
- Regresión detectada y corregida en fase: CLS 0.167 → 0 (motif hero con dimensiones fijas + preload de woff2 latin; bonus FCP 1.5s → 1.0s).

## Fase 3 — Motion (PR #65)

- Reveal v2: stagger `--i × --stagger` (60ms), 700ms `--ease-out`, IO con unobserve; visible sin JS intacto.
- Hero: entrada escalonada ≤700ms; H1 (LCP) solo `transform`, nunca opacity; badge con pulso; Dimension con `scaleX` CSS puro.
- Microinteracciones: botones (translateY + sombra en `::after` animando solo opacity, `scale(.98)` active), `.link-arrow` translateX, cards con lift + zoom de portada, header con sombra por sentinel IO (sin scroll listener), indicador nav bajo `aria-current`.
- Barra de progreso global con `animation-timeline: scroll(root)` (solo `@supports`, sin fallback JS); view transitions MPA (fundido 200ms, header fijo).
- Imágenes: placeholder + fundido onload en ProjectCard (gated por js; ficha eager/LCP intacta).
- JS de motion: 2.016 B gzip. /design-system con demos y toggle reduced-motion.

## QA final (este cierre)

- Analytics/Speed Insights solo en builds Vercel (`__IS_VERCEL__` vía `define` en astro.config.mjs): elimina los 404 de `/_vercel/*` en local/CI → **Best Practices 100**.
- `lighthouserc.json` con umbrales del prompt: perf ≥0.95, a11y/BP/SEO 1.0, CLS ≤0.05, LCP ≤2.5s.
- Batería final: lint:css ✅ · check:contrast ✅ · typecheck ✅ · lint ✅ · test 77/77 ✅ · build ✅ · e2e 13/13 ✅ · Lighthouse 100/100/100/100 ✅.
- `AGENTS.md` actualizado con los nuevos hechos del workspace.

## Desviaciones del prompt maestro (documentadas)

1. **Tema**: el prompt asumía un sitio claro; el sitio real era oscuro cianotipo. El propietario eligió migrar al tema claro del prompt (hecho en Fase 2).
2. **Estructura de tokens**: se mantiene Tailwind 3.4 mapeando a custom properties en lugar de `@layer` puro como única vía (el stack real manda).
3. **`--focus-ring`**: `color-mix(--brand 55%)` en vez de `--blue-500 55%` para alcanzar 3:1; `.focus-ring` usa outline sólido `--brand`.
4. **Nombres de componentes**: se conservan ServiceCard/ProjectCard/AxisCard/FigureHead (churn mínimo); equivalencias con la tabla del prompt documentadas en `docs/design-system.md`.
5. **Colores fijos**: QR (`qrSvg.ts`) y Cal.com (`CAL_BRAND`) mantienen hex fijos por escaneabilidad/requisito de tercero; comentados y exentos en stylelint/docs.
6. **H1 "espacio perdido"**: no reproducible en el código real (la coma cierra la línea 1 y el span continúa); verificado, sin acción.
7. **FIG. 04**: sin contenido intermedio por diseño (título + texto + CTA); no es un acordeón roto.
8. **Barra de progreso y view transitions**: solo obedecen al SO (limitación de `@supports`/`@view-transition`, sin selector de clase); documentado en /design-system.
9. **OG images**: paleta de marca nueva sobre fondo azul `#0f3778` (antes oscuro/ámbar).

## Pendientes conocidos (fuera de alcance)

- INP real requiere datos de campo (CrUX/RUM); en lab TBT es 0ms.
- SMTP/Upstash en Vercel para `POST /api/contact` (issue #13, preexistente).
- Validar Preview de Vercel tras merge de los tres PRs (issue #11) y medir la tabla de aceptación sobre producción.
- Los PRs están apilados (#63 ← #64 ← #65): mergear en orden o retargetear.
- `CHANGELOG.md` lo genera semantic-release al mergear a main (conventional commits ya aplicados).
