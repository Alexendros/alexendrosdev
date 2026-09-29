# ADR 0012 — Consentimiento de cookies y tracking con Consent Mode v2

- Estado: aceptada
- Fecha: 2026-09-29
- Rama: `cursor/mercenario-v1`

## Contexto

El sitio opera como portfolio comercial y debe cumplir RGPD y LSSI-CE. La
postura previa del repo era «sin cookies no esenciales ni GA»: solo
Vercel Analytics y Speed Insights agregados. La Fase 1 del plan comercial
introduce analítica y píxeles de marketing (GA4, Meta Pixel, Clarity,
PostHog, LinkedIn), lo que exige consentimiento informado, granular y
previo, además de un CMP que permita demostrarlo y revocarlo.

Google exige Consent Mode v2 para las señales de consentimiento
(`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`)
en el tráfico del EEE. Sin un estado por defecto denegado y una
actualización al consentir, la analítica queda ilegítima y las
integraciones de Google degradadas.

## Decisión

- **CMP: `vanilla-cookieconsent` v3** (instalado `3.1.0`). Se integra como
  isla React `src/components/consent/CookieBanner.tsx`.
- **Categorías granular**: `necessary`, `preferences`, `analytics` y
  `marketing`. Solo `necessary` es obligatoria; el resto arranca
  desactivada y se activa por consentimiento explícito del usuario.
- **Consent Mode v2 default-deny**: antes de cualquier consentimiento se
  emite `gtag('consent', 'default', …)` con `ad_storage`, `ad_user_data`,
  `ad_personalization` y `analytics_storage` en `denied`. Al recibir una
  actualización de consentimiento se emite `gtag('consent', 'update', …)`
  con los valores correspondientes.
- **Consentimiento granular previo**: ninguna herramienta de tracking se
  carga antes de disponer del consentimiento de su categoría. La decisión
  es por categoría, no un único opt-in global.
- **Store de consentimiento**: `src/lib/tracking/consent.ts` expone
  `readConsent` / `writeConsent` / `hasConsent` / `onConsentUpdate` /
  `clearConsent`, y persiste en la cookie `consent_v1` con 12 meses de
  vigencia.
- **Loaders inertes**: `src/lib/tracking/loaders.ts` implementa
  `loadGA4`, `loadMetaPixel`, `loadClarity`, `loadPostHog` y
  `loadLinkedIn`, coordinados por `initTracking`. Cada loader es inerte si
  no hay consentimiento de su categoría **o** si falta el ID de la
  herramienta; en ese caso no inyecta script ni emite red.
- **Inventario de cookies**: las cookies se documentan en
  `docs/cookies-inventory.json` y `pnpm run audit:cookies` es la
  verificación canónica del inventario.
- **Página legal nueva**: `/cookies` publica el detalle y permite revocar
  o cambiar la decisión en cualquier momento.

## Alternativas consideradas

- **TCF (IAB Transparency & Consent Framework)**: descartado por
  sobredimensionado para un portfolio sin Redes publicitarias complejas;
  añade complejidad y dependencia del ecosistema IAB sin aportar valor
  real al caso.
- **CookieYes** (CMP SaaS): descartado por coste y dependencia de un
  tercero, con el mismo resultado funcional que una librería cliente
  ligera.
- **Banner propio**: descartado por coste de mantenimiento y riesgo de
  incumplimiento (registro de consentimiento, granularidad y
  revocabilidad). `vanilla-cookieconsent` v3 los cubre sin desarrollo ad
  hoc.

## Consecuencias

- **Giro de posicionamiento**: se abandona la postura previa «sin cookies
  no esenciales ni GA». Ahora el sitio puede cargar analítica y marketing,
  pero solo con consentimiento previo, granular y revocable.
- Vercel Analytics/Speed Insights siguen emitiéndose solo en builds de
  Vercel (`__IS_VERCEL__`); no dependen del CMP para su ejecución, pero la
  narrativa de privacidad del sitio pasa a apoyarse en el inventario y la
  página `/cookies`.
- Cualquier herramienta nueva debe declararse en
  `docs/cookies-inventory.json`, tener loader inerte propio y superar
  `pnpm run audit:cookies`.
- El consentimiento queda versionado (`consent_v1`) con 12 meses de
  vigencia, lo que obliga a re-solicitarlo si cambia el inventario o la
  versión del banner.
