# DEPENDENCIAS · ② Configuración completa de Renovate

## Propósito

Desplegar un `renovate.json` completo y reproducible como línea base de gestión de
dependencias, retirando Dependabot por completo.

## Cuándo se activa

- Tras `dependencias-01-auditoria` o `@dependencias-02-despliegue-base`.
- «configurar Renovate», «renovate.json», «automerge», «agrupar dependencias».

## Instrucciones

1. Leer `01-auditoria.json`.
2. Crear `renovate.json` (o `.github/renovate.json`) con, al menos:
   - `extends` (p. ej. `config:recommended`), `timezone` y `schedule` (agenda fuera de horas).
   - `packageRules` de agrupación (devDeps, astro, eslint/prettier, types) y automerge de patch/minor seguros.
   - `lockFileMaintenance` activo, `rangeStrategy`, `semanticCommits`, `labels`, `reviewers`.
   - Diferimiento de mayores con `dependencyDashboard` y `major` separado.
3. Retirar `.github/dependabot.yml` y cualquier workflow de Dependabot.
4. Validar con `renovate-config-validator`.
5. Volcar `.ai/skills/.phase/dependencias/02-despliegue-base.json`.

## Formato de salida

Fichero limpio `02-despliegue-base.json` + `renovate.json` validado + nota de retirada de Dependabot.

## Restricciones

- No dejar Dependabot activo ni «por si acaso».
- No habilitar automerge de mayores sin revisión humana.
- No cablear el Dependency Dashboard ni los gates de CI todavía (fase ③).

## Casos límite

- Monorepo o múltiples lockfiles: declarar `packageManager` y rutas explícitas.
- Dependencia crítica que no debe automergear: `packageRules` con `automerge:false` y revisor.
