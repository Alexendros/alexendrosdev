import { describe, expect, it } from 'vitest';
import { isAllowedReferralCode, REFERRAL_ALLOWLIST } from '../content/referralCodes';
import { normalizeReferralCode, referralCookieHeader } from './referral';

describe('referidos allowlist', () => {
  it('normaliza códigos del patrón y rechaza basura', () => {
    expect(normalizeReferralCode('qa-allowlist')).toBe('QA-ALLOWLIST');
    expect(normalizeReferralCode('x')).toBeNull();
    expect(normalizeReferralCode('../evil')).toBeNull();
  });

  it('solo códigos de la lista están permitidos', () => {
    expect(REFERRAL_ALLOWLIST.length).toBeGreaterThan(0);
    expect(isAllowedReferralCode('QA-ALLOWLIST')).toBe(true);
    expect(isAllowedReferralCode('INVENTADO-XYZ')).toBe(false);
  });

  it('la cookie de servidor declara HttpOnly, Secure y SameSite=Lax', () => {
    const header = referralCookieHeader('QA-ALLOWLIST');
    expect(header).toMatch(/HttpOnly/i);
    expect(header).toMatch(/Secure/i);
    expect(header).toMatch(/SameSite=Lax/i);
  });
});
