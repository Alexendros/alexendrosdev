# ADR 0011 — Tema claro editorial azul #0f3778 en tokens de 3 capas

- Estado: aceptado
- Fecha: 2026-09-28
- Rama: `cursor/ds-tokens` (desde `cursor/frontend-audit`)
- Supersedes: [0006](0006-blueprint-tema-azul.md) (tema azul oscuro) y
  [0007](0007-blueprint-cianotipo.md) (cianotipo denso). Los ADRs
  superseded quedan archivados como historial; la fuente de verdad del
  tema es esta hoja.

## Contexto

Los ADR 0006/0007 activaron un tema oscuro cianotipo (azul de plano
`oklch(0.35 0.12 260)` con ámbar en CTAs) a partir de una imagen de
referencia. Tras la Fase 1 de la auditoría frontend (rama
`cursor/frontend-audit`), el propietario decidió migrar el sitio a un
tema claro editorial con azul de marca `#0f3778` (prompt maestro del
proyecto). Decisión tomada por el propietario: este ADR la ejecuta y
documenta, no la cuestiona.

El tema anterior tenía los tokens planos (una sola capa `:root` con
OKLCH, decoración de fondo acoplada al oscuro) y un script de contraste
acoplado a OKLCH. La migración requiere una arquitectura de tokens que
permita tema claro por defecto, tema oscuro opcional y validación
automática de ambos.

## Decisión

- **Tres capas de tokens** en `src/styles/global.css`, organizado en
  `@layer reset, tokens, base, components, utilities` (las directivas
  `@tailwind` se conservan; `applyBaseStyles: false` ya estaba activo):
  - _Primitivos_ (`--blue-950…--blue-100`, `--ink-*`, `--paper-*`,
    `--line`, `--ok/--warn/--err`): nunca se consumen directamente
    desde componentes.
  - _Semánticos_ (los únicos que usan componentes): `--bg` (paper-50),
    `--bg-subtle` (blue-100), `--fg` (ink-900), `--fg-muted` (ink-500),
    `--brand` (blue-900), `--brand-hover` (blue-700), `--brand-fg`
    (paper-0, texto sobre brand), `--border` (line), `--card`
    (paper-0), `--danger` (err), `--focus-ring`.
  - _Fundamentales_: tipografía fluida (`--step--1…--step-4` con
    clamp, `--leading-tight/body`, `--tracking-eyebrow`), espaciado 4px
    (`--space-1…--space-24`), radios (`--radius-sm/md/lg`), sombras
    (`--shadow-1/2`), layout (`--container`, `--gutter`, `--header-h`)
    y motion (`--ease-*`, `--dur-*`, `--stagger`).
- **Mapeo Tailwind sin churn**: `tailwind.config.mjs` referencia los
  semánticos con los mismos nombres de clase actuales
  (`bg-bg`, `text-fg`, `bg-primary text-ink`, `text-muted`,
  `border-border`, `bg-card`, `text-danger`); `primarySoft/primaryGhost`
  pasan a `color-mix` sobre `var(--brand)` al 40%/8% (Tailwind v3 no
  aplica `/<alpha>` sobre `var()` — comportamiento preexistente que se
  documenta). Los CTAs dejan de ser ámbar: son azul oscuro con texto
  claro (`--brand` + `--brand-fg`).
- **Rework visual en claro**: fondo body con glow de `--bg-subtle` y
  retícula hairline 120px en `color-mix(--border 45%)` (ADN blueprint
  conservado en claro); `.bp-h1` sin text-shadow; `.bp-h1-draft` usa
  `--brand`; `.bp-hatch` con `color-mix(--brand 8%)`; `::selection`
  brand al 25%; se elimina el `!important` del banner reduced-motion
  (las reglas van tras `.visible/.hidden` con igual especificidad y
  ganan por orden en la capa); cero literales de color fuera de
  `:root` (guardrail en el script).
- **Tema oscuro opcional, publicado**: `:root[data-theme='dark']` +
  `@media (prefers-color-scheme: dark)` con los mismos overrides, sin
  toggle de UI. Se publica porque `scripts/check-contrast.mjs` valida
  TODOS los pares en ambos temas (verificación 2026-09-28: 22/22
  PASS). El bloque está marcado `@tema-oscuro:inicio/fin` y el script
  exige que ambas variantes coincidan exactamente. Si algún par dejara
  de cumplirse, el bloque se retira antes que relajar el umbral.
- **`scripts/check-contrast.mjs` reescrito**: parsea los tokens del
  propio `global.css` (hex + `var()` + `color-mix`), resuelve cadenas
  de variables y valida pares con mínimos WCAG AA: fg/bg, fg-muted/bg,
  brand-fg/brand, brand/bg, fg/card, fg-muted/card, danger/card,
  danger/bg, brand-fg/brand-hover (todo ≥4.5:1; `--brand` se usa como
  color de texto —precios, enlaces, kickers—, no solo como acento UI)
  y el anillo de foco compuesto sobre bg/card (≥3:1, WCAG 1.4.11).
  Sale con exit 1 si algún par falla. Añade el guardrail de fuente
  única: `global.css` sin `oklch()` y `tailwind.config.mjs` sin
  literales hex/oklch.
- **Desviaciones del prompt maestro, deliberadas**:
  - `--focus-ring` usa `color-mix(--brand 55%)` en vez de
    `color-mix(--blue-500 55%)`: con blue-500 haría falta ~85% de
    opacidad para superar 3:1 sobre bg/card y el anillo perdería
    suavidad. El color-mix con `--brand` al 55% da 3.13:1 (claro) y
    3.17:1 (oscuro).
  - La clase `.focus-ring` usa `outline: 2px solid var(--brand)` (no el
    token de anillo) porque el anillo al 55% no llega a 3:1; el token
    queda para componentes que combinen anillo + contorno (Fase 3).
- **`theme-color`** pasa a `#f6f8fc` (chrome del navegador en claro).

## Consecuencias

- `pnpm check:contrast`: 22/22 PASS en ambos temas (claro: fg/bg
  17.61, fg-muted/bg 5.25, brand-fg/brand 11.43, brand/bg 10.75,
  fg/card 18.72, fg-muted/card 5.58, danger/card 6.57, danger/bg 6.18,
  brand-fg/brand-hover 6.84, focus-ring 3.13; oscuro: 16.65, 7.76,
  9.01, 9.01, 15.04, 7.01, 6.05, 6.70, 10.85, 3.17).
- typecheck, lint, 77 vitest, build y e2e 13/13 (axe 0 violaciones en
  8 rutas) en verde.
- Capturas `/`, `/servicios`, `/proyectos`, `/contacto`, `/sobre-mi` a
  1440px y 375px revisadas: contraste legible, azul de marca visible
  en H1/badge/CTAs, tarjetas claras con borde.
- Lighthouse móvil local: performance 92, accesibilidad 100,
  best-practices 96, SEO 100 (LCP 1.7s, CLS 0.167, TBT 0ms).
- `public/favicon.svg` queda pendiente para la Fase 2b (sigue siendo
  oscuro con ámbar; se evaluará allí junto a /design-system).
- Los ADR 0002/0006/0007 mencionan tokens OKLCH y pares antiguos: se
  conservan como historial; este ADR manda sobre el tema.

## Verificación

`pnpm check:contrast` + `pnpm typecheck` + `pnpm lint` + `pnpm test`

- `pnpm build` + `pnpm test:e2e` + capturas Playwright MCP en
  `.playwright-mcp/2a-*-{1440,375}.png` + Lighthouse
  (`/tmp/lh-after-tokens.json`).
