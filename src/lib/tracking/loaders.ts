import { hasConsent, onConsentUpdate } from './consent';

type Fbq = ((...args: unknown[]) => void) & { queue?: unknown[][] };
type Gtag = (...args: unknown[]) => void;
type Lintrk = ((...args: unknown[]) => void) & { q?: unknown[][] };
type PostHogFn = {
  (...args: unknown[]): void;
  _i?: unknown[];
  __SV?: number;
  init?: (key: string, options?: unknown) => void;
  capture?: (event: string, properties?: unknown) => void;
  push?: (args: unknown[]) => void;
};

const loaded = new Set<string>();

function injectScript(src: string, tracker: string): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`script[data-tracker="${tracker}"]`)) return;
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.dataset.tracker = tracker;
  document.head.appendChild(script);
}

function once(name: string, action: () => void): void {
  if (loaded.has(name)) return;
  loaded.add(name);
  action();
}

function syncGtagConsent(): void {
  if (typeof window === 'undefined') return;
  const target = window as Window & { gtag?: Gtag };
  if (typeof target.gtag !== 'function') return;
  const marketing = hasConsent('marketing');
  target.gtag('consent', 'update', {
    analytics_storage: hasConsent('analytics') ? 'granted' : 'denied',
    ad_storage: marketing ? 'granted' : 'denied',
    ad_user_data: marketing ? 'granted' : 'denied',
    ad_personalization: marketing ? 'granted' : 'denied'
  });
}

function syncMetaConsent(): void {
  if (typeof window === 'undefined') return;
  const target = window as Window & { fbq?: Fbq };
  if (typeof target.fbq !== 'function') return;
  target.fbq('consent', hasConsent('marketing') ? 'grant' : 'revoke');
}

export function loadGA4(): void {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return;
  const id = import.meta.env.PUBLIC_GA4_ID as string | undefined;
  if (!id) return;
  once('ga4', () => {
    const target = window as Window & { dataLayer?: unknown[]; gtag?: Gtag };
    target.dataLayer = target.dataLayer || [];
    const gtag: Gtag = (...args) => {
      target.dataLayer?.push(args);
    };
    target.gtag = gtag;
    gtag('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });
    syncGtagConsent();
    gtag('js', new Date());
    gtag('config', id);
    injectScript(`https://www.googletagmanager.com/gtag/js?id=${id}`, 'ga4');
  });
}

export function loadMetaPixel(): void {
  if (typeof window === 'undefined' || !hasConsent('marketing')) return;
  const id = import.meta.env.PUBLIC_META_PIXEL_ID as string | undefined;
  if (!id) return;
  once('meta-pixel', () => {
    const target = window as Window & { fbq?: Fbq };
    if (!target.fbq) {
      const fbq = function (...args: unknown[]) {
        fbq.queue = fbq.queue ?? [];
        fbq.queue.push(args);
      } as Fbq;
      target.fbq = fbq;
    }
    target.fbq('init', id);
    target.fbq('track', 'PageView');
    injectScript('https://connect.facebook.net/en_US/fbevents.js', 'meta-pixel');
  });
}

export function loadClarity(): void {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return;
  const id = import.meta.env.PUBLIC_CLARITY_ID as string | undefined;
  if (!id) return;
  once('clarity', () => {
    injectScript(`https://www.clarity.ms/tag/${id}`, 'clarity');
  });
}

export function loadPostHog(): void {
  if (typeof window === 'undefined' || !hasConsent('analytics')) return;
  const key = import.meta.env.PUBLIC_POSTHOG_KEY as string | undefined;
  const host =
    (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) ?? 'https://eu.i.posthog.com';
  if (!key) return;
  once('posthog', () => {
    const target = window as Window & { posthog?: PostHogFn };
    if (!target.posthog) {
      const queue: unknown[][] = [];
      const posthog = function (...args: unknown[]) {
        queue.push(args);
      } as PostHogFn;
      posthog._i = queue;
      posthog.__SV = 1;
      posthog.init = (initKey, options) => {
        queue.push([initKey, options]);
      };
      posthog.capture = (event, properties) => {
        queue.push(['capture', event, properties]);
      };
      posthog.push = (args) => {
        queue.push(args);
      };
      target.posthog = posthog;
    }
    target.posthog.init?.(key, { api_host: host, capture_pageview: true });
    injectScript(`${host}/static/array.js`, 'posthog');
  });
}

export function loadLinkedIn(): void {
  if (typeof window === 'undefined' || !hasConsent('marketing')) return;
  const id = import.meta.env.PUBLIC_LINKEDIN_PARTNER_ID as string | undefined;
  if (!id) return;
  once('linkedin', () => {
    const target = window as Window & {
      lintrk?: Lintrk;
      _linkedin_partner_id?: string;
      _linkedin_data_partner_ids?: string[];
    };
    if (!target.lintrk) {
      const queue: unknown[][] = [];
      const lintrk = ((...args: unknown[]) => {
        queue.push(args);
      }) as Lintrk;
      lintrk.q = queue;
      target.lintrk = lintrk;
    }
    target._linkedin_partner_id = id;
    target._linkedin_data_partner_ids = target._linkedin_data_partner_ids ?? [];
    target._linkedin_data_partner_ids.push(id);
    injectScript('https://snap.licdn.com/li.lms-analytics/insight.min.js', 'linkedin');
  });
}

function loadAll(): void {
  loadGA4();
  loadMetaPixel();
  loadClarity();
  loadPostHog();
  loadLinkedIn();
  syncGtagConsent();
  syncMetaConsent();
}

export function initTracking(): void {
  if (typeof window === 'undefined') return;
  loadAll();
  onConsentUpdate(() => loadAll());
}
