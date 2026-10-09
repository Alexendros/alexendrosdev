# VERIFICACIÓN E2E · ② Workflows automatizados

## Propósito

Implementar los workflows automatizados de verificación: funcionalidad e interfaz
(Playwright), métricas de salud y velocidad (Lighthouse CI) y regresión de contraste
visual de estilo y estructura, de modo que habiliten correcciones.

## Cuándo se activa

- Tras `verificacion-e2e-01-auditoria` o `@verificacion-e2e-02-despliegue-base`.
- «implementar e2e», «Playwright», «LHCI», «regresión visual», «snapshots».

## Instrucciones

1. Leer `01-auditoria.json`.
2. Escribir suites Playwright de funcionalidad e interfaz para los flujos críticos.
3. Configurar Lighthouse CI para métricas de salud y velocidad contra el presupuesto.
4. Añadir regresión de contraste visual (snapshots con `pixelmatch`) de estilo y estructura.
5. Dejar los resultados accionables para correcciones (diffs visuales, trazas, reportes LHCI).
6. Volcar `.ai/skills/.phase/verificacion-e2e/02-despliegue-base.json`.

## Formato de salida

Fichero limpio `02-despliegue-base.json` + suites Playwright + config LHCI + snapshots base.

## Restricciones

- No cablear los gates en el pipeline final ni fijar `required checks` (fase ③).
- No generar tests inestables (flaky): usar locators de rol y esperas explícitas.
- No solapar con la auditoría WCAG de ACCESIBILIDAD; aquí, regresión visual de estilo/estructura.

## Casos límite

- Diferencias de render por fuente/plataforma: fijar viewport, `fonts` y umbral de píxeles.
- Flujo con terceros: mockear en Playwright para estabilidad.
