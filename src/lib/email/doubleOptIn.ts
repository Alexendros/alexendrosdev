import { createHmac, timingSafeEqual } from 'node:crypto';

const SIMPLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toBase64Url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(value: string): Buffer {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64');
}

export function signEmailToken(email: string, secret: string): string {
  const normalized = normalizeEmail(email);
  const payload = toBase64Url(Buffer.from(normalized, 'utf8'));
  const signature = toBase64Url(createHmac('sha256', secret).update(normalized, 'utf8').digest());
  return `${payload}.${signature}`;
}

export function verifyEmailToken(token: string, secret: string): string | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;
  let email: string;
  try {
    email = fromBase64Url(payload).toString('utf8');
  } catch {
    return null;
  }
  const normalized = normalizeEmail(email);
  if (!SIMPLE_EMAIL.test(normalized)) return null;
  const expected = createHmac('sha256', secret).update(normalized, 'utf8').digest();
  let provided: Buffer;
  try {
    provided = fromBase64Url(signature);
  } catch {
    return null;
  }
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;
  return normalized;
}

function siteBase(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export function confirmUrl(baseUrl: string, email: string, secret: string): string {
  const token = signEmailToken(email, secret);
  return `${siteBase(baseUrl)}/api/newsletter/confirm?token=${encodeURIComponent(token)}`;
}

export function unsubscribeUrl(baseUrl: string, email: string, secret: string): string {
  const token = signEmailToken(email, secret);
  return `${siteBase(baseUrl)}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
}

export function listUnsubscribeHeaders(url: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${url}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
  };
}
