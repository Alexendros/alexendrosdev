# Design system

### Propósito de este documento

- **Objetivos:** Contrato de uso del design system: principios, tokens, componentes y reglas de accesibilidad. Complementa la vitrina viva en `/design-system` (no indexable) y el ADR 0011.
- **Estructura:** Principios → tokens → componentes (API, variantes, do/don't, a11y) → excepciones de color fijo.
- **Contenido a integrar según contexto:** Documenta componentes y tokens de este repo. No copies patrones de landing/SaaS ni añadas colores fuera de `src/styles/global.css`.

## 1. Principios

1. **Fuente única de verdad.** Todo color vive en `src/styles/global.css` (capa `@layer tokens`). `tailwind.config.mjs` solo referencia `var()`/`color-mix()`; los guardrails los validan `scripts/check-contrast.mjs` (fuente única) y Stylelint (`pnpm lint:css`, sin literales fuera de la capa de tokens).
2. **Tres capas.** Primitivos (`--blue-*`, `--ink-*`, `--paper-*`, `--line`, `--ok/--warn/--err`) → semánticos (`--bg`, `--fg`, `--fg-muted`, `--brand`, `--brand-hover`, `--brand-fg`, `--border`, `--card`, `--danger`, `--bg-subtle`, `--focus-ring`) → componentes (clases Tailwind `bg-bg`, `text-fg`, `bg-primary`, `text-ink`, `text-muted`, `border-border`, `bg-card`, `text-danger`…). **Los componentes nunca consumen primitivos directamente.**
3. **Reglas duras.** Sin `!important` (Stylelint lo prohíbe), sin `transition: all`, sin colores literales en CSS fuera de `@layer tokens`, sin valores mágicos donde exista un token (`--space-*`, `--step-*`, `--radius-*`, `--dur-*`, `--ease-*`).
4. **Tema claro por defecto, oscuro opcional.** El tema oscuro se publica solo si `pnpm check:contrast` valida todos los pares en ambos temas (22/22 PASS). Sin toggle de UI: `prefers-color-scheme` + `data-theme`.
5. **Accesibilidad medible.** Pares de contraste WCAG AA en ambos temas (≥4.5:1 texto, ≥3:1 indicadores de foco), objetivo táctil ≥44px, foco visible siempre (`.focus-ring`), reduced-motion respetado en toda animación (media query + `.force-reduced-motion` para demos).

## 2. Tokens

Definidos en `src/styles/global.css` (`@layer tokens`). Tipografía fluida `--step--1…--step-4` (clamp), espaciado 4px `--space-1…--space-24`, radios `--radius-sm/md/lg`, sombras `--shadow-1/2`, layout `--container` (72rem) / `--container-narrow` (56rem) / `--gutter` / `--header-h`, motion `--ease-out/--ease-in-out`, `--dur-fast/base/slow/reveal`, `--stagger`. La tabla de valores y ratios de contraste está en `/design-system`.

## 3. Componentes

Todos en `src/components/`. Clases utilidad de Tailwind permitidas; valores de color y espaciado siempre vía tokens.

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
- **SectionHeader:** `index` ("FIG. 0X" vía Eyebrow), `title`, `description?`, `linkHref?/linkText?` (Link arrow), `align?: 'start'|'center'`. `FigureHead` sigue existiendo como wrapper de compatibilidad: las páginas nuevas usan SectionHeader directamente.

### Container / Stack / Grid

- **Container:** `size?: 'default'|'narrow'` (`--container` 72rem / `--container-narrow` 56rem), gutter `--gutter`. Sin padding vertical (lo da Section o la página).
- **Stack:** columna con `gap: var(--space-*)` (`gap` default `'4'`, claves `1…24`).
- **Grid:** rejilla con gap de token; las columnas van en `class` con clases responsive (`sm:grid-cols-2 lg:grid-cols-4`).

### SkipLink

Extraído de Layout: primer foco de la página, salta a `#contenido`, visible solo con teclado (`focus-visible`), z-index máximo. No reordenar en Layout.

### Tarjetas enlazables (ServiceCard / ProjectCard) — patrón card-link

- **Estructura:** el `<article>` no es enlace; el enlace vive en el título y se estira sobre toda la tarjeta con `::after { position:absolute; inset:0 }`. El nombre accesible es el título del servicio/caso (nunca "Ver qué incluye →" repetido: ese texto es `aria-hidden`). El foco se muestra con `focus-within:outline` (estilo + ancho + color: Tailwind `outline-2` solo fija ancho y sin `outline` no se pinta nada).
- **Contrato:** dentro de una card-link **no puede haber otros elementos interactivos** (el `::after` los taparía) y el texto de la tarjeta **no es seleccionable con ratón** (el pseudo-elemento captura el mousedown). Si una tarjeta necesita un segundo enlace o texto seleccionable, no uses este patrón: enlaces explícitos por elemento.
- **A11y:** las páginas de detalle (`/servicios/x`) mantienen `aria-current="page"` en el item de sección del header ("Servicios"): marca la sección activa, no la página exacta. Es deliberado.

## 4. Excepciones de color fijo (deliberadas)

| Elemento              | Valor                         | Motivo                                                                            |
| --------------------- | ----------------------------- | --------------------------------------------------------------------------------- |
| QR de reserva Cal.com | `bg-white`                    | Funcional: el QR debe escanearse; el azul de marca baja la legibilidad del código |
| Marca Cal.com (embed) | `#FFC53D` (su propio dominio) | Marca de terceros: no es UI del tema                                              |

Documentado en Fase 1 (commit `a86528d`) y validado como excepción en la auditoría; no introducir nuevas excepciones sin justificarlo aquí.

## 5. Verificación

- `pnpm check:contrast` — pares WCAG AA en ambos temas + guardrails de fuente única.
- `pnpm lint:css` — Stylelint: sin literales de color fuera de `@layer tokens`, sin `!important`, sin `transition: all`.
- Axe (e2e) — 0 violaciones en las rutas cubiertas.
