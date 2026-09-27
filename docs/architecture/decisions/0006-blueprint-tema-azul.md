# ADR 0006: Activación del tema azul blueprint

Fecha: 2026-09-27 — Rama: `cursor/blueprint-tema-azul`

## Contexto

Las fases 0–3 mantuvieron el tema oscuro y dejaron `--bp-bg/--bp-fg`
(azul de plano + blanco) en reserva sin uso (ADR 0002). En la revisión
visual se confirmó que todo lo aprobado estaba aplicado, pero el usuario
pidió activar el fondo azul blueprint con letras blancas como nuevo alcance.

## Decisión

- `--bg` → `oklch(0.35 0.12 260)` (#0f3778), `--fg` → `oklch(0.97 0.01 260)`
  (#f1f5fc): los mismos valores de la reserva `--bp-bg/--bp-fg`.
- `--muted` → `oklch(0.85 0.03 260)`, `--border` → `oklch(0.75 0.05 260)`
  (líneas claras, estética de plano), `--card` → `oklch(0.29 0.1 260)`
  (panel azul más oscuro).
- Nuevo token `--ink` (`oklch(0.14 0.01 240)`, color `ink` en Tailwind)
  para el texto oscuro sobre botones ámbar; los 10 usos de `text-bg`
  en CTAs pasan a `text-ink` (9 ficheros).
- Retícula `.grid-pattern`: alfa 0.03 → 0.10 para que se vea sobre azul.
- `theme-color` → `#0f3778`. El ámbar `--primary` se mantiene intacto
  (5.20:1 sobre azul, fin de la deriva confirmado).
- `scripts/check-contrast.mjs`: el par de CTAs pasa a `ink/primary`;
  el resto de pares §3.1 se revalidan con los nuevos valores.

## Consecuencias

- `pnpm check:contrast`: 6/6 PASS (fg/bg 10.55, muted/bg 7.28,
  ink/primary 9.00, primary/bg 5.20, fg/card 13.10, muted/card 9.04).
- e2e axe: 8/8 rutas, 0 violaciones con el tema azul.
- QR de reserva (`bg-white`) y marca Cal (`#FFC53D`) no cambian: son
  funcionales, no UI del tema.
