# Design system

### Propósito de este documento

- **Objetivos:** Contrato de uso del design system: principios, tokens, componentes y reglas de accesibilidad. Complementa la vitrina viva en `/design-system` (no indexable) y la decisión 0011 en `docs/audits/decisions.json`.
- **Estructura:** Principios → tokens → componentes (API, variantes, do/don't, a11y) → excepciones de color fijo.
- **Contenido a integrar según contexto:** Documenta componentes y tokens de este repo. No copies patrones de landing/SaaS ni añadas colores fuera de `src/styles/global.css`.

## 1. Principios

1. **Fuente única de verdad.** Todo color vive en `src/styles/global.css` (capa `@layer tokens`). `tailwind.config.mjs` solo referencia `var()`/`color-mix()`; los guardrails los validan `scripts/check-contrast.mjs` (fuente única) y Stylelint (`pnpm lint:css`, sin literales fuera de la capa de tokens).
2. **Tres capas.** Primitivos (`--blue-*`, `--ink-*`, `--paper-*`, `--line`, `--err`) → semánticos (`--bg`, `--fg`, `--fg-muted`, `--brand`, `--brand-hover`, `--brand-fg`, `--border`, `--border-strong`, `--card`, `--danger`, `--bg-subtle`, `--primary-ghost`, `--focus-ring`) → componentes (clases Tailwind `bg-bg`, `text-fg`, `bg-primary`, `text-ink`, `text-muted`, `border-border`, `bg-card`, `text-danger`…). **Los componentes nunca consumen primitivos directamente.**
3. **Reglas duras.** Sin `!important` (Stylelint lo prohíbe), sin `transition: all`, sin colores literales en CSS fuera de `@layer tokens`, sin valores mágicos donde exista un token (`--space-*`, `--step-*`, `--radius-*`, `--dur-*`, `--ease-*`).
4. **Tema claro por defecto, oscuro opcional.** El tema oscuro se publica solo si `pnpm check:contrast` valida todos los pares en ambos temas (22/22 PASS). Sin toggle de UI: `prefers-color-scheme` + `data-theme`.
5. **Accesibilidad medible.** Pares de contraste WCAG AA en ambos temas (≥4.5:1 texto, ≥3:1 indicadores de foco), objetivo táctil ≥44px, foco visible siempre (`.focus-ring`), reduced-motion respetado en toda animación (media query + `.force-reduced-motion` para demos).

## 2. Tokens

Definidos en `src/styles/global.css` (`@layer tokens`). Tipografía fluida `--step--1…--step-4` (clamp), espaciado 4px (`--space-2…--space-24`, escalonado), radios `--radius-sm/md/lg`, sombras `--shadow-1/2`, layout `--container` (72rem) / `--container-narrow` (56rem) / `--gutter`, motion `--ease-out/--ease-in-out`, `--dur-fast/base/slow/reveal`, `--stagger`. La tabla de valores y ratios de contraste está en `/design-system`.

## 3. Componentes

Todos en `src/components/`. Clases utilidad de Tailwind permitidas; valores de color y espaciado siempre vía tokens.

### Foco

Un solo sistema: la clase `.focus-ring` (outline 2px `--brand` con offset 2px + anillo `--focus-ring`, ≥3:1 en ambos temas) aplicada a todo interactivo — Button, Link, navegación móvil, islas React (`ContactForm`, `PricingConfigurator`) y barra CTA. No usar utilidades sueltas `focus-visible:outline*` ni depender del outline por defecto del navegador.

### Button

- **API:** `href?` (con href renderiza `<a>`, sin él `<button>`), `variant: 'primary'|'secondary'|'ghost'` (default `primary`), `size: 'sm'|'md'|'lg'` (default `md`), `type?`, `disabled?`, `loading?` (solo `<button>`), rest spread de atributos nativos (`target`, `rel`, `data-*`, `aria-*`).
- **Variantes:** primary = `bg-brand` + texto `--brand-fg` (clases `bg-primary text-ink`, hover `bg-primaryHover`); secondary = borde `--border` + texto `--brand` sobre transparente; ghost = solo texto `--brand`.
- **Tamaños:** `md`/`lg` con `min-h-11` (44px, objetivo táctil). `sm` con `min-h-9` (36px) **solo para contextos densos** (cabecera, banner fijo); no usar `sm` para acciones primarias de contenido.
- **Estados:** hover (cambio de fondo/borde), `disabled` (en `<a>`: `aria-disabled` + `tabindex="-1"`; en `<button>`: atributo), `loading` (spinner `.btn-spinner`, `aria-busy`, botón deshabilitado mientras carga).
- **Do:** usar siempre para acciones (CTAs, envíos, "ver más"). **Don't:** no replicar sus clases a mano; no anidar otro botón/interactivo dentro.

### Link

- **API:** `href`, `variant: 'inline'|'nav'|'arrow'` (default `inline`), `current?` → `aria-current="page"` + color brand, rest spread nativo.
- **Variantes:** `inline` (subrayado, cuerpo de texto y legales), `nav` (cabecera/pie, hover brand), `arrow` (nav + `→` en `<span class="link-arrow" aria-hidden="true">`, ancla preparada para la animación de Fase 3).
- **Do:** enlaces de navegación y de texto siempre con Link. **Don't:** no usar Button para navegar sin acción (usar Link); no quitar el subrayado a enlaces en párrafos.

### Badge

- **API:** slot de texto, `class?`.
- **Estructura:** punto `.badge-dot` (pulso suave, pausado con reduced-motion) + texto mono en caja con borde.
- **Uso:** estados de disponibilidad/estado ("Disponible para nuevos proyectos"). No usar como etiqueta de precio ni como link.

### Eyebrow

- **API:** slot de texto, `as?: 'p'|'span'|'div'` (default `p`), rest spread nativo (`id`, `data-*`, `aria-*`).
- **Patrón:** kicker en mayúsculas mono, `tracking` de `--tracking-eyebrow`, color `--fg-muted`. Unifica `FIG. 0X`, kickers de portada (PageHead) y el del hero.

### Section / SectionHeader

- **Section:** `as?`, `cv?` (default true, `content-visibility`), `reveal?` (`data-reveal`), padding vertical de tokens. Componer con Container dentro.
- **SectionHeader:** `index` ("FIG. 0X" vía Eyebrow), `title`, `description?`, `linkHref?/linkText?` (Link arrow), `align?: 'start'|'center'`.

### Container / Stack / Grid

- **Container:** `size?: 'default'|'narrow'` (`--container` 72rem / `--container-narrow` 56rem), gutter `--gutter`. Sin padding vertical (lo da Section o la página).
- **Stack:** columna con `gap: var(--space-*)` (`gap` default `'4'`; la escala viva tras la poda es `2, 3, 4, 5, 6, 8, 16, 24`).
- **Grid:** rejilla con gap de token; las columnas van en `class` con clases responsive (`sm:grid-cols-2 lg:grid-cols-4`).

### SkipLink

Extraído de Layout: primer foco de la página, salta a `#contenido`, visible solo con teclado (`focus-visible`), z-index máximo. No reordenar en Layout.

### Superficies translúcidas (glass)

`.glass-bg` (header), `.glass-card` (barra CTA, 95 % y 80 % con `backdrop-filter`) y `.swatch-brand` viven en `@layer components`: cada una declara primero el fallback sólido con su token (`background: var(--bg)`…) y después `color-mix(in oklab, …)` para navegadores con soporte. Tailwind v3 no compila `/<alpha>` sobre `var()`, así que las translúcidas son siempre clases de componente, nunca utilidades.

### CMP (vanilla-cookieconsent v3)

`#cc-main` redefine las custom properties del vendor (`--cc-bg`, `--cc-btn-*`, `--cc-toggle-*`, `--cc-cookie-category-*`, radios, fuente…) con los tokens del sitio en `@layer components`. Un solo set sirve para claro y oscuro porque los tokens ya reaccionan al tema; los botones del banner usan el foco del sistema (outline 2 px `--brand`).

### Ventana rotatoria del H1 (home)

- **Uso:** solo el H1 de la home (`Hero.astro`). Tres frases complementan el arranque fijo; no se usa en portadas interiores ni en legales.
- **Movimiento:** CSS puro (`transform`/`opacity`), ciclo 9 s / paso 3 s, timing `linear`. Giro continuo (no se aplana con `prefers-reduced-motion`). Cada frase entra desde abajo con `rotateX` y sale hacia arriba. Sin control de pausa. El H1 no lleva CTA: las acciones viven bajo el párrafo del hero (decisión 0016).
- **A11y:** el escenario visual es `aria-hidden`; el nombre accesible del `h1` lista el arranque y las tres frases una sola vez. Sin `aria-live`. No reescribir el nombre durante el ciclo.
- **Don't:** no copiar la ventana a otras páginas; no añadir librerías de motion; no animar con propiedades distintas de `transform`/`opacity`.

### Tarjetas enlazables (ServiceCard / ProjectCard) — patrón card-link

- **Estructura:** el `<article>` no es enlace; el enlace vive en el título y se estira sobre toda la tarjeta con `::after { position:absolute; inset:0 }`. El nombre accesible es el título del servicio/caso (nunca "Ver qué incluye →" repetido: ese texto es `aria-hidden`). El foco de la tarjeta se muestra con `focus-within:outline` en `--brand` (mismo color que `.focus-ring`; Tailwind `outline-2` solo fija ancho y sin `outline` no se pinta nada).
- **Contrato:** dentro de una card-link **no puede haber otros elementos interactivos** (el `::after` los taparía) y el texto de la tarjeta **no es seleccionable con ratón** (el pseudo-elemento captura el mousedown). Si una tarjeta necesita un segundo enlace o texto seleccionable, no uses este patrón: enlaces explícitos por elemento.
- **A11y:** las páginas de detalle (`/servicios/x`) mantienen `aria-current="page"` en el item de sección del header ("Servicios"): marca la sección activa, no la página exacta. Es deliberado.

## 4. Excepciones de color fijo (deliberadas)

Sin excepciones activas: la excepción del QR de reserva (retirada con el embudo huérfano, fase B) y la del embed de Cal.com (sin consumidores en UI) se dieron de baja en la corrección integral 2026-10-12. No introducir excepciones sin justificarlas aquí.

## 5. Verificación

- `pnpm check:contrast` — pares WCAG AA en ambos temas + guardrails de fuente única.
- `pnpm lint:css` — Stylelint: sin literales de color fuera de `@layer tokens`, sin `!important`, sin `transition: all`.
- Axe (e2e) — 0 violaciones en las rutas cubiertas.
