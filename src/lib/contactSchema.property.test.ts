import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { escapeHtml, isHoneypotFilled, parseContactBody } from './contactSchema';

const baseValid = {
  name: 'Alex',
  email: 'alex@example.com',
  subject: 'otro',
  message: 'Mensaje de prueba con más de veinte caracteres',
  consent: true as const
};

describe('contactSchema property-based', () => {
  it('emails > 254 caracteres nunca pasan', () => {
    fc.assert(
      fc.property(fc.integer({ min: 255, max: 400 }), (len) => {
        const local = 'a'.repeat(Math.max(1, len - 12));
        const email = `${local}@example.com`;
        expect(email.length).toBeGreaterThan(254);
        const result = parseContactBody({ ...baseValid, email });
        expect(result.success).toBe(false);
      }),
      { numRuns: 40 }
    );
  });

  it('nombres cortos (<2) o largos (>100) tras trim fallan', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom('', 'a', ' '),
          fc.integer({ min: 101, max: 140 }).map((n) => 'x'.repeat(n))
        ),
        (name) => {
          const result = parseContactBody({ ...baseValid, name });
          expect(result.success).toBe(false);
        }
      ),
      { numRuns: 40 }
    );
  });

  it('honeypot no vacío se detecta siempre', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 40 }).filter((s) => s.trim().length > 0),
        (hp) => {
          expect(isHoneypotFilled(hp)).toBe(true);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('escapeHtml elimina metacaracteres HTML peligrosos en una pasada', () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 80 }), (raw) => {
        const once = escapeHtml(raw);
        expect(once).not.toMatch(/[<>"']/);
      }),
      { numRuns: 80 }
    );
  });
});
