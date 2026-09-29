import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface FakeScript {
  tagName: string;
  src: string;
  async: boolean;
  dataset: Record<string, string>;
}

interface DomEnv {
  store: Map<string, string>;
  scripts: FakeScript[];
  window: Window & typeof globalThis & Record<string, unknown>;
  document: Document;
}

function createDomEnv(): DomEnv {
  const store = new Map<string, string>();
  const scripts: FakeScript[] = [];

  const document = {
    cookie: '',
    head: {
      appendChild: (node: FakeScript): FakeScript => {
        scripts.push(node);
        return node;
      }
    },
    createElement: (tagName: string): FakeScript => ({
      tagName: tagName.toUpperCase(),
      src: '',
      async: false,
      dataset: {}
    }),
    querySelector: (selector: string): FakeScript | null => {
      const match = /^script\[data-tracker="([^"]+)"\]$/.exec(selector);
      if (!match) return null;
      return scripts.find((script) => script.dataset.tracker === match[1]) ?? null;
    }
  } as unknown as Document;

  const window = {
    localStorage: {
      getItem: (key: string): string | null => (store.has(key) ? (store.get(key) ?? null) : null),
      setItem: (key: string, value: string): void => {
        store.set(key, String(value));
      },
      removeItem: (key: string): void => {
        store.delete(key);
      }
    }
  } as unknown as Window & typeof globalThis & Record<string, unknown>;

  return { store, scripts, window, document };
}

function gtagEntries(window: DomEnv['window']): unknown[][] {
  return (window.dataLayer as unknown[][]) ?? [];
}

describe('tracking loaders', () => {
  let env: DomEnv;

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '1');
    env = createDomEnv();
    vi.stubGlobal('window', env.window);
    vi.stubGlobal('document', env.document);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('sin consentimiento no inyecta scripts ni define gtag/fbq', async () => {
    const { initTracking } = await import('./loaders');

    initTracking();

    expect(env.scripts).toHaveLength(0);
    expect(env.window.gtag).toBeUndefined();
    expect(env.window.fbq).toBeUndefined();
  });

  it('con analytics y PUBLIC_GA4_ID inyecta gtag y envía consent default denied antes de config', async () => {
    vi.stubEnv('PUBLIC_GA4_ID', 'G-TEST123');

    const consent = await import('./consent');
    const { loadGA4 } = await import('./loaders');

    consent.writeConsent(['necessary', 'analytics']);
    loadGA4();

    expect(env.scripts.map((script) => script.dataset.tracker)).toEqual(['ga4']);
    expect(env.scripts[0].src).toContain('G-TEST123');

    const dataLayer = gtagEntries(env.window);
    expect(Array.isArray(dataLayer)).toBe(true);

    const first = dataLayer[0] as unknown[];
    expect(first[0]).toBe('consent');
    expect(first[1]).toBe('default');
    expect(first[2]).toMatchObject({
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied'
    });

    const update = dataLayer.find(
      (entry) => entry[0] === 'consent' && entry[1] === 'update'
    ) as unknown[];
    expect(update[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied' });

    const configIndex = dataLayer.findIndex((entry) => entry[0] === 'config');
    expect(configIndex).toBeGreaterThan(0);
    expect((dataLayer[configIndex] as unknown[])[1]).toBe('G-TEST123');
  });

  it('con consentimiento pero sin PUBLIC_GA4_ID no inyecta nada', async () => {
    vi.stubEnv('PUBLIC_GA4_ID', '');

    const consent = await import('./consent');
    const { loadGA4 } = await import('./loaders');

    consent.writeConsent(['necessary', 'analytics']);
    loadGA4();

    expect(env.scripts).toHaveLength(0);
  });

  it('revocar el consentimiento emite gtag update denied y fbq revoke', async () => {
    vi.stubEnv('PUBLIC_GA4_ID', 'G-TEST123');
    vi.stubEnv('PUBLIC_META_PIXEL_ID', 'PIXEL1');

    const consent = await import('./consent');
    const { initTracking } = await import('./loaders');

    initTracking();
    consent.writeConsent(['necessary', 'analytics', 'marketing']);

    expect(env.scripts.map((script) => script.dataset.tracker)).toEqual(['ga4', 'meta-pixel']);

    consent.writeConsent(['necessary']);

    const lastUpdate = [...gtagEntries(env.window)]
      .reverse()
      .find((entry) => entry[0] === 'consent' && entry[1] === 'update') as unknown[];
    expect(lastUpdate[2]).toMatchObject({
      analytics_storage: 'denied',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });

    const fbqCalls = ((env.window.fbq as { queue?: unknown[][] }).queue ?? []).map((call) =>
      (call as unknown[]).slice(0, 2)
    );
    expect(fbqCalls).toContainEqual(['consent', 'revoke']);
  });

  it('con analytics y PUBLIC_POSTHOG_KEY crea el stub en cola e inyecta array.js', async () => {
    vi.stubEnv('PUBLIC_POSTHOG_KEY', 'phc_test');

    const consent = await import('./consent');
    const { loadPostHog } = await import('./loaders');

    consent.writeConsent(['necessary', 'analytics']);
    loadPostHog();

    const posthog = env.window.posthog as { _i?: unknown[]; __SV?: number };
    expect(Array.isArray(posthog._i)).toBe(true);
    const firstCall = posthog._i?.[0] as unknown[];
    expect(firstCall[0]).toBe('phc_test');
    expect(firstCall[1]).toMatchObject({ api_host: 'https://eu.i.posthog.com' });

    const script = env.scripts.find((item) => item.dataset.tracker === 'posthog');
    expect(script?.src).toBe('https://eu.i.posthog.com/static/array.js');
  });

  it('con marketing y PUBLIC_LINKEDIN_PARTNER_ID crea el stub lintrk con cola', async () => {
    vi.stubEnv('PUBLIC_LINKEDIN_PARTNER_ID', '12345');

    const consent = await import('./consent');
    const { loadLinkedIn } = await import('./loaders');

    consent.writeConsent(['necessary', 'marketing']);
    loadLinkedIn();

    const lintrk = env.window.lintrk as { q?: unknown[][] };
    expect(Array.isArray(lintrk.q)).toBe(true);
    expect(env.window._linkedin_partner_id).toBe('12345');
    expect(env.scripts.find((item) => item.dataset.tracker === 'linkedin')?.src).toContain(
      'snap.licdn.com'
    );
  });
});
