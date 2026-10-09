# DOCUMENTACIÓN · ③ Integración y enriquecimiento de la documentación

## Propósito

Integrar y enriquecer la documentación de fácil comprensión y uso contra el
repositorio previo: publicación, enlaces, exports canónicos y mantenimiento en CI.

## Cuándo se activa

- Tras `documentacion-02-despliegue-base` o `@documentacion-03-integracion`.
- «publicar documentación», «enriquecer docs», «mantenimiento de documentación».

## Instrucciones

1. Leer `02-despliegue-base.json`.
2. Integrar los artefactos de Archify en el sitio/repo (rutas, índice, navegación).
3. Enriquecer con narrativa de uso, ejemplos y enlaces cruzados entre diagramas.
4. Verificar 0 enlaces rotos y exports canónicos válidos; cablear el refresco en CI.
5. Volcar `.ai/skills/.phase/documentacion/03-integracion.json`.

## Formato de salida

Fichero limpio `03-integracion.json` + documentación publicada + workflow de refresco.

## Restricciones

- No publicar con enlaces rotos ni exports inválidos.
- No duplicar contenido: enlazar a la fuente única de verdad.
- No ampliar el alcance al diseño (vive en la fase ②).

## Casos límite

- Documentación desincronizada con el código: regenerar desde la fase ①/②, no parchear a mano.
- Export pesado: optimizar SVG y dividir por secciones.
