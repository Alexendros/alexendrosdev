# DOCUMENTACIÓN · ① Recopilación de datos y auditoría documental

## Propósito

Recopilar los datos de `alexendros.dev` (código, arquitectura, flujos, datos y ciclo
de vida) e inventariar la documentación existente y sus carencias, para alimentar el
diseño posterior con **Archify**.

## Cuándo se activa

- Inicio de línea DOCUMENTACIÓN o `@documentacion-01-auditoria`.
- «recopilar datos para documentar», «auditar documentación», «Archify».

## Instrucciones

1. Recopilar las fuentes: estructura del repo, módulos, flujos de usuario, datos y dependencias.
2. Cruzar con los ficheros limpios de las demás líneas cuando existan (contexto de calidad).
3. Inventariar la documentación actual y detectar zonas críticas sin documentar.
4. Preparar los datos para los cinco tipos de diagrama de Archify (arquitectura, flujo, secuencia, flujo de datos, ciclo de vida).
5. Volcar `.ai/skills/.phase/documentacion/01-auditoria.json`.

## Formato de salida

Fichero limpio `01-auditoria.json` + tabla `Fuente · Tipo · Diagrama objetivo · Estado`.

## Restricciones

- No diseña ni genera diagramas (fase ②).
- No publica ni enlaza documentación (fase ③).
- No inventa datos: solo recopila lo verificable desde la fuente.

## Casos límite

- Zona sin fuente fiable: marcar como «pendiente de decisión», no documentar a ciegas.
- Datos sensibles: excluir secretos y credenciales del material documental.
