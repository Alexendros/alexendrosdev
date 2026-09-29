import { describe, expect, it } from 'vitest';
import {
  confirmUrl,
  listUnsubscribeHeaders,
  normalizeEmail,
  signEmailToken,
  unsubscribeUrl,
  verifyEmailToken
} from './doubleOptIn';

const SECRET = 'test-secret';

describe('normalizeEmail', () => {
  it('recorta y pasa a minúsculas', () => {
    expect(normalizeEmail('  Ana@Example.COM ')).toBe('ana@example.com');
  });
});

describe('signEmailToken / verifyEmailToken', () => {
  it('devuelve el email normalizado para un token válido', () => {
    const token = signEmailToken('Ana@Example.com', SECRET);
    expect(verifyEmailToken(token, SECRET)).toBe('ana@example.com');
  });

  it('rechaza un token con firma manipulada', () => {
    const token = signEmailToken('ana@example.com', SECRET);
    const tampered = `${token.slice(0, -1)}${token.endsWith('A') ? 'B' : 'A'}`;
    expect(verifyEmailToken(tampered, SECRET)).toBeNull();
  });

  it('rechaza con otro secreto', () => {
    const token = signEmailToken('ana@example.com', SECRET);
    expect(verifyEmailToken(token, 'otro-secreto')).toBeNull();
  });

  it('rechaza formatos inválidos', () => {
    expect(verifyEmailToken('sin-punto', SECRET)).toBeNull();
    expect(verifyEmailToken('', SECRET)).toBeNull();
    expect(verifyEmailToken('a.b.c', SECRET)).toBeNull();
  });

  it('rechaza payload con email inválido', () => {
    const token = signEmailToken('no-es-email', SECRET);
    expect(verifyEmailToken(token, SECRET)).toBeNull();
  });
});

describe('urls y cabeceras', () => {
  it('construye la URL de confirmación con token', () => {
    const url = confirmUrl('https://alexendros.dev/', 'ana@example.com', SECRET);
    expect(url.startsWith('https://alexendros.dev/api/newsletter/confirm?token=')).toBe(true);
  });

  it('construye la URL de baja sin barra doble', () => {
    const url = unsubscribeUrl('https://alexendros.dev/', 'ana@example.com', SECRET);
    expect(url.startsWith('https://alexendros.dev/api/newsletter/unsubscribe?token=')).toBe(true);
  });

  it('genera cabeceras List-Unsubscribe de un clic', () => {
    const headers = listUnsubscribeHeaders('https://alexendros.dev/baja');
    expect(headers['List-Unsubscribe']).toBe('<https://alexendros.dev/baja>');
    expect(headers['List-Unsubscribe-Post']).toBe('List-Unsubscribe=One-Click');
  });
});
