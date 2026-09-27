# Simplificación v2 — Cierre Fase E (2026-09-28)

**Rama:** `cursor/fase-e-cierre-v2` (desde `main` post #57–#60)
**PRs de producto:** #57 (A+B+C), #58 (D / ADR-0010), #59 (guardrail CI), #60 (TD.3 foto + A-5 sin testimonios)
**ADR:** [0010 — redondeo sutil y retirada de ticks](../architecture/decisions/0010-redondeo-sutil-retirada-ticks.md)

---

## 1. Resumen

Verificación final del plan v2 en `main` tras mergear Fases A–D, limpieza CI y foto en «Sobre mí». Se añade e2e de teclado del skip link y se archivan capturas before/after del estado post-calidez.

| Ítem                                       | Estado                                         |
| ------------------------------------------ | ---------------------------------------------- |
| TE.1 suite local (lint → lhci)             | ✅                                             |
| Skip link e2e (Tab → Enter → `#contenido`) | ✅ nuevo `tests/e2e/skip-link.spec.ts`         |
| TE.2 capturas + nota                       | ✅ `docs/audits/2026-09-28-simplificacion-v2/` |
| Gate E (aprobación visual operador)        | ⏳ pendiente                                   |

---

## 2. Checklist TE.1

| Comando               | Resultado                                                    |
| --------------------- | ------------------------------------------------------------ |
| `pnpm lint`           | 0 problemas                                                  |
| `pnpm typecheck`      | 0 errores                                                    |
| `pnpm test`           | 12 suites, 77 tests PASS                                     |
| `pnpm check:contrast` | **8/8 PASS** (+ tokens bp-glow/bp-deep)                      |
| `pnpm build`          | éxito (Node 22 via fnm)                                      |
| `pnpm test:e2e`       | **13/13 PASS** (8 axe + contact×2 + home-grid×2 + skip-link) |
| `pnpm lhci`           | 7 URLs × 2 runs, asserts ≥0.9 OK (`EXIT_LHCI=0`)             |

Node local por defecto era v26; la suite de build/e2e/lhci se ejecutó con **fnm Node 22.23.2** (`.nvmrc`).

---

## 3. Lighthouse móvil (media de 2 runs)

Umbral CI: ≥0.90. Aspiración ≥0.95 en home/servicios/contacto.

| Ruta                                | Perf | A11y | Best practices | SEO |
| ----------------------------------- | ---- | ---- | -------------- | --- |
| `/`                                 | 99   | 100  | 96             | 100 |
| `/servicios/`                       | 100  | 100  | 96             | 100 |
| `/servicios/produccion-sitios-web/` | 100  | 100  | 96             | 100 |
| `/proyectos/`                       | 99   | 100  | 96             | 100 |
| `/proyectos/front-valencia/`        | 99   | 100  | 96             | 100 |
| `/como-trabajo/`                    | 100  | 100  | 96             | 100 |
| `/contacto/`                        | 98   | 100  | 96             | 100 |

Home / servicios / contacto cumplen la aspiración ≥0.95 en performance y accessibility.

---

## 4. Evidencia visual (TE.2)

Ubicación: `docs/audits/2026-09-28-simplificacion-v2/`

- **before/**: capturas del after de ADR-0009 (`2026-09-28-simplificacion/after/`) = estado pre–Fases A–D (sin redondeo `rounded-lg`, sin foto sobre-mí).
- **after/**: estado actual post #57–#60 (calidez + skip link + foto). Generadas con `scripts/capture-audit-shots.mjs` contra `pnpm preview`.

| Ruta                  | Desktop (1440×900)                                             | Móvil (360×800)                                                 |
| --------------------- | -------------------------------------------------------------- | --------------------------------------------------------------- |
| Home                  | `before/home-desktop.png` → `after/home-desktop.png`           | `before/home-mobile.png` → `after/home-mobile.png`              |
| Servicios             | `before/servicios-desktop.png` → `after/servicios-desktop.png` | idem móvil                                                      |
| Contacto              | `before/contacto-desktop.png` → `after/contacto-desktop.png`   | idem móvil                                                      |
| Caso (front-valencia) | `before/proyectos_front-valencia-*.png` → `after/…`            | idem                                                            |
| Sobre mí              | _sin before_ (ruta no capturada en ADR-0009)                   | solo `after/sobre-mi-desktop.png` / `after/sobre-mi-mobile.png` |

---

## 5. Gate E

Bloqueante: aprobación visual del operador sobre las capturas `after/` (redondeo, foto en sobre-mí, ausencia de ticks / jerga de plano en contenido).

Cuando el operador confirme: marcar Gate E cerrado en el plan de pendientes y mergear este PR de cierre.
