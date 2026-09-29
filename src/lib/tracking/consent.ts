export type ConsentCategory = 'necessary' | 'preferences' | 'analytics' | 'marketing';

export interface ConsentState {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: string;
  version: number;
}

export const CONSENT_COOKIE = 'consent_v1';
export const CONSENT_STORAGE_KEY = 'consent_v1';
export const CONSENT_EXPIRES_DAYS = 365;
export const CONSENT_CATEGORIES: readonly ConsentCategory[] = [
  'necessary',
  'preferences',
  'analytics',
  'marketing'
];

type ConsentListener = (state: ConsentState) => void;

const listeners = new Set<ConsentListener>();

let current: ConsentState | null = null;

export function consentVersion(): number {
  const raw = import.meta.env.PUBLIC_COOKIE_CONSENT_VERSION as string | undefined;
  const parsed = Number.parseInt(String(raw ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function readCookie(name: string): string | null {
  if (!isBrowser()) return null;
  const encoded = `${encodeURIComponent(name)}=`;
  const entry = document.cookie.split('; ').find((item) => item.startsWith(encoded));
  if (!entry) return null;
  return decodeURIComponent(entry.slice(encoded.length));
}

function writeStorage(key: string, value: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    return;
  }
}

function removeStorage(key: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    return;
  }
}

function parseJson(value: string | null): unknown {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function normalize(raw: unknown, fallbackVersion: number): ConsentState | null {
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as Record<string, unknown>;
  if (typeof record.timestamp !== 'string') return null;
  return {
    necessary: true,
    preferences: record.preferences === true,
    analytics: record.analytics === true,
    marketing: record.marketing === true,
    timestamp: record.timestamp,
    version: typeof record.version === 'number' ? record.version : fallbackVersion
  };
}

function fromCookieValue(value: string | null): ConsentState | null {
  const parsed = parseJson(value);
  if (!parsed || typeof parsed !== 'object') return null;
  const record = parsed as Record<string, unknown>;
  if (Array.isArray(record.categories)) {
    const categories = record.categories.filter((item): item is string => typeof item === 'string');
    const timestamp =
      typeof record.consentTimestamp === 'string'
        ? record.consentTimestamp
        : new Date().toISOString();
    const version = typeof record.revision === 'number' ? record.revision : consentVersion();
    return {
      necessary: true,
      preferences: categories.includes('preferences'),
      analytics: categories.includes('analytics'),
      marketing: categories.includes('marketing'),
      timestamp,
      version
    };
  }
  return normalize(parsed, consentVersion());
}

function isExpired(timestamp: string): boolean {
  const time = Date.parse(timestamp);
  if (!Number.isFinite(time)) return true;
  return Date.now() - time > CONSENT_EXPIRES_DAYS * 86_400_000;
}

export function readConsent(): ConsentState | null {
  const version = consentVersion();
  const fromCookie = fromCookieValue(readCookie(CONSENT_COOKIE));
  if (fromCookie) {
    if (fromCookie.version !== version || isExpired(fromCookie.timestamp)) {
      current = null;
      removeStorage(CONSENT_STORAGE_KEY);
      return null;
    }
    current = fromCookie;
    writeStorage(CONSENT_STORAGE_KEY, JSON.stringify(fromCookie));
    return fromCookie;
  }
  if (current) {
    if (current.version !== version || isExpired(current.timestamp)) {
      current = null;
      removeStorage(CONSENT_STORAGE_KEY);
      return null;
    }
    return current;
  }
  removeStorage(CONSENT_STORAGE_KEY);
  return null;
}

export function hasConsent(category: ConsentCategory): boolean {
  if (category === 'necessary') return true;
  const state = readConsent();
  return state ? state[category] === true : false;
}

function emit(state: ConsentState): void {
  for (const listener of listeners) listener(state);
}

export function writeConsent(categories: readonly ConsentCategory[]): ConsentState {
  const state: ConsentState = {
    necessary: true,
    preferences: categories.includes('preferences'),
    analytics: categories.includes('analytics'),
    marketing: categories.includes('marketing'),
    timestamp: new Date().toISOString(),
    version: consentVersion()
  };
  current = state;
  writeStorage(CONSENT_STORAGE_KEY, JSON.stringify(state));
  emit(state);
  return state;
}

export function onConsentUpdate(listener: ConsentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function clearConsent(): void {
  current = null;
  removeStorage(CONSENT_STORAGE_KEY);
}
