# Auditoría Fase E — Foto en «Sobre mí» + cierre del plan v2

**Fecha:** 2026-09-28 · **Commit base:** `main` tras merge de #60 (d2ffc9c)
**Contexto:** TD.3 (foto con suavizado en `/sobre-mi`), A-5 (retirada de scaffold de testimonios) y verificación final (TE.1/TE.2) del plan v2.

## Resultado de la suite completa (main)

| Verificación                           | Resultado                 |
| -------------------------------------- | ------------------------- |
| `pnpm lint`                            | OK                        |
| `pnpm typecheck`                       | OK                        |
| `pnpm test`                            | 77/77 (12 ficheros)       |
| `pnpm check:contrast`                  | OK (8/8)                  |
| `pnpm format:check`                    | OK                        |
| `pnpm build`                           | OK                        |
| `pnpm test:e2e` (axe + contacto + nav) | 12/12, 0 violaciones axe  |
| `pnpm lhci` (móvil, 7 rutas × 2 runs)  | Asertiones ≥0,9 superadas |

LHCI — aspiración ≥0,95 en home/servicios/contacto (móvil, mediana de 2 runs):

| Ruta          | Perf. | A11y | Best-pr. | SEO  |
| ------------- | ----- | ---- | -------- | ---- |
| `/`           | 0,99  | 1,00 | 0,96     | 1,00 |
| `/servicios/` | 0,99  | 1,00 | 0,96     | 1,00 |
| `/contacto/`  | 0,98  | 1,00 | 0,96     | 1,00 |

Reports completos: runs de LHCI del 2026-09-27 (build local de `main`).

## TD.3 — Foto en «Sobre mí»

- Procesado con `sharp`: recorte 4:5 centrado en el rostro, suavizado de piel
  gaussiano (σ≈1,3) con máscara elíptica — ojos, cejas y boca excluidos —
  y exportación a WebP (84 KB, objetivo <150 KB).
  Comparación lado a lado: `comparacion-suavizado.webp`.
- Integración: `src/pages/sobre-mi.astro`, columna de 300 px junto al titular
  (apilada en móvil), `rounded-lg` (ADR-0010), `srcset` 360/480/640/960,
  `alt`: «Retrato de Alejandro, desarrollador web en Valencia».

## Capturas

- `before/` — `/sobre-mi` **sin** foto (preview de main pre-#60,
  despliegue `alexendros-o7yt2j552…vercel.app`). Las demás rutas no cambiaron
  en #60: su «antes» está en `docs/audits/2026-09-28-simplificacion/before/`.
- `after/` — home, servicios, contacto, sobre-mí y caso Front Valencia
  (desktop 1280 y móvil 390), build local de `main` post-#60.

## A-5 — Scaffold de testimonios

Sin citas reales aportadas y sin referencias en el código, se eliminó
`src/content/testimonials.ts` y `public/testimonials/placeholder-*.svg`
(regla acordada en el plan). Si llegan citas firmadas con permiso, se
reintroduce el schema junto a la sección.

## Gate E

Suite completa verde + aprobación visual del operador (2026-09-27, PR #60).
Plan v2 cerrado.
