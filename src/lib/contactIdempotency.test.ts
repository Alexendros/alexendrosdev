import { describe, expect, it } from 'vitest';
import {
  beginContactIdempotency,
  contactPayloadFingerprint,
  createMemoryContactIdempotencyStore,
  finishContactIdempotency,
  normalizeContactPayload,
  resolveContactIdempotencyKey,
  type ContactIdempotencyStore
} from './contactIdempotency';
import type { ContactInput } from './contactSchema';

const basePayload: ContactInput = {
  name: 'Alex Endros',
  entityType: 'particular',
  channel: 'correo',
  email: 'alex@example.com',
  reason: 'propuestaComercial',
  message: 'Quiero un informe comercial para mi dominio.',
  vias: ['revisar'],
  consent: true
};

describe('contactPayloadFingerprint', () => {
  it('API-08: Turnstile fuera de la identidad lógica', () => {
    const a = contactPayloadFingerprint({ ...basePayload, turnstileToken: 'token-a' });
    const b = contactPayloadFingerprint({ ...basePayload, turnstileToken: 'token-b' });
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });

  it('rota la huella si cambia el payload de negocio', () => {
    const a = contactPayloadFingerprint(basePayload);
    const b = contactPayloadFingerprint({ ...basePayload, message: 'Otro mensaje distinto.' });
    expect(a).not.toBe(b);
  });

  it('huella robusta (SHA-256), no hash 32 bits', () => {
    const fp = contactPayloadFingerprint(basePayload);
    expect(fp).toMatch(/^[a-f0-9]{64}$/);
    expect(normalizeContactPayload(basePayload)).not.toContain('turnstile');
  });
});

describe('resolveContactIdempotencyKey', () => {
  it('usa cabecera Idempotency-Key cuando es válida', () => {
    const req = new Request('https://x', {
      headers: { 'Idempotency-Key': 'client-key-001' }
    });
    expect(resolveContactIdempotencyKey(req, basePayload)).toBe(
      'alexendros:contact:idemp:client-key-001'
    );
  });

  it('sin cabecera usa huella SHA-256 del cuerpo', () => {
    const req = new Request('https://x');
    const key = resolveContactIdempotencyKey(req, basePayload);
    const fp = contactPayloadFingerprint(basePayload);
    expect(key).toBe(`alexendros:contact:idemp:body:${fp}`);
  });
});

describe('begin/finishContactIdempotency (reloj controlado)', () => {
  const key = 'alexendros:contact:idemp:test-key';
  const fingerprint = contactPayloadFingerprint(basePayload);

  it('API-01/03: claim → accepted → replay sin segundo propietario', async () => {
    const store = createMemoryContactIdempotencyStore();
    const t0 = 1_000_000;
    const begin = await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-1',
      nowMs: t0,
      createOwnerId: () => 'owner-1'
    });
    expect(begin).toEqual({ kind: 'acquired', ownerId: 'owner-1' });

    const finished = await finishContactIdempotency(store, {
      key,
      ownerId: 'owner-1',
      status: 'accepted',
      requestId: 'req-1',
      nowMs: t0 + 100
    });
    expect(finished).toBe(true);

    const replay = await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-2',
      nowMs: t0 + 200,
      createOwnerId: () => 'owner-2'
    });
    expect(replay).toEqual({ kind: 'accepted', requestId: 'req-1', replay: true });
  });

  it('API-02: lease vivo → processing', async () => {
    const store = createMemoryContactIdempotencyStore();
    const t0 = 2_000_000;
    await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-a',
      nowMs: t0,
      leaseMs: 60_000,
      createOwnerId: () => 'owner-a'
    });
    const second = await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-b',
      nowMs: t0 + 1_000,
      createOwnerId: () => 'owner-b'
    });
    expect(second.kind).toBe('processing');
    if (second.kind === 'processing') {
      expect(second.requestId).toBe('req-a');
      expect(second.retryAfterSec).toBeGreaterThan(0);
    }
  });

  it('API-04: misma clave otro fingerprint → conflict', async () => {
    const store = createMemoryContactIdempotencyStore();
    const t0 = 3_000_000;
    await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-1',
      nowMs: t0,
      createOwnerId: () => 'owner-1'
    });
    await finishContactIdempotency(store, {
      key,
      ownerId: 'owner-1',
      status: 'accepted',
      requestId: 'req-1',
      nowMs: t0 + 10
    });
    const other = contactPayloadFingerprint({
      ...basePayload,
      message: 'Payload distinto para conflicto.'
    });
    const conflict = await beginContactIdempotency(store, {
      key,
      fingerprint: other,
      requestId: 'req-2',
      nowMs: t0 + 20
    });
    expect(conflict).toEqual({ kind: 'conflict' });
  });

  it('API-05: retryable_failure permite reclamar', async () => {
    const store = createMemoryContactIdempotencyStore();
    const t0 = 4_000_000;
    await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-1',
      nowMs: t0,
      createOwnerId: () => 'owner-1'
    });
    await finishContactIdempotency(store, {
      key,
      ownerId: 'owner-1',
      status: 'retryable_failure',
      requestId: 'req-1',
      nowMs: t0 + 10
    });
    const reclaim = await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-2',
      nowMs: t0 + 20,
      createOwnerId: () => 'owner-2'
    });
    expect(reclaim).toEqual({ kind: 'acquired', ownerId: 'owner-2' });
  });

  it('API-06: unknown bloquea reenvío ciego', async () => {
    const store = createMemoryContactIdempotencyStore();
    const t0 = 5_000_000;
    await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-1',
      nowMs: t0,
      createOwnerId: () => 'owner-1'
    });
    await finishContactIdempotency(store, {
      key,
      ownerId: 'owner-1',
      status: 'unknown',
      requestId: 'req-1',
      nowMs: t0 + 10
    });
    const again = await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-2',
      nowMs: t0 + 20,
      createOwnerId: () => 'owner-2'
    });
    expect(again).toEqual({ kind: 'unknown', requestId: 'req-1' });
  });

  it('API-07: propietario antiguo no transiciona el claim de otro', async () => {
    const store = createMemoryContactIdempotencyStore();
    const t0 = 6_000_000;
    await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-1',
      nowMs: t0,
      leaseMs: 1_000,
      createOwnerId: () => 'owner-old'
    });
    // Lease vencido: nuevo propietario
    const reclaim = await beginContactIdempotency(store, {
      key,
      fingerprint,
      requestId: 'req-2',
      nowMs: t0 + 5_000,
      leaseMs: 60_000,
      createOwnerId: () => 'owner-new'
    });
    expect(reclaim).toEqual({ kind: 'acquired', ownerId: 'owner-new' });

    const stale = await finishContactIdempotency(store, {
      key,
      ownerId: 'owner-old',
      status: 'accepted',
      requestId: 'req-1',
      nowMs: t0 + 5_100
    });
    expect(stale).toBe(false);

    const current = await store.get(key);
    expect(current?.ownerId).toBe('owner-new');
    expect(current?.status).toBe('processing');
  });

  it('API-07b: compareAndSet rechaza owner incorrecto', async () => {
    const store = createMemoryContactIdempotencyStore();
    const t0 = 7_000_000;
    await beginContactIdempotency(store, {
      key: `${key}-cas`,
      fingerprint,
      requestId: 'req-1',
      nowMs: t0,
      createOwnerId: () => 'owner-real'
    });
    const hijack = await store.compareAndSet(
      `${key}-cas`,
      'owner-fake',
      {
        status: 'accepted',
        fingerprint,
        ownerId: 'owner-fake',
        requestId: 'hack',
        leaseExpiresAt: t0,
        resultExpiresAt: t0 + 60_000
      },
      60
    );
    expect(hijack).toBe(false);
    const record = await store.get(`${key}-cas`);
    expect(record?.ownerId).toBe('owner-real');
    expect(record?.status).toBe('processing');
  });
});

describe('ContactIdempotencyStore contract helper', () => {
  it('tryCreate es exclusivo', async () => {
    const store: ContactIdempotencyStore = createMemoryContactIdempotencyStore();
    const record = {
      status: 'processing' as const,
      fingerprint: 'abc',
      ownerId: 'o1',
      requestId: 'r1',
      leaseExpiresAt: 100,
      resultExpiresAt: 200
    };
    expect(await store.tryCreate('k', record, 60)).toBe(true);
    expect(await store.tryCreate('k', { ...record, ownerId: 'o2' }, 60)).toBe(false);
  });
});
