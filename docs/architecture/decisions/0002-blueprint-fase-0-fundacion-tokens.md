# ADR 0002 — Blueprint Lab fase 0: tokens con fuente única + guardrail de contraste

### Propósito de este documento

- **Objetivos:** Registrar la fundación de la conversión Blueprint Lab sin cambio visual.
- **Estructura:** Contexto → decisión → consecuencias.
- **Contenido a integrar según contexto:** No reutilizar en otro repo; los valores son de `miwebsite-alexendrosdev`.

## Contexto

Los tokens de color vivían duplicados (`tailwind.config.mjs` y `:root` en `global.css`),
`.terminal-glow` estaba sin uso y `.grid-pattern` (germen del blueprint) también.
Los contrastes §3.1 no tenían validación automática y el ámbar `#FFC53D` solo
existía en OG/favicon/SVGs de proyectos, a la deriva del sistema.

## Decisión

- Fuente única: `:root` en `src/styles/global.css`; `tailwind.config.mjs` solo
  referencia `var()` (Fase 0 mantiene los valores actuales, sin cambio visual).
- Nuevos tokens `--primary-soft` / `--primary-ghost` porque Tailwind v3 no aplica
  `/<alpha>` sobre `var()`; migran `hover:border-primary/40` (ServiceCard,
  ProjectCard) y `border-primary/30 bg-primary/10` (ContactForm).
- Se elimina `.terminal-glow` (0 usos, ligado al acento lima). Se conserva y
  documenta `.grid-pattern` como base de la fase 1.
- Reserva `--bp-bg` / `--bp-fg` (azul de plano + blanco) sin uso hasta validar su
  contraste en fase 1.
- Nuevo `scripts/check-contrast.mjs` (`pnpm check:contrast`): valida los pares
  §3.1 (AA) e informa del par blueprint; falla si `tailwind.config.mjs` vuelve a
  contener literales `oklch(`.

## Consecuencias

- Cualquier deriva entre Tailwind y CSS rompe el script en lugar de pasar silenciosa.
- Las fases 1-3 construyen sobre estos tokens; el gate de fase 4 (axe 8 rutas,
  LHCI ≥90) dirá si la paleta final pasa.
- EF-05 queda optativo; EF-07 se implementará con degradación nativa cuando llegue.
