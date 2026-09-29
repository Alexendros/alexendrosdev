import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { resolveSmtpConfig } from '../../lib/smtpConfig';
import { verifyTurnstileToken } from '../../lib/turnstile';

export const prerender = false;

const MAIL_FROM = 'operaciones@alexendros.dev';
const MAIL_TO = 'operaciones@alexendros.dev';
const FALLBACK_REDIRECT = '/afiliados';

let cachedRatelimit: Ratelimit | null = null;

function getRatelimit(): Ratelimit {
  if (cachedRatelimit) return cachedRatelimit;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('redis_misconfigured');
  cachedRatelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    prefix: 'alexendros:affiliates'
  });
  return cachedRatelimit;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

function redirect(estado: 'ok' | 'error'): Response {
  return new Response(null, {
    status: 303,
    headers: { Location: `${FALLBACK_REDIRECT}?estado=${estado}#solicitud` }
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function field(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

export const POST: APIRoute = async ({ request }) => {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return redirect('error');
  }

  if (field(form, 'website').length > 0) return redirect('ok');

  const nombre = field(form, 'nombre');
  const email = field(form, 'email');
  const canal = field(form, 'canal');
  const mensaje = field(form, 'mensaje');
  const consent = field(form, 'consent');

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (nombre.length < 2 || !emailOk || mensaje.length < 20 || !consent) {
    return redirect('error');
  }

  const ip = clientIp(request);

  const turnstileSecret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const token = field(form, 'cf-turnstile-response');
    const ok = token.length > 0 ? await verifyTurnstileToken(turnstileSecret, token, ip) : false;
    if (!ok) return redirect('error');
  }

  try {
    const limit = await getRatelimit().limit(ip);
    if (!limit.success) return redirect('error');
  } catch {
    return redirect('error');
  }

  const smtp = resolveSmtpConfig({
    SMTP_HOST: import.meta.env.SMTP_HOST,
    SMTP_PORT: import.meta.env.SMTP_PORT,
    SMTP_USER: import.meta.env.SMTP_USER,
    SMTP_PASS: import.meta.env.SMTP_PASS
  });
  if (!smtp) return redirect('error');

  const text = [
    'Nueva solicitud de afiliado (origen: afiliados)',
    '',
    `Nombre: ${nombre}`,
    `Email: ${email}`,
    `Canal: ${canal || '—'}`,
    '',
    'Mensaje:',
    mensaje
  ].join('\n');

  const html = `
    <h2>Solicitud de afiliado</h2>
    <p><strong>Origen:</strong> afiliados</p>
    <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Canal:</strong> ${escapeHtml(canal) || '—'}</p>
    <p><strong>Mensaje:</strong></p>
    <p>${escapeHtml(mensaje).replace(/\n/g, '<br />')}</p>
  `;

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.pass }
    });
    await transporter.sendMail({
      from: MAIL_FROM,
      to: MAIL_TO,
      replyTo: email,
      subject: `[alexendros.dev] Afiliados - ${nombre}`,
      html,
      text
    });
  } catch {
    return redirect('error');
  }

  return redirect('ok');
};

export const ALL: APIRoute = async () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
