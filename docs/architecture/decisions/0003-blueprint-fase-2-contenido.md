# ADR 0003 — Blueprint Lab Fase 2: contenido (casos, ejes, escenas)

### Propósito de este documento

- **Objetivos:** Registrar las decisiones de contenido de la Fase 2 del Blueprint Lab.
- **Estructura:** Contexto → decisión → consecuencias.
- **Contenido a integrar según contexto:** Continúa el ADR 0002 (Fase 0, tokens) y usa los componentes de Fase 1 (FigureHead, Dimension, reveal). No reutilices este ADR en otro repo.

## Contexto

La Fase 2 viste la estructura de Fase 1 con contenido: los proyectos existentes actúan como casos (no se crea blog nuevo, no hay CMS), se añade una sección de ejes de trabajo y cada sección recibe una escena decorativa. Sigue abierta la reserva `--bp-bg/--bp-fg` de Fase 0: no se usa hasta validar contraste.

## Decisión

- **Casos como posts:** sin colección nueva; la página `proyectos/[slug]` recibe tratamiento de plano (rótulo `CASO · <slug>`, figura con pie `FIG.`, divisor `Dimension`, `data-reveal`).
- **Ejes:** nuevo `src/content/ejes.ts` validado con Zod (mismo patrón que `services`/`projects`) con tres ejes — Claridad, Velocidad, Accesibilidad y privacidad — cuyos textos derivan de `profile.ts` y de los proyectos, sin afirmaciones nuevas. Test en `ejes.test.ts`.
- **Escenas:** nuevo `Scene.astro` (retícula `.grid-pattern` + marcas de registro + rótulo, todo `aria-hidden`, sin animación) en las secciones de servicios, casos y ejes.
- **Portadas con filtro + fallback:** clase `.bp-duo` (sepia tenue bajo `@supports (filter: …)`; sin soporte se muestra la imagen original) en portadas de `ProjectCard` y de la página de caso.
- Sin colores nuevos: se reutilizan los tokens validados en Fase 0 (`primary/bg` 9.00, `muted/bg` 8.05).

## Consecuencias

- La home gana una sección (ejes) y la CTA pasa de `FIG. 03` a `FIG. 04`.
- Las portadas cambian ligeramente de tono en navegadores con soporte de filtros CSS.
- Esta rama apila sobre `cursor/blueprint-fase-1-estructura`: el PR base es esa rama hasta que la Fase 1 se fusione.
