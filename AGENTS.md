### Propósito de este documento

- **Objetivos:** Contrato operativo para agentes de código y el rol Mantenedor: preferencias aprendidas, fuentes de verdad y Definition of Done.
- **Estructura:** Propósito → preferencias → hechos del workspace → CI canónico.
- **Contenido a integrar según contexto:** Conserva las preferencias de este portfolio. No copies un `AGENTS.md` de landing/SaaS ni tokens/DS de otro paquete. No reutilices `release.yml` ni cambies pricing/servicios sin confirmación.

**Destinatarios:** agentes de código y el rol Mantenedor. Homogeneizamos **nombres y contratos** (jobs `quality` / `test` / `build` / `smoke`), no el copy del sitio.

## Learned User Preferences

- Responder siempre en español.
- Commits en español.
- Tracking solo con consentimiento previo y granular (CMP `vanilla-cookieconsent` v3; Consent Mode v2 con todo `denied` por defecto). Vercel Analytics/Speed Insights siguen emitiéndose solo en builds de Vercel (`__IS_VERCEL__`).
- Tracking comercial completo **autorizado** (giro mercenario): GA4, Meta Pixel + CAPI server-side, LinkedIn Insight, Microsoft Clarity y PostHog EU, además de GTM server-side en Vercel. Todos gated por consentimiento de su categoría; ninguna etiqueta no esencial se carga sin consentimiento.
- Las cookies deben figurar en `docs/cookies-inventory.json`; `pnpm run audit:cookies` es la verificación canónica.
- Pricing de 3 tiers **autorizado** (adaptado a los precios actuales más bajos: 650/900/990/1500 €); no añadir CMS ni Google Fonts; no ampliar el alcance de los servicios sin decisión explícita.
- Preferir repo público + Vercel Hobby para preview por PR (decisión 1B); relajar Deployment Protection/SSO de previews para URLs compartibles (decisión 2A).
- Versionado (semantic-release / release.yml) distinto de promote a producción; content=patch, feat=minor, breaking=major.
- Al trabajar desde `main`, abrir rama `cursor/…`, commit/push y PR en borrador (no push directo a default).

## Learned Workspace Facts

- Repo canónico público: `Soluciones-Alexendros/miwebsite-alexendrosdev`; producción apex `https://alexendros.dev` en proyecto Vercel **`alexendros-dev`** (Hobby), Git link a este repo.
- Predecesor Next.js `nuevowebsite-alexendrosdev` archivado; no reutilizar como fuente de verdad.
- Stack MVP: Astro 4.16 + isla React `ContactForm` (`client:visible`) + Tailwind + TS estricto + Zod; contacto vía Proton SMTP (`operaciones@alexendros.dev`), honeypot, rate-limit Upstash y Turnstile (si `TURNSTILE_SECRET_KEY`).
- Tema visual (ADR 0011, supersedes 0006/0007): claro editorial azul `#0f3778` con tokens en 3 capas (`@layer tokens` de `src/styles/global.css` es la fuente única; Tailwind solo referencia semánticos). Tema oscuro vía `prefers-color-scheme`/`data-theme`, validado por `pnpm check:contrast` (22 pares, ambos temas). Prohibidos colores literales fuera de tokens, `!important` y `transition: all` (stylelint `pnpm lint:css`).
- Design system: componentes en `src/components/` (Button, Link, Badge, Eyebrow, Section/SectionHeader, Container/Stack/Grid, SkipLink), página viva `/design-system` (noindex) y `docs/design-system.md`. Motion: solo `transform`/`opacity`, reveal v2 con stagger, JS ≤ 2 KB gzip, 100% reduced-motion.
- Vercel Analytics/Speed Insights solo se emiten en builds de Vercel (`__IS_VERCEL__` vía define en astro.config): en local/CI no existen los endpoints `/_vercel/*` y romperían Best Practices.
- `engines.node` fijado a `22.x` (`.nvmrc`); validar Preview tras merge (issue #11).
- CI canónico: jobs `quality` (typecheck, lint, format, **lint:css**), `test`, `build`, `smoke`. e2e/axe (7 rutas) y LHCI móvil son **opt-in** (label `e2e`); umbrales LHCI: perf ≥95, a11y/BP/SEO 100, CLS ≤0.05, LCP ≤2.5s. LCP medido ~1.9s.
- Renovate (`.github/renovate.json`) sustituye Dependabot version-updates. Majors (zod 4, nodemailer 10, React/Astro) diferidos (issue #12); no mergear majors sin triage.
- SMTP/Upstash en Vercel pendientes para que `POST /api/contact` deje de fallar en preview/prod (issue #13).
