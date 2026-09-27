# ADR 0004 — Blueprint Lab Fase 3: personalidad (OG, favicon, motion)

### Propósito de este documento

- **Objetivos:** Registrar las decisiones de personalidad de la Fase 3 del Blueprint Lab.
- **Estructura:** Contexto → decisión → consecuencias.
- **Contenido a integrar según contexto:** Continúa los ADR 0002 (Fase 0, tokens) y 0003 (Fase 2, contenido). No reutilices este ADR en otro repo.

## Contexto

La auditoría dejó el ámbar `#FFC53D` de OG/favicon a la deriva respecto a los tokens OKLCH, y el motion sin directriz. La Fase 3 cierra la identidad de assets y fija una micro-motion sobria. View Transitions sigue inactivo a propósito: queda fuera del Blueprint Lab.

## Decisión

- **Ámbar alineado al token:** favicon y OG usan `#d2aa00`, equivalente sRGB de `--primary: oklch(0.75 0.18 95)`; fondo `#060a0d`, equivalente de `--bg`. Sin amarillos a la deriva.
- **Favicon blueprint:** retícula tenue + marco ámbar + «A» mono, coherente con las escenas de Fase 2.
- **OG como plano:** nuevo máster vectorial `public/og/blueprint.svg` (retícula, marco con marcas de registro, rótulo `FIG. 00 — PLANO GENERAL`, línea de cota con las secciones) renderizado a `public/og/default.png` (1200×630) con `rsvg-convert`; la URL del meta no cambia.
- **`Layout.astro`:** solo se añaden `theme-color` (`#060a0d`) y `og:image:alt`; el resto del head queda intacto.
- **Micro-motion sobria:** transiciones globales solo de color en `a, button` (150 ms); `scroll-behavior: smooth` solo con `prefers-reduced-motion: no-preference`; el reveal de Fase 1 desactiva su transición con `reduce`.
- Sin colores nuevos: se reutilizan los tokens validados en Fase 0 (`primary/bg` 9.00, `muted/bg` 8.05).

## Consecuencias

- El favicon y la tarjeta social cambian de imagen; el PNG se regenera desde el SVG si cambia el copy.
- El scroll por ancla pasa a ser suave salvo `reduced-motion`; sin impacto en tests ni en a11y.
- Esta rama apila sobre `cursor/blueprint-fase-2-contenido`: el PR base es esa rama hasta que la Fase 2 se fusione.
