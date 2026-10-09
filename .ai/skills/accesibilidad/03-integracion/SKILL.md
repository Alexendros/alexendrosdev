# ACCESIBILIDAD · ③ Integración LHCI y presupuestos

## Propósito

Fusionar las correcciones contra el código previo y cablear los gates de accesibilidad,
SEO y Core Web Vitals en el pipeline, alineados a los umbrales ya canónicos del repo.

## Cuándo se activa

- Tras `accesibilidad-02-despliegue-base` o `@accesibilidad-03-integracion`.
- «integrar LHCI», «cerrar fase accesibilidad», «presupuestos de rendimiento».

## Instrucciones

1. Leer `02-despliegue-base.json`.
2. Reutilizar el flujo e2e/axe (7 rutas) y LHCI móvil **opt-in** (label `e2e`); no duplicar jobs.
3. Confirmar gates: LHCI a11y/SEO = 100, perf ≥ 95, LCP ≤ 2.5s, CLS ≤ 0.05, axe 0 violaciones.
4. Verificar 0 regresiones sobre rutas previas.
5. Volcar `.ai/skills/.phase/accesibilidad/03-integracion.json`.

## Formato de salida

Fichero limpio `03-integracion.json` + PR con diff mínimo + tabla de gates LHCI/axe.

## Restricciones

- No bajar los umbrales LHCI existentes para «pasar».
- No convertir e2e/LHCI en bloqueante por defecto; respetar el opt-in por label.
- No mergear con un gate blocking en rojo.

## Casos límite

- Regresión de LCP por nuevo recurso: optimizar (sharp/`content-visibility`) antes de merge.
- Métrica inestable entre corridas: usar mediana de 3 ejecuciones LHCI.
