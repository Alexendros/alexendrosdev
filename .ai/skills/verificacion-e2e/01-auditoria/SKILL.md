# VERIFICACIÓN E2E · ① Auditoría de flujos, métricas y contraste

## Propósito

Inventariar los flujos críticos de usuario e interfaz de `alexendros.dev`, definir el
presupuesto de métricas de salud y velocidad, y fijar la línea base de contraste
visual de estilo y estructura para las correcciones posteriores.

## Cuándo se activa

- Inicio de fase VERIFICACIÓN E2E o `@verificacion-e2e-01-auditoria`.
- «auditar e2e», «flujos críticos», «métricas de salud/velocidad», «contraste visual».

## Instrucciones

1. Mapear los flujos críticos (navegación, formulario de contacto, rutas clave) y su interfaz.
2. Definir el presupuesto de métricas de salud y velocidad (LCP, CLS, TBT, perf/SEO LHCI).
3. Capturar la línea base de contraste visual de estilo y estructura por vista (claro/oscuro).
4. Priorizar por riesgo y cobertura actual; no implementar aún los tests (fase ②).
5. Volcar `.ai/skills/.phase/verificacion-e2e/01-auditoria.json`.

## Formato de salida

Fichero limpio `01-auditoria.json` + tabla `Flujo/Vista · Tipo · Métrica · Presupuesto · Baseline`.

## Restricciones

- No implementa workflows ni los cablea en CI.
- No fija presupuestos sin una medición de referencia.
- No duplica el alcance de ACCESIBILIDAD (contraste WCAG): aquí el foco es regresión visual de estilo/estructura.

## Casos límite

- Flujo dependiente de terceros (reCAPTCHA, email): marcar como e2e con stub/mocking.
- Vista con contenido dinámico: definir regiones estables para la comparación visual.
