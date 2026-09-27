# ADR 0008 — Hero, slider de ofertas y banner cajetín

Fecha: 2026-09-27
Estado: aceptado

## Contexto

La home necesitaba tres mejoras: hero con mayor identidad de plano,
sección «Cómo puedo ayudarte» (FIG.01) como slider automático de las
cuatro ofertas, y banner inferior de la oferta landing más atractivo con
botón más pequeño. El usuario aprobó además afilar todos los CTAs en
píldora (`rounded-full` → `rounded-none`) para coherencia con el lenguaje
afilado del cianotipo (ADR-0007).

## Decisión

1. **Hero** (`Hero.astro`, solo aditivo): kicker mono
   `PLANO GENERAL — DISEÑO WEB · VALENCIA`, motivo visible también en
   móvil (tenue), badge y CTA afilados con corner ticks. Copy intacto.
2. **Slider** (`ServiceSlider.astro` + `src/scripts/service-slider.ts`):
   panel rotativo con las 4 ofertas (título, short, pricingFrom, timeline,
   enlace), contador `01/04`, flechas, puntos, autoplay 6 s con pausa en
   hover/foco/interacción y sin autoplay con `prefers-reduced-motion`.
   Patrón carousel ARIA (`aria-roledescription`, `aria-live` en el
   contador, `inert` en diapositivas inactivas, teclado ←/→). Todo
   renderizado en el DOM (SEO intacto; sin JS se muestra apilado).
   Las diapositivas comparten celda de rejilla (`.bp-slide-hidden`) para
   evitar saltos de altura. Solo afecta a la home; `/servicios` conserva
   el grid completo.
3. **Banner** (`LandingBanner.astro`, lógica intacta): estilo cajetín con
   franja `.bp-hatch`, kicker `OFERTA · LANDING EN 10 DÍAS`, precio en
   ámbar, botón afilado pequeño (`px-4 py-1.5 text-sm`), fila compacta.
   Sin cambios en dismiss, localStorage, exclusiones ni eventos analytics.
4. **Afilado global**: 12 `rounded-full` en 10 ficheros → `rounded-none`
   (hero, FIG.04, header, banner, ContactForm, páginas de servicio,
   proyecto, sobre-mi, cómo-trabajo, 404, BookingOptions). Se conserva
   redondo solo el punto pulsante del hero y las píldoras ámbar/QR
   funcionales fuera de CTAs.

## Consecuencias

- Contrastes sin cambios (misma paleta; `check:contrast` 6/6 PASS).
- Cobertura: `service-slider.test.ts` (3 tests de rotación) + nuevo
  `tests/e2e/slider.spec.ts` (controles, teclado, contador); axe 8/8.
- Sin impacto en pricing, CMS, fuentes ni View Transitions (inactivo).
