import { describe, expect, it } from 'vitest';
import { escapeHtml, isHoneypotFilled, parseContactBody } from './contactSchema';

describe('parseContactBody', () => {
  it('acepta payload válido con consent', () => {
    const result = parseContactBody({
      name: 'Alex',
      email: 'alex@example.com',
      subject: 'otro',
      message: 'Mensaje de prueba con más de veinte caracteres',
      consent: true
    });
    expect(result.success).toBe(true);
  });

  it('rechaza un email de más de 254 caracteres', () => {
    const result = parseContactBody({
      name: 'Alex',
      email: `${'a'.repeat(243)}@example.com`,
      subject: 'otro',
      message: 'Mensaje de prueba con más de veinte caracteres',
      consent: true
    });
    expect(result.success).toBe(false);
  });

  it('rechaza consent distinto de true', () => {
    const result = parseContactBody({
      name: 'Alex',
      email: 'alex@example.com',
      subject: 'otro',
      message: 'Mensaje de prueba con más de veinte caracteres',
      consent: false
    });
    expect(result.success).toBe(false);
  });
});

describe('isHoneypotFilled', () => {
  it('detecta honeypot relleno', () => {
    expect(isHoneypotFilled('bot')).toBe(true);
    expect(isHoneypotFilled('')).toBe(false);
    expect(isHoneypotFilled(undefined)).toBe(false);
  });
});

describe('escapeHtml', () => {
  it('escapa caracteres peligrosos', () => {
    expect(escapeHtml(`<script>"x"&'y'</script>`)).toBe(
      '&lt;script&gt;&quot;x&quot;&amp;&#39;y&#39;&lt;/script&gt;'
    );
  });
});
