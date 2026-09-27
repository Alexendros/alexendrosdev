# ADR 0010: redondeo sutil y retirada de corner ticks

- Estado: aceptado
- Fecha: 2026-09-28
- Rama: `feat/simplificacion-v2-calidez-redondeo` (desde `feat/simplificacion-v2-limpieza-a11y-homogeneidad`)

## Contexto

La simplificación v2 (plan aprobado por el operador) busca un carácter más
amable que invite a quedarse. El ADR 0007 llevó el cianotipo a esquinas
afiladas (`rounded-none`) con corner ticks (`.bp-tick`) en cards, CTAs y
banner. En la revisión v2 el operador aprobó «redondeo sutil (rounded-lg)»
y la retirada de los ticks, que con esquinas redondeadas quedaban
visualmente rotos (flotando fuera de la esquina) y añadían ruido.

## Decisión

- `rounded-none` → `rounded-lg` en todo `src/` (15 archivos: cards, CTAs,
  inputs, píldoras, paneles, 404). Se mantiene `rounded-full` en el punto de
  disponibilidad del hero y `rounded-xl` en el QR (ya eran redondeados).
- Retirados los 4 spans `.bp-tick` por elemento (Hero CTA, ServiceCard,
  ProjectCard, AxisCard, LandingBanner) y el bloque CSS `.bp-tick*` de
  `global.css`. La clase `relative` que solo posicionaba ticks se elimina de
  esos mismos elementos; el `relative` de la sección hero se conserva
  (posiciona `BlueprintMotif`).
- BookingOptions: `whitespace-nowrap` en el CTA de reserva para que
  «Reservar sesión técnica» no rompa en dos líneas junto al QR.
- La identidad blueprint se mantiene en lo estructural: fondo cianotipo por
  capas, retícula, hatch, cajetines de `PageHead`, kickers mono de sección
  (`FIG.`) y motivo esquemático. Lo que se retira es la ornamentación de
  esquina, no el lenguaje.

## Consecuencias

- Sitio visualmente más suave y homogéneo; menos marcas compitiendo con el
  contenido.
- `Scene.astro` (borrado en el PR de Fases A+B+C) era el último consumidor
  de ticks además de los aquí retirados: sin referencias residuales.

## Verificación

- `grep -rn "bp-tick" src/` → cero residuos (salvo el `Scene.astro` ya
  eliminado en la rama hermana).
- `grep -rn "rounded-none" src/` → cero residuos.
- `node scripts/check-contrast.mjs` → 8/8 PASS (cambio de radio no afecta a
  contraste).
- CI del PR: quality / test / build / smoke.
