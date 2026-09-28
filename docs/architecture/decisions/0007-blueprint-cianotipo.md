# ADR 0007: cianotipo denso a sangre estilo imagen de referencia

> Estado: superseded por [ADR 0011](0011-tema-claro-editorial.md)
> (2026-09-28). Se conserva como historial; el tema activo es el claro
> editorial definido en el ADR 0011.

- Estado: aceptado
- Fecha: 2026-09-27
- Rama: `cursor/blueprint-cianotipo` (desde `cursor/blueprint-tema-azul`)

## Contexto

El tema azul (ADR 0006) dejaba el fondo plano. El usuario aportó la imagen de
referencia (cianotipo clásico denso: azul Prusia con centro luminoso y viñeta,
retícula fina, linework blanco) y pidió fondo fiel a esa base más desarrollo
del estilo en efectos, componentes y diseños. Decisiones cerradas: plano
auténtico, ámbar solo en sellos/CTAs/etiquetas, alcance sitio completo.

## Decisión

- Fondo `body` por capas: radial luminosa central (`--bp-glow`), retícula
  menor 22px/0.12, retícula mayor 120px/0.15, viñeta profunda (`--bp-deep`)
  sobre base `--bg`. Sin `background-attachment: fixed`. Tokens de texto
  intactos.
- `Scene` → hoja a sangre con retícula doble + cajetín (`PLANO GENERAL`,
  `FIG.`, `ESC 1:1`) + rótulo; nuevo `BlueprintMotif` (linework decorativo,
  `aria-hidden`, sin animación) en hero; `Dimension` con línea de eco.
- Cards y paneles a esquinas afiladas (`rounded-none`) + corner ticks
  (reutiliza `.bp-tick`) + kicker mono (`CASO ·`, `SERVICIO ·`, `EJE`);
  `PageHead` unifica portadas con cajetín y regla; header/footer con franja
  `.bp-hatch`; footer como cajetín (`HOJA · ALEXENDROS.DEV`, `ESC 1:1`).
- `bp-duo` → duotono cianotipo solo-CSS con fallback a imagen original.
  Aproximación conocida: las zonas muy claras quedan azul pálido en vez de
  azul profundo; se acepta por robustez (sin assets nuevos).
- Nueva `404.astro` estilo plano. Píldoras ámbar, QR e inputs funcionales
  intactos; pricing sin tocar.
- Retícula, hatch, motivo y cajetín son decorativos (`aria-hidden`), exentos
  WCAG; `check:contrast` añade guardrail de `--bp-glow/--bp-deep` y lo
  documenta. Pares §3.1: 6/6 PASS.

## Verificación

prettier, typecheck, eslint, 77 vitest, build, e2e 10/10 (axe 0
violaciones), capturas home/caso/contacto calibradas contra la referencia.
