import type { APIRoute } from 'astro';
import { verifyEmailToken } from '../../../lib/email/doubleOptIn';

export const prerender = false;

function html(body: string, status = 200): Response {
  return new Response(
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Baja</title></head><body style="font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1rem;line-height:1.5">${body}</body></html>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

async function handle(url: URL): Promise<Response> {
  const secret = import.meta.env.UNSUBSCRIBE_SECRET;
  if (!secret) return html('<p>La baja no está disponible ahora mismo.</p>', 503);

  const token = url.searchParams.get('token') ?? '';
  const email = verifyEmailToken(token, secret);
  if (!email) return html('<p>Enlace de baja no válido o caducado.</p>', 400);

  return html(
    '<p>Te hemos dado de baja.</p><p style="font-size:13px;color:#666">No volverás a recibir correos de seguimiento. Si ha sido un error, escríbenos a <a href="mailto:hola@alexendros.dev">hola@alexendros.dev</a>.</p>'
  );
}

export const GET: APIRoute = async ({ url }) => handle(url);

export const POST: APIRoute = async ({ url }) => handle(url);

export const ALL: APIRoute = async ({ url }) => handle(url);
