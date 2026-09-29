import { verifyCalSignature, CAL_SIGNATURE_HEADER } from './calSignature';
import { isJsonContentType } from './contactHandler';
import { bookingUid, isHandledCalTrigger, parseCalWebhookEnvelope } from './calWebhookSchema';
import { mapCalEventToLeadWrite } from './calNotionMapper';
import type { NotionLeadsStore } from './calNotionClient';

export const CAL_WEBHOOK_MAX_BODY_BYTES = 65_536;
export const CAL_IDEMPOTENCY_TTL_SECONDS = 7 * 24 * 60 * 60;
export const CAL_IDEMPOTENCY_KEY_PREFIX = 'alexendros:cal:uid';

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const;

export type CalWebhookEnv = {
  CAL_WEBHOOK_SECRET?: string;
  NOTION_TOKEN?: string;
  NOTION_LEADS_DATABASE_ID?: string;
  NOTION_LEADS_DATA_SOURCE_ID?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
};

export type CalWebhookDeps = {
  getEnv: () => CalWebhookEnv;
  claimIdempotency: (key: string) => Promise<boolean>;
  releaseIdempotency: (key: string) => Promise<void>;
  leads: NotionLeadsStore;
  /** Evento de conversión server-side (Meta CAPI); best-effort, no bloquea la respuesta. */
  sendConversionEvent?: (input: CalConversionEvent) => Promise<void>;
  createRequestId?: () => string;
};

export type CalConversionEvent = {
  trigger: string;
  uid: string;
  email?: string;
  eventSourceUrl?: string;
};

function json(status: number, body: unknown, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders }
  });
}

function logEvent(
  level: 'info' | 'error',
  event: string,
  requestId: string,
  ok: boolean,
  extra?: Record<string, unknown>
): void {
  const line = JSON.stringify({ event, ok, requestId, ...extra });
  if (level === 'error') console.error(line);
  else console.info(line);
}

export function calWebhookMethodNotAllowed(): Response {
  return json(405, { error: 'Method not allowed' }, { Allow: 'POST' });
}

export function idempotencyKey(uid: string, trigger: string): string {
  return `${CAL_IDEMPOTENCY_KEY_PREFIX}:${uid}:${trigger}`;
}

/** SDK v5 (Notion-Version 2025-09-03) opera sobre data source id, no page id. */
export function resolveLeadsDataSourceId(env: CalWebhookEnv): string | undefined {
  const fromExplicit = env.NOTION_LEADS_DATA_SOURCE_ID?.trim();
  if (fromExplicit) return fromExplicit;
  const fromDb = env.NOTION_LEADS_DATABASE_ID?.trim();
  return fromDb || undefined;
}

function resolveSecret(env: CalWebhookEnv): string | undefined {
  const secret = env.CAL_WEBHOOK_SECRET?.trim();
  return secret || undefined;
}

function notionConfigured(env: CalWebhookEnv): boolean {
  return Boolean(env.NOTION_TOKEN?.trim() && resolveLeadsDataSourceId(env));
}

function redisConfigured(env: CalWebhookEnv): boolean {
  return Boolean(env.UPSTASH_REDIS_REST_URL?.trim() && env.UPSTASH_REDIS_REST_TOKEN?.trim());
}

/**
 * Handler de contrato para POST /api/cal/webhook.
 * Fail-closed si falta secreto, Redis o Notion. Redis solo para idempotencia.
 */
export async function handleCalWebhookPost(
  request: Request,
  deps: CalWebhookDeps
): Promise<Response> {
  const requestId = deps.createRequestId?.() ?? crypto.randomUUID();

  if (!isJsonContentType(request)) {
    logEvent('info', 'cal_webhook_unsupported_media', requestId, false);
    return json(415, { error: 'Unsupported media type' });
  }

  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const len = Number(contentLength);
    if (Number.isFinite(len) && len > CAL_WEBHOOK_MAX_BODY_BYTES) {
      logEvent('info', 'cal_webhook_payload_too_large', requestId, false);
      return json(413, { error: 'Payload too large' });
    }
  }

  const env = deps.getEnv();
  const secret = resolveSecret(env);
  if (!secret) {
    logEvent('error', 'cal_webhook_secret_misconfigured', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }

  const raw = await request.text().catch(() => null);
  if (raw === null) {
    return json(400, { error: 'Invalid request' });
  }
  if (new TextEncoder().encode(raw).byteLength > CAL_WEBHOOK_MAX_BODY_BYTES) {
    logEvent('info', 'cal_webhook_payload_too_large', requestId, false);
    return json(413, { error: 'Payload too large' });
  }

  const signature = request.headers.get(CAL_SIGNATURE_HEADER);
  if (!verifyCalSignature(raw, signature, secret)) {
    logEvent('info', 'cal_webhook_invalid_signature', requestId, false);
    return json(401, { error: 'Unauthorized' });
  }

  let data: unknown = null;
  try {
    data = raw.length === 0 ? null : JSON.parse(raw);
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  const parsed = parseCalWebhookEnvelope(data);
  if (!parsed.success) {
    return json(400, { error: 'Invalid request' });
  }

  const { triggerEvent, createdAt, payload } = parsed.data;
  if (!isHandledCalTrigger(triggerEvent)) {
    logEvent('info', 'cal_webhook_ignored', requestId, true, { trigger: triggerEvent });
    return json(200, { ok: true });
  }

  const uid = bookingUid(payload);
  if (!uid) {
    logEvent('info', 'cal_webhook_missing_uid', requestId, false, { trigger: triggerEvent });
    return json(400, { error: 'Invalid request' });
  }

  if (!redisConfigured(env)) {
    logEvent('error', 'cal_webhook_redis_misconfigured', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }
  if (!notionConfigured(env)) {
    logEvent('error', 'cal_webhook_notion_misconfigured', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }

  const key = idempotencyKey(uid, triggerEvent);
  let claimed: boolean;
  try {
    claimed = await deps.claimIdempotency(key);
  } catch {
    logEvent('error', 'cal_webhook_redis_error', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }

  if (!claimed) {
    logEvent('info', 'cal_webhook_duplicate', requestId, true, { trigger: triggerEvent });
    return json(200, { ok: true });
  }

  try {
    const existing = await deps.leads.findByBookingId(uid);
    const write = mapCalEventToLeadWrite({
      trigger: triggerEvent,
      payload,
      uid,
      createdAt,
      existing
    });
    if (existing) {
      await deps.leads.update(existing.id, write);
    } else {
      await deps.leads.create(write);
    }
  } catch {
    try {
      await deps.releaseIdempotency(key);
    } catch {
      logEvent('error', 'cal_webhook_redis_error', requestId, false);
    }
    logEvent('error', 'cal_webhook_notion_error', requestId, false);
    return json(503, { error: 'Service unavailable' });
  }

  logEvent('info', 'cal_webhook_processed', requestId, true, { trigger: triggerEvent });

  if (deps.sendConversionEvent) {
    void deps
      .sendConversionEvent({ trigger: triggerEvent, uid, email: attendeeEmail(payload) })
      .catch(() => {});
  }

  return json(200, { ok: true });
}

function attendeeEmail(payload: Record<string, unknown>): string | undefined {
  const attendees = payload.attendees;
  if (!Array.isArray(attendees)) return undefined;
  const first = attendees[0];
  if (first && typeof first === 'object' && 'email' in first) {
    const email = (first as { email?: unknown }).email;
    if (typeof email === 'string' && email.includes('@')) return email;
  }
  return undefined;
}
