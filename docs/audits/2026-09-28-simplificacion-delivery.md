# Simplificación visual y de experiencia — Entrega 2026-09-28

**Rama:** `feat/simplificacion-visual` (basada en main `1991232`)
**PR acumulativo final:** pendiente de apertura contra `main`
**ADR:** 0009 — Blueprint atenuado (supersede puntos 2–3 de ADR-0008)

---

## 1. Resumen de cambios (fases 1–5 completadas)

| Fase | Área                                                                                                         | Cambios clave                                                                                                                                                                                                                               | Estado |
| ---- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1    | Fondo y decoración (`global.css`, `Scene.astro`, `FigureHead.astro`, `BlueprintMotif.astro`, `Footer.astro`) | Retícula 22px eliminada; retícula 120px α 0.15→0.06; `Scene` reducido a 4 ticks `aria-hidden`; `FIG.` único por sección; `BlueprintMotif` opacity desktop 0.35; `bp-hatch` solo en footer                                                   | ✅     |
| 2    | Tipografía e H1 (`global.css`, 15 componentes)                                                               | H1: `text-stroke` → sólido `--fg`, sombra 3→1; microtexto 10–11px→12px (`text-xs`), tracking 0.2–0.25em→0.1em; jerga plano (`HOJA`, `PLANO Nº`, `ESC 1:1`) fuera del contenido, solo footer                                                 | ✅     |
| 3    | Nav móvil, grid, banner, pulse (`Header.astro`, `Hero.astro`, `LandingBanner.astro`, `index.astro`)          | Hamburguesa `md:hidden` con `aria-expanded/controls`, foco/Escape; grid 4 `ServiceCard` estáticas (slider + `service-slider.ts` + test borrados); banner oculto hasta scroll≥300px, excluido en `/proyectos/*`; `motion-safe:animate-pulse` | ✅     |
| 4    | Casos e imágenes (`ProjectCard.astro`, `[slug].astro`, `projects.ts`)                                        | `.bp-duo` eliminado (clase muerta borrada); capturas a color real; alt descriptivo; copy cualitativo sin cifras inventadas                                                                                                                  | ✅     |
| 5    | Verificación completa                                                                                        | Lint, typecheck, `check:contrast` 6/6, build, tests (77/77), e2e (12/12, axe 8/8), LHCI 7 URLs                                                                                                                                              | ✅     |

**Archivos tocados:** 22 modificados, 3 borrados, 1 ADR nuevo.

---

## 2. Métricas objetivo vs. resultado

| Métrica                         | Antes         | Objetivo                      | Resultado                                | Verificación                                          |
| ------------------------------- | ------------- | ----------------------------- | ---------------------------------------- | ----------------------------------------------------- |
| Navegación móvil usable         | ❌ no existe  | ✅ menú accesible             | ✅                                       | e2e: nav móvil abre/cierra con teclado, foco correcto |
| Capas decorativas en `body`     | 6             | ≤3                            | 3 (glow + retícula 120px α0.06 + viñeta) | diff `global.css`                                     |
| Repeticiones `FIG.` por sección | 3             | 1                             | 1 (kicker `FigureHead`)                  | inspección DOM                                        |
| Tamaño mínimo microtexto        | 10–11px       | ≥12px                         | 12px (`text-xs`)                         | grep `text-[10px]`/`text-[11px]` = 0                  |
| Autoplay en home                | sí (6s)       | no                            | no (grid estático, 0 JS)                 | `service-slider.ts` borrado, test adaptado            |
| Imágenes casos a color real     | no (duotono)  | sí                            | sí                                       | `.bp-duo` eliminado + capturas                        |
| Contraste (6 pares)             | 6/6 PASS      | 6/6 PASS                      | 6/6 PASS                                 | `pnpm check:contrast`                                 |
| axe e2e (8 rutas)               | 0 violaciones | 0 violaciones                 | 0 violaciones                            | `pnpm test:e2e`                                       |
| Lighthouse mobile (4 cat.)      | ≥0.90 CI gate | ≥0.95 home/servicios/contacto | Ver reportes LHCI                        | `pnpm lhci` (7 URLs × 2 runs)                         |

---

## 3. Evidencia visual (capturas antes/después)

Ubicación: `docs/audits/2026-09-28-simplificacion/`

| Ruta                          | Desktop (1440×900)                                                                           | Móvil (360×800)                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Home**                      | `before/home-desktop.png` → `after/home-desktop.png`                                         | `before/home-mobile.png` → `after/home-mobile.png`                                         |
| **Servicios**                 | `before/servicios-desktop.png` → `after/servicios-desktop.png`                               | `before/servicios-mobile.png` → `after/servicios-mobile.png`                               |
| **Contacto**                  | `before/contacto-desktop.png` → `after/contacto-desktop.png`                                 | `before/contacto-mobile.png` → `after/contacto-mobile.png`                                 |
| **Proyecto (front-valencia)** | `before/proyectos_front-valencia-desktop.png` → `after/proyectos_front-valencia-desktop.png` | `before/proyectos_front-valencia-mobile.png` → `after/proyectos_front-valencia-mobile.png` |

**Scroll home after (desktop):** `after/scroll-0.png`, `scroll-1200.png`, `scroll-2400.png`, `scroll-3600.png`

---

## 4. Checklist de verificación final (todo verde)

- [x] `pnpm lint` — 0 problemas
- [x] `pnpm typecheck` — 0 errores
- [x] `pnpm check:contrast` — 6/6 PASS (AA)
- [x] `pnpm build` — éxito
- [x] `pnpm test` — 12 suites, 77 tests PASS
- [x] `pnpm test:e2e` — 12 tests PASS (incl. 8 rutas axe 0 violaciones + nav móvil + grid home)
- [x] `pnpm lhci` — 7 URLs × 2 runs, asserts OK
- [x] ADR-0009 creado y aceptado
- [x] Capturas antes/después archivadas (16 + 4 scroll = 20 PNG)
- [x] Sin regresiones: tokens, CI, SEO, formulario, reduced-motion, ARIA intactos

---

## 5. Riesgos resueltos y decisiones

| Riesgo              | Resolución                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------ |
| Identidad diluida   | Blueprint atenuado (no neutro): fondo azul + acentos se quedan, retícula solo donde no hay texto |
| Slider ADR-0008     | Supersedido por grid estático (ADR-0009 §8); test renombrado y adaptado                          |
| Métricas casos      | Sin inventar; copy cualitativo listo, datos reales pendientes del autor                          |
| Banner CLS          | Oculto en carga inicial (scroll≥300px), excluido en `/proyectos/*`                               |
| JS error `va.track` | `getVa()` blindado a `typeof track === 'function'`                                               |

---

## 6. Próximo paso

**Abrir PR acumulativo final** contra `main` con:

- Título sugerido: `feat(design): simplificación visual y de experiencia — blueprint atenuado (ADR-0009)`
- Descripción: este documento + link a capturas + reportes LHCI
- Reviewer: @alexendros (aprobación visual antes de merge)

**Post-merge:** semantic-release generará `v1.4.0` (minor: nuevas funcionalidades de nav + grid + banner controlado, sin breaking).

---

## 7. Comandos de verificación rápida para el reviewer

```bash
git checkout feat/simplificacion-visual
pnpm install
pnpm check:contrast      # 6/6
pnpm test                # 77/77
pnpm test:e2e            # 12/12 axe 0
pnpm lhci                # 7 URLs asserts OK
# Visual: abrir docs/audits/2026-09-28-simplificacion/after/*.png
```
