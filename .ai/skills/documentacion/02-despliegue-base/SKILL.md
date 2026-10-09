# DOCUMENTACIÓN · ② Diseño con Archify (suite completa)

## Propósito

Diseñar la documentación de fácil comprensión con la **suite completa de Archify**:
IR JSON tipado compilado de forma determinista a HTML/SVG autocontenido.

## Cuándo se activa

- Tras `documentacion-01-auditoria` o `@documentacion-02-despliegue-base`.
- «diseñar documentación», «diagramas Archify», «mapa de arquitectura».

## Instrucciones

1. Leer `01-auditoria.json`.
2. Producir el IR JSON tipado por cada vista y compilarlo con Archify a HTML/SVG.
3. Cubrir los cinco tipos de diagrama: arquitectura, flujo, secuencia, flujo de datos y ciclo de vida.
4. Aplicar presets, temas claro/oscuro y marcas de marca; movimiento finito con `prefers-reduced-motion`.
5. Volcar `.ai/skills/.phase/documentacion/02-despliegue-base.json`.

## Formato de salida

Fichero limpio `02-despliegue-base.json` + artefactos HTML/SVG autocontenidos por diagrama.

## Restricciones

- No publicar ni cablear CI todavía (fase ③).
- No introducir movimiento infinito ni ignorar `prefers-reduced-motion`.
- El movimiento del lector nunca entra en los exports canónicos.

## Casos límite

- Grafo muy grande: segmentar por subsistemas y enlazar vistas.
- Dato ausente: no inventar; marcar la laguna y volver a la fase ①.
