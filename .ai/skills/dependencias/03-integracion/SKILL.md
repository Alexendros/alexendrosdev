# DEPENDENCIAS · ③ Integración de Renovate en CI

## Propósito

Integrar Renovate contra el repositorio previo con Dependency Dashboard y validación
de sus PR en CI, cerrando la línea sin Dependabot.

## Cuándo se activa

- Tras `dependencias-02-despliegue-base` o `@dependencias-03-integracion`.
- «integrar Renovate», «Dependency Dashboard», «CI de dependencias».

## Instrucciones

1. Leer `02-despliegue-base.json`.
2. Habilitar el Dependency Dashboard y confirmar que Renovate abre PRs agrupados.
3. Garantizar que los PR de Renovate pasan por `quality`/`test`/`build` antes de automerge.
4. Verificar 0 workflows de Dependabot activos en el repositorio.
5. Volcar `.ai/skills/.phase/dependencias/03-integracion.json`.

## Formato de salida

Fichero limpio `03-integracion.json` + captura del Dependency Dashboard + estado de CI.

## Restricciones

- No permitir automerge si el CI no es verde.
- No reintroducir Dependabot.
- No ampliar el alcance al código de la app (solo dependencias y su CI).

## Casos límite

- Renovate satura de PRs: aplicar `prConcurrentLimit`/`prHourlyLimit` y agrupaciones.
- PR de major con breaking: mantener en el Dashboard para revisión humana explícita.
}
