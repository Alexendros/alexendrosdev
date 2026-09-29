import { track as trackVercel } from '@vercel/analytics';
import { hasConsent } from './consent';

type Gtag = (...args: unknown[]) => void;
type Fbq = (...args: unknown[]) => void;
type PostHogFn = { capture?: (event: string, properties?: unknown) => void };

export type FunnelEvent =
  | 'page_view'
  | 'view_servicios'
  | 'cta_click'
  | 'cal_click'
  | 'form_start'
  | 'form_step'
  | 'form_submit'
  | 'contact_form_success'
  | 'form_abandon_step'
  | 'lead_magnet_download';

type Props = Record<string, string | number | boolean | null | undefined>;

function gtagEvent(event: FunnelEvent, props: Props): void {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return;
  const target = window as Window & { gtag?: Gtag; dataLayer?: unknown[] };
  if (typeof target.gtag !== 'function') return;
  target.gtag('event', event, props);
}

function metaEvent(event: FunnelEvent, props: Props): void {
  if (typeof window === 'undefined' || !hasConsent('marketing')) return;
  const target = window as Window & { fbq?: Fbq };
  if (typeof target.fbq !== 'function') return;
  target.fbq('trackCustom', event, props);
  // Los eventos de conversión se reenvían también como estándar de Meta.
  if (event === 'form_submit' || event === 'lead_magnet_download') {
    target.fbq('track', 'Lead', props);
  }
}

function postHogEvent(event: FunnelEvent, props: Props): void {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return;
  const target = window as Window & { posthog?: PostHogFn };
  target.posthog?.capture?.(event, props);
}

/**
 * Emite un evento del embudo de conversión a todos los destinos con
 * consentimiento concedido. Nunca rompe si un proveedor no está cargado.
 */
export function track(event: FunnelEvent, props: Props = {}): void {
  trackVercel(event, props);
  gtagEvent(event, props);
  metaEvent(event, props);
  postHogEvent(event, props);
}

/**
 * Instala la captura base del embudo: page_view (también en navegaciones con
 * view transitions), view_servicios y clicks de CTA/Cal.com. Idempotente.
 */
export function setupFunnelTracking(): void {
  if (typeof window === 'undefined') return;
  const target = window as Window & { __funnelReady?: boolean };
  if (target.__funnelReady) return;
  target.__funnelReady = true;

  const emitPage = () => {
    const path = window.location.pathname;
    track('page_view', { path });
    if (path.startsWith('/servicios')) track('view_servicios', { path });
  };

  emitPage();
  document.addEventListener('astro:page-load', emitPage);
  document.addEventListener('click', (event) => {
    const element = event.target as Element | null;
    const anchor = element?.closest?.('a[href]');
    if (!anchor) return;
    const href = anchor.getAttribute('href') ?? '';
    if (anchor.hasAttribute('data-cal')) {
      track('cal_click', { href });
      return;
    }
    if (href.startsWith('/contacto')) {
      track('cta_click', { href, label: anchor.textContent?.trim().slice(0, 80) ?? '' });
    }
  });
}
