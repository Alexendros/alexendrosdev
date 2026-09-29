import { afterEach, describe, expect, it, vi } from 'vitest';
import { isResendConfigured, sendResendEmail } from './resend';

const cfg = { apiKey: 're_test', from: 'hola@alexendros.dev', fromName: 'Alexendros' };

afterEach(() => {
  vi.restoreAllMocks();
});

describe('isResendConfigured', () => {
  it('exige apiKey y from', () => {
    expect(isResendConfigured({})).toBe(false);
    expect(isResendConfigured({ apiKey: 're_test' })).toBe(false);
    expect(isResendConfigured({ from: 'hola@alexendros.dev' })).toBe(false);
    expect(isResendConfigured({ apiKey: '  ', from: 'hola@alexendros.dev' })).toBe(false);
    expect(isResendConfigured(cfg)).toBe(true);
  });
});

describe('sendResendEmail', () => {
  it('no llama a fetch si falta configuración', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const ok = await sendResendEmail({}, { to: 'ana@example.com', subject: 'x', html: '<p>x</p>' });
    expect(ok).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('envía el email y devuelve true cuando la API responde ok', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));

    const ok = await sendResendEmail(cfg, {
      to: 'ana@example.com',
      subject: 'Hola',
      html: '<p>Hola</p>',
      text: 'Hola',
      replyTo: 'operaciones@alexendros.dev',
      headers: { 'List-Unsubscribe': '<https://alexendros.dev/baja>' }
    });

    expect(ok).toBe(true);
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.from).toBe('Alexendros <hola@alexendros.dev>');
    expect(body.to).toEqual(['ana@example.com']);
    expect(body.subject).toBe('Hola');
    expect(body.text).toBe('Hola');
    expect(body.reply_to).toBe('operaciones@alexendros.dev');
    expect(body.headers).toEqual({ 'List-Unsubscribe': '<https://alexendros.dev/baja>' });
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe('Bearer re_test');
  });

  it('devuelve false si la API responde con error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('nope', { status: 422 }));
    const ok = await sendResendEmail(cfg, {
      to: 'ana@example.com',
      subject: 'x',
      html: '<p>x</p>'
    });
    expect(ok).toBe(false);
  });

  it('devuelve false si fetch lanza', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    const ok = await sendResendEmail(cfg, {
      to: 'ana@example.com',
      subject: 'x',
      html: '<p>x</p>'
    });
    expect(ok).toBe(false);
  });

  it('acepta varios destinatarios', async () => {
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('{}', { status: 200 }));
    await sendResendEmail(cfg, {
      to: ['a@example.com', 'b@example.com'],
      subject: 'x',
      html: '<p>x</p>'
    });
    const [, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(String(init.body)) as Record<string, unknown>;
    expect(body.to).toEqual(['a@example.com', 'b@example.com']);
  });
});
