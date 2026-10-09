# PROTECCIÓN · ② Despliegue base de controles

## Propósito

Implementar desde ficheros limpios la línea base de controles de seguridad derivada
de la auditoría: CSP endurecida, cabeceras, reglas SAST y tests de validación.

## Cuándo se activa

- Tras `proteccion-01-auditoria` o `@proteccion-02-despliegue-base`.
- «implementar CSP», «cabeceras de seguridad», «reglas Semgrep», «tests de seguridad».

## Instrucciones

1. Leer `01-auditoria.json`; priorizar hallazgos `critical`/`high` blocking.
2. Definir CSP sin `unsafe-inline` y cabeceras (`HSTS`, `X-Content-Type-Options`,
   `Referrer-Policy`, `Permissions-Policy`) en `vercel.json`.
3. Añadir reglas Semgrep (OWASP) y tests Vitest que verifiquen validación Zod,
   honeypot, rate-limit y saneo de entradas.
4. No cablear aún el pipeline final (fase ③); dejar los controles verificables en local.
5. Volcar `.ai/skills/.phase/proteccion/02-despliegue-base.json`.

## Formato de salida

Fichero limpio `02-despliegue-base.json` + diff mínimo de controles + resumen de gates.

## Restricciones

- No relajar la CSP para acallar errores; documentar cada excepción como decisión.
- No tocar copy del sitio ni pricing (ver `AGENTS.md`).
- No integrar en CI todavía.

## Casos límite

- CSP rompe una isla React: usar nonce/hash, nunca `unsafe-inline`.
- Control sin test factible: marcar gate `warn` y abrir decisión pendiente.
