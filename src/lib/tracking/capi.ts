import { createHash } from 'node:crypto';

export const CAPI_GRAPH_VERSION = 'v21.0';

export type CapiUserData = {
  email?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

export type CapiEventName = 'Lead' | 'Contact' | 'Schedule' | 'Purchase' | 'CompleteRegistration';

export type CapiEvent = {
  eventName: CapiEventName;
  eventTime?: number;
  eventSourceUrl?: string;
  eventId?: string;
  userData?: CapiUserData;
  customData?: Record<string, unknown>;
};

export type CapiConfig = {
  pixelId?: string;
  accessToken?: string;
  testEventCode?: string;
};

/** SHA-256 de un identificador personal (email) normalizado a minúsculas y sin espacios. */
export function hashUserData(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}

function buildUserData(user: CapiUserData | undefined): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  if (user?.email) data.em = [hashUserData(user.email)];
  if (user?.ip && user.ip !== 'unknown') data.client_ip_address = user.ip;
  if (user?.userAgent) data.client_user_agent = user.userAgent;
  if (user?.fbp) data.fbp = user.fbp;
  if (user?.fbc) data.fbc = user.fbc;
  return data;
}

export function isCapiConfigured(cfg: CapiConfig): boolean {
  return Boolean(cfg.pixelId?.trim() && cfg.accessToken?.trim());
}

/**
 * Envía un evento a la Conversions API de Meta (server-side).
 * Nunca lanza: devuelve true si Meta confirma la recepción.
 */
export async function sendCapiEvent(cfg: CapiConfig, event: CapiEvent): Promise<boolean> {
  const pixelId = cfg.pixelId?.trim();
  const accessToken = cfg.accessToken?.trim();
  if (!pixelId || !accessToken) return false;

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: event.eventName,
        event_time: event.eventTime ?? Math.floor(Date.now() / 1000),
        action_source: 'website',
        ...(event.eventSourceUrl ? { event_source_url: event.eventSourceUrl } : {}),
        ...(event.eventId ? { event_id: event.eventId } : {}),
        user_data: buildUserData(event.userData),
        ...(event.customData ? { custom_data: event.customData } : {})
      }
    ]
  };
  const testEventCode = cfg.testEventCode?.trim();
  if (testEventCode) payload.test_event_code = testEventCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${CAPI_GRAPH_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    if (!res.ok) return false;
    const json = (await res.json().catch(() => null)) as { events_received?: number } | null;
    return (json?.events_received ?? 0) > 0;
  } catch {
    return false;
  }
}
