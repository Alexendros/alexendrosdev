import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import {
  HANDLED_CAL_TRIGGERS,
  asNonEmptyString,
  isHandledCalTrigger,
  parseCalWebhookEnvelope
} from './calWebhookSchema';

describe('calWebhookSchema property-based', () => {
  it('envelope sin triggerEvent o payload inválido falla', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant({}),
          fc.record({ triggerEvent: fc.constant('') }),
          fc.record({ triggerEvent: fc.integer(), payload: fc.object() }),
          fc.record({ triggerEvent: fc.string({ minLength: 1 }), payload: fc.constant(null) })
        ),
        (data) => {
          expect(parseCalWebhookEnvelope(data).success).toBe(false);
        }
      ),
      { numRuns: 50 }
    );
  });

  it('todos los triggers conocidos son isHandledCalTrigger', () => {
    for (const t of HANDLED_CAL_TRIGGERS) {
      expect(isHandledCalTrigger(t)).toBe(true);
    }
  });

  it('strings aleatorios fuera del set no son handled', () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 40 })
          .filter((s) => !(HANDLED_CAL_TRIGGERS as readonly string[]).includes(s)),
        (s) => {
          expect(isHandledCalTrigger(s)).toBe(false);
        }
      ),
      { numRuns: 40 }
    );
  });

  it('asNonEmptyString solo acepta strings no vacíos tras trim', () => {
    fc.assert(
      fc.property(fc.anything(), (v) => {
        const out = asNonEmptyString(v);
        if (typeof v !== 'string' || v.trim().length === 0) {
          expect(out).toBeUndefined();
        } else {
          expect(out).toBe(v.trim());
        }
      }),
      { numRuns: 80 }
    );
  });
});
