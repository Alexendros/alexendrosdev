# ACCESIBILIDAD · ① Auditoría WCAG 2.1 AA y SEO técnico

## Propósito

Diagnosticar barreras de accesibilidad (WCAG 2.1 AA; EN 301 549 / RD 1112/2018) y
carencias de SEO técnico en `alexendros.dev`, con inventario de violaciones y evidencia.

## Cuándo se activa

- Inicio de fase ACCESIBILIDAD o `@accesibilidad-01-auditoria`.
- «auditar accesibilidad», «revisar WCAG», «SEO técnico», «contraste», «datos estructurados».

## Instrucciones

1. Ejecutar axe-core (Playwright) y Lighthouse/Pa11y sobre las rutas canónicas del sitio.
2. Revisar semántica (landmarks, encabezados, `alt`, foco visible), contraste (reutilizar
   `pnpm check:contrast`, 22 pares, ambos temas) y navegación por teclado.
3. Auditar SEO: `title`/`description`, canonical, `sitemap`, Open Graph, JSON-LD `schema.org`.
4. Mapear cada violación a su criterio WCAG (nivel A/AA/AAA) con severidad y confianza.
5. Volcar `.ai/skills/.phase/accesibilidad/01-auditoria.json`.

## Formato de salida

Fichero limpio `01-auditoria.json` + tabla `Criterio WCAG · Violación · Ruta · Severidad · Confianza`.

## Restricciones

- No corrige código (fase ②) ni modifica presupuestos de CI (fase ③).
- No inventa criterios; cada hallazgo cita su número WCAG / cláusula EN 301 549.
- Respeta `/design-system` como `noindex`.

## Casos límite

- Contenido dinámico (isla React): auditar en estado renderizado, no solo SSR.
- Conflicto AA/AAA: priorizar AA obligatorio y anotar AAA como mejora opcional.
