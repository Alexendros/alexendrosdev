import type { APIRoute } from 'astro';
import {
  verifyEmailToken,
  unsubscribeUrl,
  listUnsubscribeHeaders
} from '../../../lib/email/doubleOptIn';
import { isResendConfigured, sendResendEmail } from '../../../lib/email/resend';

export const prerender = false;

const SITE_URL = 'https://alexendros.dev';

function html(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Confirmación</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5">${body}</body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function handle(url: URL): Promise<Response> {
  const secret = import.meta.env.UNSUBSCRIBE_SECRET;
  if (!secret) return html('<p>La confirmación no está disponible ahora mismo.</p>', 503);

  const token = url.searchParams.get('token') ?? '';
  const email = verifyEmailToken(token, secret);
  if (!email) return html('<p>Enlace de confirmación no válido o caducado.</p>', 400);

  const cfg = {
    apiKey: import.meta.env.RESEND_API_KEY,
    from: import.meta.env.EMAIL_FROM,
    fromName: import.meta.env.EMAIL_FROM_NAME
  };

  if (isResendConfigured(cfg)) {
    const unsubscribe = unsubscribeUrl(SITE_URL, email, secret);
    await sendResendEmail(cfg, {
      to: email,
      subject: 'Confirmado: aquí tienes tu checklist',
      text: [
        'Gracias por confirmar tu suscripción.',
        'Aquí tienes la checklist de 27 errores que matan la conversión:',
        `${SITE_URL}/servicios`,
        '',
        '¿Prefieres que lo revisemos juntos? Reserva un diagnóstico:',
        `${SITE_URL}/contacto`,
        '',
        `Baja en un clic: ${unsubscribe}`
      ].join('\n'),
      html: [
        '<h2>Gracias por confirmar tu suscripción</h2>',
        '<p>Aquí tienes la checklist de 27 errores que matan la conversión. La tienes también en <a href="https://alexendros.dev/servicios">la página de servicios</a>.</p>',
        '<p>¿Prefieres que lo revisemos juntos? <a href="https://alexendros.dev/contacto">Reserva un diagnóstico</a>.</p>',
        `<p style="font-size:12px;color:#666">Si no quieres recibir más correos, <a href="${unsubscribe}">date de baja</a>.</p>`
      ].join(''),
      headers: listUnsubscribeHeaders(unsubscribe)
    });
  }

  return html(
    '<p>¡Listo! Tu suscripción está confirmada. Te hemos enviado la checklist por email.</p>'
  );
}

export const GET: APIRoute = async ({ url }) => handle(url);

export const ALL: APIRoute = async ({ url }) => handle(url);
