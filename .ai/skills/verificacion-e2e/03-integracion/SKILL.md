# VERIFICACIÓN E2E · ③ Integración de workflows y gates en CI

## Propósito

Cablear los workflows e2e contra el repositorio previo con gates en CI, estabilizar
las suites y cerrar el ciclo de correcciones a partir de diffs visuales y métricas.

## Cuándo se activa

- Tras `verificacion-e2e-02-despliegue-base` o `@verificacion-e2e-03-integracion`.
- «integrar e2e en CI», «gates e2e», «required checks», «estabilizar tests».

## Instrucciones

1. Leer `02-despliegue-base.json`.
2. Integrar las suites Playwright, LHCI y la regresión visual como checks de CI.
3. Declarar los gates bloqueantes (e2e rojas = 0, regresiones de contraste = 0, flaky = 0).
4. Ejecutar el ciclo de correcciones sobre los hallazgos críticos hasta dejarlos en 0.
5. Volcar `.ai/skills/.phase/verificacion-e2e/03-integracion.json`.

## Formato de salida

Fichero limpio `03-integracion.json` + workflow de CI + estado de gates + registro de correcciones.

## Restricciones

- No marcar un check como `required` si es inestable.
- No silenciar regresiones visuales reales subiendo el umbral sin justificación.
- No ampliar el alcance fuera de la verificación (la corrección funcional vive en su línea).

## Casos límite

- e2e lento en CI: paralelizar por shards y cachear navegadores.
- Regresión visual legítima (rebranding): actualizar baseline con revisión humana explícita.
