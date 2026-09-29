/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SMTP_HOST?: string;
  readonly SMTP_PORT?: string;
  readonly SMTP_USER?: string;
  readonly SMTP_PASS?: string;
  readonly UPSTASH_REDIS_REST_URL?: string;
  readonly UPSTASH_REDIS_REST_TOKEN?: string;
  readonly PUBLIC_SITE_URL?: string;
  readonly CAL_WEBHOOK_SECRET?: string;
  readonly NOTION_TOKEN?: string;
  /** Data source id (API 2025-09-03). Alias: NOTION_LEADS_DATA_SOURCE_ID. */
  readonly NOTION_LEADS_DATABASE_ID?: string;
  readonly NOTION_LEADS_DATA_SOURCE_ID?: string;
  /** Cloudflare Turnstile */
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  /** Tracking (Meta CAPI server-side) */
  readonly META_PIXEL_ID?: string;
  readonly META_CAPI_TOKEN?: string;
  readonly META_CAPI_TEST_EVENT_CODE?: string;
  /** Tracking client-side (loaders, gated by consent) */
  readonly PUBLIC_GA4_ID?: string;
  readonly PUBLIC_GTM_ID?: string;
  readonly PUBLIC_GTM_SS_DOMAIN?: string;
  readonly PUBLIC_META_PIXEL_ID?: string;
  readonly PUBLIC_CLARITY_ID?: string;
  readonly PUBLIC_POSTHOG_KEY?: string;
  readonly PUBLIC_POSTHOG_HOST?: string;
  readonly PUBLIC_LINKEDIN_PARTNER_ID?: string;
  readonly PUBLIC_COOKIE_CONSENT_VERSION?: string;
  /** Email transaccional y doble opt-in (Resend) */
  readonly RESEND_API_KEY?: string;
  readonly EMAIL_FROM?: string;
  readonly EMAIL_FROM_NAME?: string;
  readonly UNSUBSCRIBE_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Inyectado por vite.define en astro.config.mjs: true solo en builds de Vercel. */
declare const __IS_VERCEL__: boolean;
