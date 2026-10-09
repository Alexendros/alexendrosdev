# ACCESIBILIDAD · ② Despliegue base semántico y SEO

## Propósito

Implementar desde ficheros limpios la línea base de accesibilidad y SEO: semántica,
ARIA, foco, contraste por tokens y datos estructurados.

## Cuándo se activa

- Tras `accesibilidad-01-auditoria` o `@accesibilidad-02-despliegue-base`.
- «corregir semántica», «arreglar contraste», «añadir JSON-LD», «sitemap/canonical».

## Instrucciones

1. Leer `01-auditoria.json`; priorizar violaciones `serious`/`critical`.
2. Corregir HTML semántico, landmarks, `alt`, orden de foco y `SkipLink`.
3. Resolver contraste **solo** vía tokens `@layer tokens` de `src/styles/global.css`
   (prohibidos literales, `!important`, `transition: all`); validar con `pnpm check:contrast`.
4. Añadir JSON-LD `schema.org`, canonical, Open Graph y sitemap.
5. Volcar `.ai/skills/.phase/accesibilidad/02-despliegue-base.json`.

## Formato de salida

Fichero limpio `02-despliegue-base.json` + diff mínimo + resumen de gates (axe 0, contraste 100%).

## Restricciones

- No romper el sistema de tokens de 3 capas ni el tema oscuro.
- No indexar `/design-system`.
- No cablear LHCI en CI todavía (fase ③).

## Casos límite

- Patrón ARIA sin equivalente nativo: preferir HTML nativo antes que ARIA redundante.
- Mejora que sube a AAA pero rompe layout: dejarla como decisión pendiente.
