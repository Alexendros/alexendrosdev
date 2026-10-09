# ORDEN · ① Auditoría de olores, deuda y estilos

## Propósito

Diagnosticar la salud del código de `alexendros.dev` según Clean Code (complejidad,
funciones largas, nombres pobres, código muerto y duplicación) e inventariar la
higiene de estilos: literales de color, `!important`, `transition: all` y CSS disperso.

## Cuándo se activa

- Inicio de fase ORDEN o `@orden-01-auditoria`.
- «auditar calidad de código», «complejidad», «deuda técnica», «código muerto», «estilos», «colores».

## Instrucciones

1. Medir complejidad ciclomática y tamaño de funciones (ESLint + `sonarjs`).
2. Detectar código muerto y exports no usados (`knip`, `ts-prune`).
3. Detectar duplicación y nombres pobres; mapear a los capítulos de Clean Code.
4. Censar estilos (stylelint): literales de color fuera de tokens, `!important`,
   `transition: all` y hojas de estilo dispersas candidatas a consolidar en un único CSS.
5. Clasificar cada olor por severidad y confianza; no proponer aún refactors (fase ②).
6. Volcar `.ai/skills/.phase/orden/01-auditoria.json`.

## Formato de salida

Fichero limpio `01-auditoria.json` + tabla `Olor · Ubicación · Capítulo/Regla · Severidad · Confianza`.

## Restricciones

- No modifica código ni estilos (solo diagnostica).
- No marca como olor lo que es decisión de estilo ya canónica del repo.
- No reporta métricas sin la herramienta y comando que las produjo.

## Casos límite

- Falso positivo de código muerto (entry dinámico): anotar y excluir con evidencia.
- Color literal en SVG/tercero no tematizable: anotar como excepción justificada.
