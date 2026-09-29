const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

/**
 * Verifica un token de Cloudflare Turnstile contra la API siteverify.
 * Fail-closed: cualquier error de red o respuesta no-ok devuelve false.
 */
export async function verifyTurnstileToken(
  secret: string,
  token: string,
  remoteIp?: string
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp && remoteIp !== 'unknown') body.set('remoteip', remoteIp);

  try {
    const res = await fetch(SITEVERIFY_URL, { method: 'POST', body });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
