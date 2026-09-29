import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface BrowserEnv {
  store: Map<string, string>;
  document: Document;
  window: Window & typeof globalThis;
  setCookie: (value: string) => void;
}

function createBrowserEnv(): BrowserEnv {
  const store = new Map<string, string>();
  let cookie = '';

  const document = {
    get cookie(): string {
      return cookie;
    },
    set cookie(value: string) {
      cookie = value;
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
  } as unknown as Window & typeof globalThis;

  return {
    store,
    document,
    window,
    setCookie: (value) => {
      cookie = value;
    }
  };
}

describe('consent', () => {
  let env: BrowserEnv;

  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '1');
    env = createBrowserEnv();
    vi.stubGlobal('window', env.window);
    vi.stubGlobal('document', env.document);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('hasConsent("necessary") es true sin consentimiento previo', async () => {
    const { hasConsent } = await import('./consent');
    expect(hasConsent('necessary')).toBe(true);
  });

  it('readConsent() es null sin datos', async () => {
    const { readConsent } = await import('./consent');
    expect(readConsent()).toBeNull();
  });

  it('writeConsent persiste y refleja analytics=true, marketing=false', async () => {
    const { writeConsent, hasConsent, readConsent } = await import('./consent');

    writeConsent(['necessary', 'analytics']);

    expect(hasConsent('analytics')).toBe(true);
    expect(hasConsent('marketing')).toBe(false);

    const state = readConsent();
    expect(state?.analytics).toBe(true);
    expect(state?.marketing).toBe(false);

    const raw = env.store.get('consent_v1');
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw ?? '{}') as Record<string, unknown>;
    expect(parsed.necessary).toBe(true);
    expect(parsed.version).toBe(1);
  });

  it('onConsentUpdate recibe el estado y el unsubscribe deja de recibir', async () => {
    const { writeConsent, onConsentUpdate } = await import('./consent');

    const received: unknown[] = [];
    const unsubscribe = onConsentUpdate((state) => received.push(state));

    writeConsent(['necessary', 'preferences']);
    expect(received).toHaveLength(1);

    unsubscribe();
    writeConsent(['necessary', 'analytics']);
    expect(received).toHaveLength(1);
  });

  it('clearConsent deja readConsent en null', async () => {
    const { writeConsent, clearConsent, readConsent } = await import('./consent');

    writeConsent(['necessary', 'analytics']);
    expect(readConsent()).not.toBeNull();

    clearConsent();
    expect(readConsent()).toBeNull();
  });

  it('un version mismatch invalida el estado almacenado', async () => {
    const { writeConsent, readConsent } = await import('./consent');

    writeConsent(['necessary', 'analytics']);
    expect(readConsent()).not.toBeNull();

    vi.stubEnv('PUBLIC_COOKIE_CONSENT_VERSION', '2');
    expect(readConsent()).toBeNull();
  });

  it('parsea la cookie vanilla-cookieconsent por su campo categories', async () => {
    const payload = {
      categories: ['necessary', 'analytics'],
      revision: 1,
      consentTimestamp: new Date().toISOString()
    };
    env.setCookie(`consent_v1=${encodeURIComponent(JSON.stringify(payload))}`);

    const { readConsent, hasConsent } = await import('./consent');

    const state = readConsent();
    expect(state?.analytics).toBe(true);
    expect(state?.marketing).toBe(false);
    expect(hasConsent('analytics')).toBe(true);
  });
});
