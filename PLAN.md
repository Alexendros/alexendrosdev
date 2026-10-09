# Estado — alexendros.dev (Astro MVP)

### Propósito de este documento

- **Objetivos:** Registrar el estado del MVP, pendientes operativos y criterios de mantenimiento.
- **Estructura:** Objetivos → arquitectura → pendiente → predecesor → releases → mantenimiento.
- **Contenido a integrar según contexto:** Actualiza issues y gates. No uses este archivo como CMS ni para cambiar pricing.

MVP en **producción** en [https://alexendros.dev](https://alexendros.dev). Repo canónico: `Alexendros/alexendrosdev`. Proyecto Vercel: **`alexendros-dev`**.

## Objetivos cumplidos

- LCP objetivo &lt;1.65s; CLS &lt;0.1; INP &lt;200ms (Speed Insights en prod)
- Lighthouse CI ≥90 móvil en 4 categorías (6 rutas)
- axe-core 0 violaciones en `/`, `/servicios`, `/servicios/*`, `/proyectos`, `/proyectos/*`, `/contacto`
- Formulario 3 campos + asunto + honeypot (sin captcha); código listo con Upstash + Proton SMTP
- Tracking solo con consentimiento previo y granular (CMP `vanilla-cookieconsent` v3; Consent Mode v2 con todo `denied` por defecto); Vercel Analytics/Speed Insights agregados, solo en builds de Vercel

## Arquitectura entregada

- Contenido tipado en `src/content/*.ts` (Zod en build)
- Páginas: home, servicios, proyectos, sobre-mí, contacto, aviso-legal, privacidad
- Única isla cliente: `ContactForm.tsx` (`client:load`)
- API: `src/pages/api/contact.ts` (Zod, honeypot, rate-limit, nodemailer)
- CI: jobs `quality`, `test`, `build`, `smoke`; e2e/LHCI opt-in
- Deploy Hobby: preview por PR; producción = merge a `main`

## Fase 1 — consentimiento y legal (en curso)

Fase 1 (consentimiento + legal) **en curso** en la rama `cursor/mercenario-v1`: CMP `vanilla-cookieconsent` v3, Consent Mode v2 default-deny, página `/cookies`, módulos `src/lib/tracking/{consent,loaders}.ts` e isla `src/components/consent/CookieBanner.tsx`. Ver ADR 0012 e inventario `docs/cookies-inventory.json`.

## Pendiente operativo

| Item                         | Issue / nota                                                                                              |
| ---------------------------- | --------------------------------------------------------------------------------------------------------- |
| Env SMTP + Upstash en Vercel | [#13](https://github.com/Alexendros/alexendrosdev/issues/13) — config operativa (código fail-closed)      |
| Node 22.x                    | [#11](https://github.com/Alexendros/alexendrosdev/issues/11) — cerrado; `engines` / `.nvmrc` en 22.x      |
| Majors Q4                    | [#12](https://github.com/Alexendros/alexendrosdev/issues/12) — Astro 7 hecho; quedan zod/nodemailer/React |

## Predecesor

El sitio Next.js en `nuevowebsite-alexendrosdev` está **archivado**. No hay redirecciones legacy de rutas; lanzamiento limpio sobre este stack Astro.

## Releases

Automáticas con **semantic-release** al push a `main` (workflow `release.yml`). SemVer: `content`/`docs`/`chore`/`style`/`refactor` → patch; `feat` → minor; breaking → major. Genera `CHANGELOG.md`, tag `v*.*.*` y GitHub Release. El commit `chore(release)` lleva `[skip ci]`. **Versionado ≠ promoción** a Vercel.

## Criterios de mantenimiento

No tocar pricing sin confirmar; no añadir CMS ni Google Fonts; no ampliar alcance de servicios sin decisión explícita. Commits y PRs en español; ramas `cursor/…` + PR borrador desde `main`.
