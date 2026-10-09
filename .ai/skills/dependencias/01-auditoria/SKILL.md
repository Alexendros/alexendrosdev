# DEPENDENCIAS · ① Auditoría de dependencias

## Propósito

Inventariar las dependencias de `alexendros.dev`, su desactualización y deuda de
mayores, y detectar cualquier configuración de **Dependabot** a retirar antes de
migrar por completo a **Renovate**.

## Cuándo se activa

- Inicio de fase DEPENDENCIAS o `@dependencias-01-auditoria`.
- «auditar dependencias», «actualizaciones», «Renovate», «retirar Dependabot».

## Instrucciones

1. Inventariar dependencias (prod/dev) y versiones con `pnpm` y `npm-check-updates`.
2. Clasificar desactualizaciones por tipo (patch/minor/major) y riesgo.
3. Localizar restos de Dependabot (`.github/dependabot.yml`, workflows) a retirar.
4. Marcar dependencias con vulnerabilidad conocida (cruce con la línea PROTECCIÓN).
5. Volcar `.ai/skills/.phase/dependencias/01-auditoria.json`.

## Formato de salida

Fichero limpio `01-auditoria.json` + tabla `Dependencia · Actual · Última · Salto · Riesgo`.

## Restricciones

- No modifica `package.json` ni crea `renovate.json` (fase ②).
- No aplica actualizaciones; solo diagnostica.
- No usa Dependabot como solución: el destino es Renovate.

## Casos límite

- Mayor diferido por decisión previa (p. ej. issue abierto): anotar y respetar el diferimiento.
- Dependencia sin releases semver: anotar como caso de pin manual.
