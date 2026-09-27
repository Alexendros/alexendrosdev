# ADR 0005 — Blueprint Lab Fase 4: gate axe/LHCI

### Propósito de este documento

- **Objetivos:** Registrar el gate de accesibilidad y rendimiento de la Fase 4 del Blueprint Lab.
- **Estructura:** Contexto → decisión → consecuencias.
- **Contenido a integrar según contexto:** Cierra los ADR 0002 (Fase 0, tokens), 0003 (Fase 2, contenido) y 0004 (Fase 3, personalidad). No reutilices este ADR en otro repo.

## Contexto

La rama `cursor/blueprint-fase-4-gate` integra el plan completo (Fases 0–3: la Fase 0 se fusionó aquí porque viajaba en rama separada). El gate opt-in (`label e2e`) exige axe 0 violaciones en 8 rutas y LHCI móvil ≥90. La suite completa falló una vez en `/proyectos/front-valencia` (`color-contrast`, ratio 1.77 en el breadcrumb): el reveal de entrada de Fase 1 (400 ms) deja el texto semitransparente mientras anima y axe capturó un estado intermedio. Aislado el test pasaba por timing.

## Decisión

- **Se analiza el estado final, no la animación:** `tests/e2e/a11y.spec.ts` espera 600 ms tras `goto` antes de `analyze()`, con comentario que lo justifica. WCAG 1.4.3 aplica al texto en reposo; la animación de entrada de 400 ms es transitoria y respeta `reduced-motion`.
- **Sin cambios de diseño:** el reveal, sus tiempos y la degradación nativa (EF-07) quedan intactos.
- **Gate en verde sobre la rama integrada:** prettier, typecheck, eslint, `check:contrast`, 77 tests vitest, build, e2e 10/10, LHCI ≥90 en las 4 categorías y 7 URLs.

## Consecuencias

- Si el reveal cambia de duración, ajustar la espera del spec en consonancia.
- Esta rama contiene el plan completo y es la referencia para revisión local; no se abre PR hasta el visto bueno.
