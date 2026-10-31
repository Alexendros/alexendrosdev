import { createHash } from 'node:crypto';
import type { ContactInput } from './contactSchema';

/**
 * Idempotencia de contacto — límites:
 * Redis (claim/estado) y SMTP no forman una transacción. No se promete
 * exactly-once: un correo puede quedar aceptado por el transporte sin
 * persistir `accepted`, o el estado puede quedar `unknown` sin reenvío ciego.
 */

export const CONTACT_IDEMPOTENCY_TTL_SECONDS = 10 * 60;
export const CONTACT_IDEMPOTENCY_LEASE_SECONDS = 60;
export const CONTACT_IDEMPOTENCY_KEY_PREFIX = 'alexendros:contact:idemp';
export const CONTACT_IDEMPOTENCY_RETRY_AFTER_SECONDS = 5;

export type ContactIdempotencyStatus = 'processing' | 'accepted' | 'retryable_failure' | 'unknown';

export type ContactIdempotencyRecord = {
  status: ContactIdempotencyStatus;
  fingerprint: string;
  ownerId: string;
  requestId: string;
  leaseExpiresAt: number;
  resultExpiresAt: number;
};

export type ContactIdempotencyStore = {
  get: (key: string) => Promise<ContactIdempotencyRecord | null>;
  /** Crea solo si la clave no existe. */
  tryCreate: (
    key: string,
    record: ContactIdempotencyRecord,
    ttlSeconds: number
  ) => Promise<boolean>;
  /**
   * Sustituye el registro solo si el propietario actual coincide con
   * `expectedOwnerId` (o el registro ha caducado / no existe).
   */
  compareAndSet: (
    key: string,
    expectedOwnerId: string,
    record: ContactIdempotencyRecord,
    ttlSeconds: number
  ) => Promise<boolean>;
};

export type BeginIdempotencyResult =
  | { kind: 'acquired'; ownerId: string }
  | { kind: 'processing'; requestId: string; retryAfterSec: number }
  | { kind: 'accepted'; requestId: string; replay: true }
  | { kind: 'conflict' }
  | { kind: 'unknown'; requestId: string };

/** Campos de negocio que definen la identidad lógica (sin Turnstile ni honeypot). */
export function normalizeContactPayload(data: ContactInput): string {
  return JSON.stringify({
    name: data.name,
    entityType: data.entityType,
    channel: data.channel,
    email: data.email ?? null,
    reason: data.reason,
    message: data.message,
    vias: data.vias,
    otraDetalle: data.otraDetalle ?? null,
    sitio: data.sitio ?? null,
    modules: data.modules ?? null,
    serviceSlug: data.serviceSlug ?? null,
    projectSlug: data.projectSlug ?? null,
    consent: data.consent
  });
}

/** Huella SHA-256 del payload normalizado (no el hash de 32 bits legado). */
export function contactPayloadFingerprint(data: ContactInput): string {
  return createHash('sha256').update(normalizeContactPayload(data)).digest('hex');
}

/** Clave Redis: cabecera Idempotency-Key o huella del cuerpo. */
export function resolveContactIdempotencyKey(request: Request, data: ContactInput): string | null {
  const header = request.headers.get('idempotency-key')?.trim();
  if (header && header.length >= 8 && header.length <= 128) {
    return `${CONTACT_IDEMPOTENCY_KEY_PREFIX}:${header}`;
  }
  const fingerprint = contactPayloadFingerprint(data);
  return `${CONTACT_IDEMPOTENCY_KEY_PREFIX}:body:${fingerprint}`;
}

function ttlSecondsFrom(nowMs: number, expiresAt: number): number {
  return Math.max(1, Math.ceil((expiresAt - nowMs) / 1000));
}

function retryAfterSec(nowMs: number, leaseExpiresAt: number): number {
  return Math.max(
    CONTACT_IDEMPOTENCY_RETRY_AFTER_SECONDS,
    Math.ceil((leaseExpiresAt - nowMs) / 1000)
  );
}

function isExpired(record: ContactIdempotencyRecord, nowMs: number): boolean {
  return record.resultExpiresAt <= nowMs;
}

function leaseActive(record: ContactIdempotencyRecord, nowMs: number): boolean {
  return record.status === 'processing' && record.leaseExpiresAt > nowMs;
}

/**
 * Inicia o reconsulta un claim. Un propietario antiguo no puede usurpar
 * un lease vivo de otro; solo puede reclamarse tras vencimiento o fallo reintentable.
 */
export async function beginContactIdempotency(
  store: ContactIdempotencyStore,
  opts: {
    key: string;
    fingerprint: string;
    requestId: string;
    nowMs: number;
    leaseMs?: number;
    resultTtlMs?: number;
    createOwnerId?: () => string;
  }
): Promise<BeginIdempotencyResult> {
  const leaseMs = opts.leaseMs ?? CONTACT_IDEMPOTENCY_LEASE_SECONDS * 1000;
  const resultTtlMs = opts.resultTtlMs ?? CONTACT_IDEMPOTENCY_TTL_SECONDS * 1000;
  const newOwner = () => opts.createOwnerId?.() ?? crypto.randomUUID();

  const existing = await store.get(opts.key);

  if (existing && !isExpired(existing, opts.nowMs)) {
    if (existing.fingerprint !== opts.fingerprint) {
      return { kind: 'conflict' };
    }
    if (existing.status === 'accepted') {
      return { kind: 'accepted', requestId: existing.requestId, replay: true };
    }
    if (existing.status === 'unknown') {
      return { kind: 'unknown', requestId: existing.requestId };
    }
    if (existing.status === 'retryable_failure') {
      const ownerId = newOwner();
      const record: ContactIdempotencyRecord = {
        status: 'processing',
        fingerprint: opts.fingerprint,
        ownerId,
        requestId: opts.requestId,
        leaseExpiresAt: opts.nowMs + leaseMs,
        resultExpiresAt: opts.nowMs + resultTtlMs
      };
      const ok = await store.compareAndSet(
        opts.key,
        existing.ownerId,
        record,
        ttlSecondsFrom(opts.nowMs, record.resultExpiresAt)
      );
      if (ok) return { kind: 'acquired', ownerId };
      return beginContactIdempotency(store, opts);
    }
    if (leaseActive(existing, opts.nowMs)) {
      return {
        kind: 'processing',
        requestId: existing.requestId,
        retryAfterSec: retryAfterSec(opts.nowMs, existing.leaseExpiresAt)
      };
    }
    // Lease vencido en processing: reclamar
    const ownerId = newOwner();
    const record: ContactIdempotencyRecord = {
      status: 'processing',
      fingerprint: opts.fingerprint,
      ownerId,
      requestId: opts.requestId,
      leaseExpiresAt: opts.nowMs + leaseMs,
      resultExpiresAt: opts.nowMs + resultTtlMs
    };
    const ok = await store.compareAndSet(
      opts.key,
      existing.ownerId,
      record,
      ttlSecondsFrom(opts.nowMs, record.resultExpiresAt)
    );
    if (ok) return { kind: 'acquired', ownerId };
    return beginContactIdempotency(store, opts);
  }

  const ownerId = newOwner();
  const record: ContactIdempotencyRecord = {
    status: 'processing',
    fingerprint: opts.fingerprint,
    ownerId,
    requestId: opts.requestId,
    leaseExpiresAt: opts.nowMs + leaseMs,
    resultExpiresAt: opts.nowMs + resultTtlMs
  };
  const created = await store.tryCreate(
    opts.key,
    record,
    ttlSecondsFrom(opts.nowMs, record.resultExpiresAt)
  );
  if (created) return { kind: 'acquired', ownerId };

  // Carrera: otro proceso creó la clave
  return beginContactIdempotency(store, opts);
}

/**
 * Transiciona el claim solo si `ownerId` sigue siendo el propietario.
 * Un propietario antiguo no puede liberar ni completar el intento de otro.
 */
export async function finishContactIdempotency(
  store: ContactIdempotencyStore,
  opts: {
    key: string;
    ownerId: string;
    status: Exclude<ContactIdempotencyStatus, 'processing'>;
    requestId: string;
    nowMs: number;
    resultTtlMs?: number;
  }
): Promise<boolean> {
  const current = await store.get(opts.key);
  if (!current || current.ownerId !== opts.ownerId) {
    return false;
  }
  const resultTtlMs = opts.resultTtlMs ?? CONTACT_IDEMPOTENCY_TTL_SECONDS * 1000;
  const record: ContactIdempotencyRecord = {
    ...current,
    status: opts.status,
    requestId: opts.requestId,
    leaseExpiresAt: opts.nowMs,
    resultExpiresAt: opts.nowMs + resultTtlMs
  };
  return store.compareAndSet(
    opts.key,
    opts.ownerId,
    record,
    ttlSecondsFrom(opts.nowMs, record.resultExpiresAt)
  );
}

/** Almacén en memoria para tests (reloj controlado vía nowMs en begin/finish). */
export function createMemoryContactIdempotencyStore(): ContactIdempotencyStore {
  const map = new Map<string, ContactIdempotencyRecord>();
  return {
    async get(key) {
      return map.get(key) ?? null;
    },
    async tryCreate(key, record) {
      if (map.has(key)) return false;
      map.set(key, { ...record });
      return true;
    },
    async compareAndSet(key, expectedOwnerId, record) {
      const current = map.get(key);
      if (current && current.ownerId !== expectedOwnerId) return false;
      map.set(key, { ...record });
      return true;
    }
  };
}

/** Adaptador Redis (Upstash). Valores JSON; CAS optimista por propietario. */
export function createRedisContactIdempotencyStore(redis: {
  get: (key: string) => Promise<unknown>;
  set: (key: string, value: string, opts: { nx?: boolean; ex: number }) => Promise<unknown>;
}): ContactIdempotencyStore {
  return {
    async get(key) {
      const raw = await redis.get(key);
      if (raw == null) return null;
      if (typeof raw === 'string') {
        try {
          return JSON.parse(raw) as ContactIdempotencyRecord;
        } catch {
          return null;
        }
      }
      if (typeof raw === 'object') return raw as ContactIdempotencyRecord;
      return null;
    },
    async tryCreate(key, record, ttlSeconds) {
      const result = await redis.set(key, JSON.stringify(record), {
        nx: true,
        ex: ttlSeconds
      });
      return Boolean(result);
    },
    async compareAndSet(key, expectedOwnerId, record, ttlSeconds) {
      const current = await this.get(key);
      if (current && current.ownerId !== expectedOwnerId) return false;
      await redis.set(key, JSON.stringify(record), { ex: ttlSeconds });
      return true;
    }
  };
}
