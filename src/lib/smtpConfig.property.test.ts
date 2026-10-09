import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { parseSmtpPort, resolveSmtpConfig } from './smtpConfig';

describe('smtpConfig property-based', () => {
  it('puertos fuera de 1..65535 o no enteros → null', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.double({ min: -100, max: 0, noNaN: true }),
          fc.double({ min: 65536, max: 1e6, noNaN: true }),
          fc.constantFrom('abc', '22.5', ' ', '-1', '65536', '1.5')
        ),
        (raw) => {
          expect(parseSmtpPort(String(raw))).toBeNull();
        }
      ),
      { numRuns: 60 }
    );
  });

  it('puertos enteros válidos se aceptan', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 65535 }), (port) => {
        expect(parseSmtpPort(String(port))).toBe(port);
      }),
      { numRuns: 40 }
    );
  });

  it('falta cualquier credencial → null', () => {
    fc.assert(
      fc.property(
        fc.record({
          SMTP_HOST: fc.option(fc.constantFrom('', 'smtp.example.com'), { nil: undefined }),
          SMTP_USER: fc.option(fc.constantFrom('', 'user'), { nil: undefined }),
          SMTP_PASS: fc.option(fc.constantFrom('', 'secret'), { nil: undefined }),
          SMTP_PORT: fc.constantFrom(undefined, '587', '0', '99999')
        }),
        (env) => {
          const cfg = resolveSmtpConfig(env);
          const hostOk = Boolean(env.SMTP_HOST?.trim());
          const userOk = Boolean(env.SMTP_USER?.trim());
          const passOk = Boolean(env.SMTP_PASS);
          const portOk = parseSmtpPort(env.SMTP_PORT) !== null;
          if (hostOk && userOk && passOk && portOk) {
            expect(cfg).not.toBeNull();
          } else {
            expect(cfg).toBeNull();
          }
        }
      ),
      { numRuns: 80 }
    );
  });
});
