# PROTECCIÓN · ① Auditoría ASVS y contextualización

## Propósito

Diagnosticar la superficie de ataque de `alexendros.dev` y medir la cobertura OWASP
ASVS (L1 completo + L2 selectivo) antes de corregir nada. Entrega un fichero limpio
de hallazgos con severidad, evidencia y confianza que alimenta la fase de despliegue base.

## Cuándo se activa

- Inicio de la fase PROTECCIÓN o `@proteccion-01-auditoria` en Cursor.
- «auditar seguridad», «cobertura ASVS», «buscar secretos», «revisar cabeceras/CSP».

## Instrucciones

1. Contextualizar: inventariar endpoints (`src/pages/api/**`), islas cliente, entradas de
   usuario (`ContactForm`, webhooks Cal), dependencias y variables de entorno (`.env.example`).
2. Escanear secretos (gitleaks) sobre árbol e historial reciente.
3. Escanear dependencias (osv-scanner / `npm audit`) y clasificar por severidad.
4. Revisar cabeceras de seguridad y CSP efectiva (`vercel.json`), cookies (`docs/cookies-inventory.json`).
5. Mapear cada hallazgo a su capítulo ASVS y fijar decisiones/umbrales (contextualización + decisiones).
6. Volcar `.ai/skills/.phase/proteccion/01-auditoria.json` conforme a `phase-report.schema.json`.

## Formato de salida

Fichero limpio JSON (`01-auditoria.json`) + resumen en chat con tabla
`Hallazgo · Evidencia · Severidad · Confianza · Capítulo ASVS · Acción`.

## Restricciones

- No corrige código ni crea tests (eso es fase ②).
- No exfiltra secretos: reporta ubicación y tipo, nunca el valor.
- No asume cobertura sin evidencia; lo no verificable se marca confianza `baja`.

## Casos límite

- Sin acceso a historial: escanear solo árbol y declararlo como límite.
- Endpoint nuevo sin validación Zod: hallazgo `high` con remediación propuesta.
