# ORDEN · ③ Integración de fronteras y ADR

## Propósito

Fusionar el refactor contra el código previo sin regresión, documentar fronteras y
ADR, y cablear los gates de arquitectura (0 ciclos de dependencia) en el pipeline.

## Cuándo se activa

- Tras `orden-02-despliegue-base` o `@orden-03-integracion`.
- «integrar fronteras», «ADR», «ciclos de dependencia», «cerrar fase orden».

## Instrucciones

1. Leer `02-despliegue-base.json`.
2. Añadir `dependency-cruiser` y reglas de capas; verificar 0 ciclos y 0 violaciones.
3. Documentar ADR de los cambios estructurales y docstrings de fronteras de módulos públicos.
4. Cablear el gate en CI reutilizando el job `quality`; no duplicar jobs.
5. Volcar `.ai/skills/.phase/orden/03-integracion.json` con estado final.

## Formato de salida

Fichero limpio `03-integracion.json` + PR con diff mínimo + grafo de dependencias + ADRs.

## Restricciones

- No mergear con ciclos de dependencia o violaciones de capa.
- No reescribir el CI canónico; extender el job `quality`.
- No documentar ADR a posteriori sin reflejar la decisión real tomada.

## Casos límite

- Ciclo inevitable por límite de framework: aislar con interfaz y documentar excepción en ADR.
- Módulo público heredado sin dueño: crear ADR de adopción antes de exigir docstring.
