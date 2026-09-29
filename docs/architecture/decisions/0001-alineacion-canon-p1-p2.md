# ADR 0001 — Alinear al canon P1+P2

### Propósito de este documento

- **Objetivos:** Registrar por qué este portfolio adopta los contratos de `repo-standard` sin clonar el esqueleto.
- **Estructura:** Contexto → decisión → consecuencias.
- **Contenido a integrar según contexto:** No reutilices este ADR en otro repo: el perfil (público, Astro/TS) es de `miwebsite-alexendrosdev`.

## Contexto

La flota se homogeneiza con `Soluciones-Alexendros/repo-standard` (main): nombres de jobs, Renovate, docs contractuales y meta-sección «Propósito». Este sitio ya tenía CI monolítico (typecheck+lint+vitest+build+e2e+LHCI) y Dependabot version-updates.

## Decisión

- Perfil **P1+P2** (público, portfolio Astro/TS).
- Conservar contenido del sitio, `LICENSE`, semantic-release y `release.yml`.
- CI: jobs `quality`, `test`, `build`, `smoke`. e2e/LHCI **opt-in**.
- Sustituir Dependabot version-updates por Renovate (`npm` + `github-actions`).
- Añadir CoC, SUPPORT, CODEOWNERS, ARCHITECTURE y ADRs bajo `docs/architecture/decisions/`.

## Consecuencias

- Los PRs rutinarios ya no instalan Playwright ni corren LHCI (menos minutos, menos flakiness).
- a11y/CWV se piden explícitamente (label `e2e`) cuando el cambio toca UI.
- Majors diferidos (issue #12) se expresan en `packageRules` de Renovate, no en Dependabot.
