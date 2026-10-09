# ORDEN · ② Despliegue base de refactor

## Propósito

Aplicar desde ficheros limpios los refactors de la auditoría (SRP, nombres claros,
funciones pequeñas) y fijar reglas de lint y convenciones de nomenclatura.

## Cuándo se activa

- Tras `orden-01-auditoria` o `@orden-02-despliegue-base`.
- «refactorizar», «aplicar SRP», «funciones pequeñas», «convención de nombres».

## Instrucciones

1. Leer `01-auditoria.json`; priorizar olores de mayor severidad.
2. Refactorizar en pasos pequeños y verificables (extract-method, rename, SRP), con tests verdes tras cada paso.
3. Endurecer reglas ESLint de complejidad y documentar convenciones de nomenclatura.
4. Mantener comportamiento idéntico: refactor sin cambio funcional.
5. Volcar `.ai/skills/.phase/orden/02-despliegue-base.json`.

## Formato de salida

Fichero limpio `02-despliegue-base.json` + diff de refactor + delta de complejidad.

## Restricciones

- No mezclar refactor con cambio de comportamiento en el mismo commit.
- No introducir abstracciones especulativas (YAGNI).
- No cablear reglas de fronteras/ADR en CI (fase ③).

## Casos límite

- Refactor rompe un test: el test manda; revisar si el test codifica el comportamiento correcto.
- Módulo con alta complejidad irreducible: aislarlo y cubrirlo con tests antes de tocar.
