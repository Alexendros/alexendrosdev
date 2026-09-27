# ADR 0009 — Blueprint atenuado: simplificación visual y de experiencia

Fecha: 2026-09-28
Estado: aceptado

## Contexto

La identidad cianotipo / plano técnico (ADRs 0006–0008) se aplicaba a
máxima intensidad en todas las capas a la vez: retícula doble global más
retícula por sección, viñeta, glow, hatch, ticks en cada card y CTA,
cajetines, rótulos `FIG.` triplicados, microtexto mono de 10–11px con
tracking extremo, H1 con contorno, imágenes duotonizadas, slider con
autoplay y banner fijo permanente. La decoración competía con el mensaje
comercial. Además, en móvil (<768px) no existía navegación: el menú era
`hidden md:flex` sin hamburguesa.

## Decisión

**Blueprint atenuado**: el fondo azul y los acentos se quedan; la retícula
solo es perceptible en zonas sin texto; el cajetín queda solo en el
footer como firma de marca.

1. **Fondo** (`global.css`): eliminada la retícula menor de 22px; solo la
   mayor de 120px con alfa 0.15 → 0.06. Glow y viñeta intactos.
2. **Scene** (`Scene.astro`): eliminadas retícula doble, cajetín y rótulo
   `FIG.`; queda overlay `aria-hidden` con 4 corner ticks.
3. **FigureHead**: un solo kicker `FIG. 0N` por sección como índice.
4. **Hatch** (`.bp-hatch`): fuera del header y del banner; solo footer.
5. **H1** (`.bp-h1-draft`): contorno `text-stroke` → sólido `var(--fg)`;
   sombra de 3 capas → 1 sutil.
6. **Microtexto mono**: mínimo 12px, tracking 0.08–0.12em, un kicker por
   bloque. Jerga de plano (`FIG.`, `ESC 1:1`, `HOJA`) solo en footer.
7. **Nav móvil** (`Header.astro`): hamburguesa `md:hidden` con
   `aria-expanded`/`aria-controls`, panel con los 5 enlaces + CTA,
   cierre con `Esc` y gestión de foco (abrir → primer enlace; cerrar →
   botón). Respeta `prefers-reduced-motion`.
8. **Slider → grid** (home): `ServiceSlider` + `service-slider.ts` + su
   test eliminados; grid estático de 4 `ServiceCard` (mismo patrón que
   `/servicios`). Cero JS, las 4 ofertas comparables de un vistazo.
   Supersede el punto 2 del ADR-0008.
9. **Banner** (`LandingBanner.astro`): oculto en carga inicial, aparece
   tras scroll ≥300px; excluido también en `/proyectos/*`. Dismiss +
   localStorage intactos. Supersede parcialmente el punto 3 del ADR-0008.
10. **Casos**: filtro `.bp-duo` retirado (clase eliminada); capturas a
    color real. Copy problema → acción → resultado cualitativo, sin
    cifras inventadas. Alt descriptivo por imagen.
11. **Pulse** (hero): `animate-pulse` → `motion-safe:animate-pulse`.

## Consecuencias

- Contrastes sin cambios (misma paleta; `check:contrast` 6/6 PASS).
- Cobertura: `tests/e2e/slider.spec.ts` → `home-grid-nav.spec.ts`
  (rejilla 4 ofertas sin slider; nav móvil con teclado y foco); axe 8/8.
- Tokens, CI, SEO, formulario y gates de verificación intactos.
- Los ADRs 0006–0008 se conservan como registro histórico; este ADR los
  supersede donde indica.
- Pendiente de datos reales del autor: resultados cuantificados en casos
  (no se publican cifras inventadas).
