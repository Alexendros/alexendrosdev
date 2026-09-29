# Runbook — GTM Server-Side en Vercel Hobby

Objetivo: doble envío de conversiones (GA4 + Meta) desde un contenedor server-side alojado en
Vercel, con `metrics.alexendros.dev` como dominio propio. Todo el tracking client-side está gated
por consentimiento; el server-side solo enriquece lo que el cliente ya ha consentido.

## 1. Requisitos previos

- Contenedor GTM Server-Side creado en el proyecto GTM (`PUBLIC_GTM_ID` es el contenedor web).
- Dominio `metrics.alexendros.dev` disponible en el proyecto Vercel `alexendros-dev`.
- Variables de entorno del cliente ya configuradas:
  - `PUBLIC_GTM_ID` → carga `gtm.js` (cliente) cuando hay consentimiento `analytics`.
  - `PUBLIC_GTM_SS_DOMAIN=metrics.alexendros.dev` (referencia, sin uso en runtime actual).
  - `PUBLIC_GA4_ID` → GA4 directo (fallback/doble).
  - `META_PIXEL_ID` + `META_CAPI_TOKEN` → CAPI server-side desde `POST /api/contact` y
    `POST /api/cal/webhook`.

## 2. Despliegue del contenedor SS en Vercel Hobby

1. En GTM, crear un contenedor **Server** y anotar su `Container Config` (imagen `gcr.io/cloud-tagging-10302018/gtm-cloud-image:stable`).
2. En Vercel, crear un proyecto nuevo importando el repo del contenedor **o** un proyecto dedicado
   que ejecute la imagen GTM. En Hobby, usar una Serverless Function que sirva los endpoints
   `/g/collect`, `/gtm.js`, etc. Alternativa gestionada: Stape (con dominio propio). Si se usa Stape,
   mantener el mismo `metrics.alexendros.dev` apuntando vía CNAME.
3. Asignar el dominio `metrics.alexendros.dev` al proyecto SS en Vercel → Settings → Domains.
4. Configurar `CONTAINER_CONFIG` y `PREVIEW_SERVER_URL`/`SERVER_CONTAINER_URL` según la guía de GTM
   para la variable de entorno del contenedor.

## 3. Cliente GA4 dentro del contenedor SS

1. Tag **GA4** en el contenedor SS usando `Measurement ID` = `PUBLIC_GA4_ID`.
2. Trigger: eventos entrantes desde el contenedor web (`/g/collect`) o desde CAPI/Measurement
   Protocol. Habilitar **Server-side tagging** en el contenedor web (tag `Google Tag` con
   `Transport URL` = `https://metrics.alexendros.dev`).
3. Verificar en GTM Preview (server container) que los eventos `page_view`, `form_submit` y
   `cta_click` llegan con `consent.analytics_storage = granted`.

## 4. Cliente Meta CAPI dentro del contenedor SS (opcional)

1. Tag **Facebook Conversions API** con `Pixel ID` = `META_PIXEL_ID` y el token
   `META_CAPI_TOKEN`.
2. Mapear `event_name` (`Lead`, `Purchase`, `Schedule`) y `event_id` (mismo valor que el `eventId`
   enviado por `src/lib/tracking/capi.ts`) para que Meta deduplique cliente + servidor.
3. Activar **Enhanced Matching** con `em` (email hasheado SHA-256), `client_ip_address`,
   `client_user_agent`, `fbp`/`fbc`.

> Nota: este proyecto ya envía CAPI directamente desde `src/lib/tracking/capi.ts`. El contenedor SS
> es complementario (doble envío); mantener el mismo `event_id` para deduplicar.

## 5. Consent Mode v2

- `src/lib/tracking/loaders.ts` llama `gtag('consent','default',{...denied})` antes de configurar
  GA4/GTM y `syncGtagConsent()` reenvía `update` tras el consentimiento.
- El contenedor SS debe respetar `analytics_storage`/`ad_storage`. Si un evento llega con
  `denied`, no persistir cookies.

## 6. Verificación

1. `pnpm build` y `pnpm test:e2e -- -t "TEST-TRACK-01"`: sin consentimiento `window.dataLayer`
   recibe `consent default denied`; con consentimiento analítico, `gtag` está definido.
2. GTM Preview (web + server) muestra los eventos del funnel con sus parámetros.
3. Meta Events Manager → Test Events: `POST /api/contact` con `META_CAPI_TEST_EVENT_CODE`
   configurado registra un `Lead` sin contaminar producción.
4. `POST /api/cal/webhook` (BOOKING_PAID) registra `Purchase` con el mismo `event_id` que el cliente.

## 7. Rollback

- Vaciar `PUBLIC_GTM_ID` → el contenedor web no carga; GA4 directo (`PUBLIC_GA4_ID`) sigue activo.
- Vaciar `META_CAPI_TOKEN` → CAPI server-side se desactiva (los loaders client-side no cambian).
- Quitar el dominio `metrics.alexendros.dev` del proyecto SS para aislar el envío server-side.
