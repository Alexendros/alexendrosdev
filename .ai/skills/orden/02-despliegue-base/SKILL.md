# ORDEN · ② Despliegue base de refactor, OKLCH y CSS consolidado

## Propósito

Aplicar desde ficheros limpios los refactors de la auditoría (SRP, nombres claros,
funciones pequeñas), gobernar el color con tokens **OKLCH** y **consolidar los estilos
en un único CSS** con los `@import`/`@layer` adecuados.

## Cuándo se activa

- Tras `orden-01-auditoria` o `@orden-02-despliegue-base`.
- «refactorizar», «aplicar SRP», «tokens OKLCH», «consolidar CSS», «imports de estilos».

## Instrucciones

1. Leer `01-auditoria.json`; priorizar olores y estilos de mayor severidad.
2. Refactorizar en pasos pequeños y verificables (extract-method, rename, SRP), con tests verdes tras cada paso.
3. Gobernar el color con tokens **OKLCH** en `@layer tokens` de `src/styles/global.css`;
   prohibidos literales de color, `!important` y `transition: all`.
4. Consolidar los estilos en un único punto de entrada CSS con `@import` ordenados y
   `@layer` (tokens → base → componentes → utilidades); eliminar hojas dispersas.
5. Endurecer reglas ESLint/stylelint y documentar convenciones de nomenclatura.
6. Volcar `.ai/skills/.phase/orden/02-despliegue-base.json`.

## Formato de salida

Fichero limpio `02-despliegue-base.json` + diff de refactor + delta de complejidad + reporte stylelint (0 literales, 1 entrada CSS).

## Restricciones

- No mezclar refactor con cambio de comportamiento en el mismo commit.
- No romper el sistema de tokens de 3 capas ni el tema oscuro.
- No introducir abstracciones especulativas (YAGNI) ni cablear fronteras/ADR en CI (fase ③).

## Casos límite

- Color de un SVG/tercero no tematizable: aislarlo y documentar la excepción.
- Refactor rompe un test: el test manda; revisar si codifica el comportamiento correcto.
