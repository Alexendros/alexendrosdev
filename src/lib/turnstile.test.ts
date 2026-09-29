import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyTurnstileToken } from './turnstile';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function mockFetch(impl: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    return Promise.resolve(impl(url, init));
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('verifyTurnstileToken', () => {
  it('devuelve true cuando siteverify responde success', async () => {
    const spy = mockFetch(() => new Response(JSON.stringify({ success: true }), { status: 200 }));
    await expect(verifyTurnstileToken('secret', 'token')).resolves.toBe(true);
    expect(spy).toHaveBeenCalledWith(SITEVERIFY_URL, expect.objectContaining({ method: 'POST' }));
  });

  it('envía el token y el remoteip al endpoint correcto', async () => {
    let body: URLSearchParams | undefined;
    mockFetch((_url, init) => {
      body = init?.body as URLSearchParams;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });
    await verifyTurnstileToken('secret', 'token-123', '203.0.113.7');
    expect(body?.get('secret')).toBe('secret');
    expect(body?.get('response')).toBe('token-123');
    expect(body?.get('remoteip')).toBe('203.0.113.7');
  });

  it('omite remoteip cuando es "unknown"', async () => {
    let body: URLSearchParams | undefined;
    mockFetch((_url, init) => {
      body = init?.body as URLSearchParams;
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    });
    await verifyTurnstileToken('secret', 'token', 'unknown');
    expect(body?.has('remoteip')).toBe(false);
  });

  it('devuelve false cuando success es false', async () => {
    mockFetch(() => new Response(JSON.stringify({ success: false }), { status: 200 }));
    await expect(verifyTurnstileToken('secret', 'token')).resolves.toBe(false);
  });

  it('devuelve false (fail-closed) si el endpoint no responde ok', async () => {
    mockFetch(() => new Response('nope', { status: 500 }));
    await expect(verifyTurnstileToken('secret', 'token')).resolves.toBe(false);
  });

  it('devuelve false si fetch lanza', async () => {
    mockFetch(() => {
      throw new Error('network down');
    });
    await expect(verifyTurnstileToken('secret', 'token')).resolves.toBe(false);
  });
});
