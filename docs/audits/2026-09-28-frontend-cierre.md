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

## Addendum — Revisión profunda previa al merge (2026-09-29)

Revisión por 4 frentes (estilos/tokens, componentes, páginas/scripts, tooling) sobre el diff completo. Hallazgos resueltos:

| #   | Hallazgo                                                                                                          | Severidad | Fix                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Foco de teclado invisible en cards (`focus-within:outline-2` sin `outline-style`) — WCAG 2.4.7                    | Alta      | `focus-within:outline` añadido; verificado en CSS compilado                                                                         |
| 2   | `.card-lift::before` sin `position: relative` → sombra del tamaño de la sección en AxisCard                       | Alta      | `position: relative` en `.card-lift`; verificado en runtime                                                                         |
| 3   | Títulos OG cortados por el borde (wrap 30 chars a ~39px/char)                                                     | Media     | `wrap(title, 25)` + elipsis en truncado; 8 PNG regenerados y verificados                                                            |
| 4   | `--border` (1.33:1) como única frontera de inputs — WCAG 1.4.11                                                   | Media     | Nuevo semántico `--border-strong` (3.2/3.0 claro, 3.9/4.4 oscuro) + pares en check-contrast + `border-border-strong` en ContactForm |
| 5   | check-contrast salía 0 si el tema oscuro quedaba a medias; comparación sensible al orden                          | Media     | `darkPartial` → FAIL explícito; comparación insensible al orden; strip de comentarios en el parser                                  |
| 6   | Stylelint no cubría shorthand `border`/`outline`/`text-decoration`, nominales ni hex en color-mix                 | Media     | Propiedades añadidas, `color-named: never` (ignore inside-function), patrones hex no anclados; verificado con 3 controles positivos |
| 7   | Token `--focus-ring` muerto protegido por CI                                                                      | Media     | Cableado en `.focus-ring` (outline + box-shadow)                                                                                    |
| 8   | `aria-controls="mobile-nav"` sin destino                                                                          | Baja      | `id="mobile-nav"` en la nav                                                                                                         |
| 9   | `loading` de Button no anunciado por lectores                                                                     | Baja      | `sr-only` "Cargando…" + contenido `aria-hidden` mientras carga                                                                      |
| 10  | Clases muertas `hover:text-fg` sobre Link nav/inline                                                              | Baja      | Eliminadas (la variante ya fija el hover)                                                                                           |
| 11  | a11y.spec con timing stale (400ms vs reveal 700ms + hero)                                                         | Media     | `emulateMedia({ reducedMotion: 'reduce' })`: estado final inmediato y valida el camino reduced-motion                               |
| 12  | Observer de header.ts sin disconnect; posible parpadeo en el borde                                                | Baja      | `pagehide` → disconnect + histeresis rootMargin -1px                                                                                |
| 13  | `.lintstagedrc` con patrón `*.css` inerte                                                                         | Media     | `**/*.css`                                                                                                                          |
| 14  | `check:links` requería servidor manual                                                                            | Baja      | `scripts/check-links.sh` autocontenido (servidor efímero en 4322)                                                                   |
| 15  | `theme-color` solo claro pese al tema oscuro; sin `color-scheme`                                                  | Baja      | Metas duales por media query + `color-scheme` en base y overrides                                                                   |
| 16  | Reglas view-transition sin capa (ganaban a toda la arquitectura)                                                  | Baja      | Movidas a `@layer utilities`; duración con token `--dur-base`                                                                       |
| 17  | Sombras con `rgb()` literal duplicando `--blue-950`                                                               | Baja      | `color-mix` sobre el primitivo                                                                                                      |
| 18  | Eyebrow/Badge sin rest-spread; hint de Props sin usar                                                             | Baja      | Rest spread en ambos; type alias en Badge                                                                                           |
| 19  | Tabla de semánticos con radio sin recorte                                                                         | Baja      | Radio movido al wrapper con overflow                                                                                                |
| 20  | Contrato card-link (texto no seleccionable, sin interactivos anidados) y `aria-current` de sección indocumentados | Baja      | Documentados en `docs/design-system.md`                                                                                             |

Sin acción (justificado): tokens de tipografía/espaciado sin consumo directo (Tailwind cubre la escala base; los tokens quedan como contrato del DS), reveal.ts sin re-evaluar reduced-motion en caliente (caso marginal), payload de analytics presente en builds locales aunque no se inyecte (~8KB, sin 404), favicon simplificable a 16px (mejora cosmética), Grid/Stack sin validación de `gap` (contrato documentado).

Batería post-revisión: lint:css ✅ · check:contrast (26 pares) ✅ · typecheck ✅ · lint ✅ · test 77/77 ✅ · build ✅ · e2e 13/13 ✅ · check:links (44 enlaces) ✅ · Lighthouse móvil: **99/100/100/100**, LCP 1.7s, CLS 0 ✅
