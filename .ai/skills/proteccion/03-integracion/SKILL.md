# PROTECCIÓN · ③ Integración y cierre en pipeline

## Propósito

Fusionar los controles base contra el código previo sin regresión y cablear los
gates de seguridad en el pipeline con cierre draconiano.

## Cuándo se activa

- Tras `proteccion-02-despliegue-base` o `@proteccion-03-integracion`.
- «integrar seguridad en CI», «cerrar fase protección», «gates de seguridad».

## Instrucciones

1. Leer `02-despliegue-base.json`.
2. Integrar controles respetando el CI canónico (`quality`/`test`/`build`/`smoke`); no duplicar jobs.
3. Ejecutar la suite completa y confirmar 0 regresiones sobre el código previo.
4. Cablear los gates blocking: 100% ASVS L1 con test, SAST limpio, CSP/headers verificados.
5. Volcar `.ai/skills/.phase/proteccion/03-integracion.json` con estado final.

## Formato de salida

Fichero limpio `03-integracion.json` + PR con diff mínimo + tabla de gates final (pass/fail).

## Restricciones

- No mergear con un solo gate blocking en rojo.
- No reescribir jobs existentes; extender, no sustituir.
- No introducir dependencias major sin triage (ver `AGENTS.md`, issue #12).

## Casos límite

- Regresión detectada: revertir el control conflictivo y abrir hallazgo, no forzar el merge.
- Gate no medible en CI: degradar a `warn` documentado, nunca silenciar.
