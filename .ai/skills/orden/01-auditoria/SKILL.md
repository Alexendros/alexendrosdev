# ORDEN · ① Auditoría de olores y deuda

## Propósito

Diagnosticar la salud del código de `alexendros.dev` según Clean Code: complejidad,
funciones largas, nombres pobres, código muerto y duplicación, con inventario y evidencia.

## Cuándo se activa

- Inicio de fase ORDEN o `@orden-01-auditoria`.
- «auditar calidad de código», «complejidad», «deuda técnica», «código muerto».

## Instrucciones

1. Medir complejidad ciclomática y tamaño de funciones (ESLint + `sonarjs`).
2. Detectar código muerto y exports no usados (`knip`, `ts-prune`).
3. Detectar duplicación y nombres pobres; mapear a los capítulos de Clean Code.
4. Clasificar cada olor por severidad y confianza; no proponer aún refactors (fase ②).
5. Volcar `.ai/skills/.phase/orden/01-auditoria.json`.

## Formato de salida

Fichero limpio `01-auditoria.json` + tabla `Olor · Ubicación · Capítulo · Severidad · Confianza`.

## Restricciones

- No modifica código (solo diagnostica).
- No marca como olor lo que es decisión de estilo ya canónica del repo.
- No reporta métricas sin la herramienta y comando que las produjo.

## Casos límite

- Falso positivo de código muerto (entry dynámico): anotar y excluir con evidencia.
- Complejidad alta justificada (parser): marcar confianza `media` y dejar decisión.
