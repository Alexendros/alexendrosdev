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
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Inyectado por vite.define en astro.config.mjs: true solo en builds de Vercel. */
declare const __IS_VERCEL__: boolean;
