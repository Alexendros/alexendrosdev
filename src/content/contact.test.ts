import { describe, expect, it } from 'vitest';
import { contact } from './contact';

describe('contacto R05', () => {
  it('expone mensajes de éxito y error del formulario', () => {
    expect(contact.messages.success.length).toBeGreaterThan(10);
    expect(contact.messages.error.length).toBeGreaterThan(10);
    expect(JSON.stringify(contact)).not.toMatch(/retainer/i);
    expect(JSON.stringify(contact)).not.toMatch(/diagnóstico/i);
  });
});
