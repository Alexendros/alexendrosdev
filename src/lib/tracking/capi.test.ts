import { afterEach, describe, expect, it, vi } from 'vitest';
import { hashUserData, isCapiConfigured, sendCapiEvent } from './capi';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('hashUserData', () => {
  it('normaliza a minúsculas y sin espacios antes de hashear', () => {
    const a = hashUserData('  Foo@Bar.com ');
    const b = hashUserData('foo@bar.com');
    expect(a).toBe(b);
    expect(a).toHaveLength(64);
  });
});

describe('isCapiConfigured', () => {
  it('exige pixelId y accessToken', () => {
    expect(isCapiConfigured({ pixelId: '1', accessToken: 't' })).toBe(true);
    expect(isCapiConfigured({ pixelId: '1' })).toBe(false);
    expect(isCapiConfigured({ accessToken: 't' })).toBe(false);
    expect(isCapiConfigured({ pixelId: '  ', accessToken: 't' })).toBe(false);
  });
});

describe('sendCapiEvent', () => {
  it('no llama a fetch si falta configuración', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const ok = await sendCapiEvent({}, { eventName: 'Lead' });
    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('envía correctamente y devuelve true si Meta confirma', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));

    const ok = await sendCapiEvent(
      { pixelId: '123', accessToken: 'tok' },
      {
        eventName: 'Purchase',
        eventId: 'uid-1',
        eventSourceUrl: 'https://alexendros.dev/gracias',
        userData: { email: 'Foo@Bar.com', ip: '1.2.3.4', userAgent: 'vitest' },
        customData: { value: 99, currency: 'EUR' }
      }
    );

    expect(ok).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/123/events');
    const body = JSON.parse(String(init.body)) as {
      data: Array<Record<string, unknown>>;
    };
    expect(body.data[0].event_name).toBe('Purchase');
    expect(body.data[0].event_id).toBe('uid-1');
    expect(body.data[0].action_source).toBe('website');
    expect(body.data[0].custom_data).toEqual({ value: 99, currency: 'EUR' });
    expect(body.data[0].user_data).toMatchObject({
      em: [hashUserData('foo@bar.com')],
      client_ip_address: '1.2.3.4',
      client_user_agent: 'vitest'
    });
  });

  it('omite la IP cuando es "unknown"', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));
    await sendCapiEvent(
      { pixelId: '1', accessToken: 't' },
      { eventName: 'Lead', userData: { ip: 'unknown' } }
    );
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as { data: Array<Record<string, unknown>> };
    expect(body.data[0].user_data).not.toHaveProperty('client_ip_address');
  });

  it('incluye test_event_code cuando se configura', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response(JSON.stringify({ events_received: 1 }), { status: 200 }));
    await sendCapiEvent(
      { pixelId: '1', accessToken: 't', testEventCode: 'TEST123' },
      { eventName: 'Lead' }
    );
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as { test_event_code?: string };
    expect(body.test_event_code).toBe('TEST123');
  });

  it('devuelve false si Meta responde 400', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 400 }));
    expect(await sendCapiEvent({ pixelId: '1', accessToken: 't' }, { eventName: 'Lead' })).toBe(
      false
    );
  });

  it('devuelve false si fetch lanza', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    expect(await sendCapiEvent({ pixelId: '1', accessToken: 't' }, { eventName: 'Lead' })).toBe(
      false
    );
  });
});
