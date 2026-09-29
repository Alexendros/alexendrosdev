# Arquitectura — alexendros.dev

### Propósito de este documento

- **Objetivos:** Describir las capas del sitio, las fronteras de runtime y dónde vive cada contrato (contenido, API, CI, deploy).
- **Estructura:** Contexto → stack → árbol de runtime → APIs → CI/release → límites.
- **Contenido a integrar según contexto:** Adapta rutas y adapters de este Astro híbrido. No copies la arquitectura de un SaaS, de Next.js archivado ni de la CLI webconfig. No cambies el alcance de servicios ni el pricing desde aquí.

Sitio profesional de conversión + contratación. Producción: [https://alexendros.dev](https://alexendros.dev). Repo: `Soluciones-Alexendros/miwebsite-alexendrosdev`. Proyecto Vercel **`alexendros-dev`**.

## Stack

Astro 4 hybrid + una isla React (`ContactForm`, `client:load`) + Tailwind OKLCH + TypeScript estricto + Zod. Fuentes Inter + JetBrains Mono self-hosted. Sin GA ni cookies de tracking; sí Vercel Analytics y Speed Insights (agregados).

## Runtime

| Capa                 | Dónde                                                      | Notas                               |
| -------------------- | ---------------------------------------------------------- | ----------------------------------- |
| Páginas SSG          | `src/pages/*.astro`                                        | Contenido tipado; 0 JS de contenido |
| Isla cliente         | `src/components/ContactForm.tsx`                           | Única isla `client:load`            |
| APIs serverless      | `src/pages/api/contact.ts`, `src/pages/api/cal/webhook.ts` | Adapter `@astrojs/vercel`           |
| Contenido            | `src/content/*.ts`                                         | Zod en build; no CMS                |
| Estáticos de preview | `.vercel/output/static`                                    | `pnpm preview` / job `smoke`        |

## APIs

- `POST /api/contact` — Zod, honeypot, rate-limit Upstash, Proton SMTP. Fail-closed (503) sin Redis/SMTP.
- `POST /api/cal/webhook` — HMAC `X-Cal-Signature-256`, upsert Notion Leads, Redis solo idempotencia.

Variables: [`.env.example`](.env.example). Nunca en git.

## CI y release

Jobs del workflow principal: `quality` → `test` → `build` → `smoke`. Playwright + LHCI son **opt-in** (label `e2e` o `workflow_dispatch`). Release: `release.yml` + semantic-release (versionado ≠ promote a Vercel).

## Límites

- No CMS, no Google Fonts, no ampliar servicios ni tocar pricing sin decisión explícita.
- Predecesor Next.js `nuevowebsite-alexendrosdev` archivado: no es fuente de verdad.
- Decisiones de alineación de plataforma: [`docs/architecture/decisions/`](docs/architecture/decisions/).
