import { describe, expect, it } from 'vitest';
import {
  contactReasonForService,
  escapeHtml,
  formatContactFieldErrors,
  isHoneypotFilled,
  parseContactBody,
  validateContactField,
  validateContactForm,
  type ContactFormSlice
} from './contactSchema';

const validCorreo = {
  name: 'Alex Endros',
  entityType: 'particular' as const,
  channel: 'correo' as const,
  email: 'alex@example.com',
  reason: 'propuestaComercial' as const,
  message: 'Quiero un informe comercial para mi dominio.',
  consent: true as const
};

const validWhatsapp = {
  name: 'Alex Endros',
  entityType: 'empresa' as const,
  channel: 'whatsapp' as const,
  phone: '+34 600 000 000',
  reason: 'proyectoEspecial' as const,
  message: 'Necesito una sesión para priorizar el siguiente paso.',
  consent: true as const
};

describe('parseContactBody R04', () => {
  it('acepta correo con email y sin teléfono', () => {
    expect(parseContactBody(validCorreo).success).toBe(true);
  });

  it('acepta WhatsApp con teléfono y sin email', () => {
    expect(parseContactBody(validWhatsapp).success).toBe(true);
  });

  it('rechaza formulario incompleto (sin motivo)', () => {
    const { reason: _r, ...rest } = validCorreo;
    expect(parseContactBody(rest).success).toBe(false);
  });

  it('rechaza sin mensaje de petición', () => {
    const { message: _m, ...rest } = validCorreo;
    expect(parseContactBody(rest).success).toBe(false);
  });

  it('rechaza WhatsApp sin teléfono', () => {
    expect(parseContactBody({ ...validWhatsapp, phone: undefined }).success).toBe(false);
  });

  it('rechaza correo sin email', () => {
    expect(parseContactBody({ ...validCorreo, email: undefined }).success).toBe(false);
  });

  it('rechaza consent distinto de true', () => {
    expect(parseContactBody({ ...validCorreo, consent: false }).success).toBe(false);
  });

  it('rechaza un email de más de 254 caracteres', () => {
    expect(
      parseContactBody({
        ...validCorreo,
        email: `${'a'.repeat(243)}@example.com`
      }).success
    ).toBe(false);
  });

  it('rechaza markup peligroso en el mensaje', () => {
    expect(
      parseContactBody({
        ...validCorreo,
        message: 'Hola <script>alert(1)</script> necesito ayuda ya.'
      }).success
    ).toBe(false);
  });
});

describe('validateContactForm', () => {
  const validSlice: ContactFormSlice = {
    name: 'Alex Endros',
    entityType: 'particular',
    channel: 'correo',
    phone: '',
    email: 'alex@example.com',
    reason: 'propuestaComercial',
    message: 'Quiero un informe comercial para mi dominio.',
    consent: true
  };

  it('formulario completo válido no devuelve errores', () => {
    expect(validateContactForm(validSlice)).toEqual([]);
  });

  it('nombre corto y consentimiento sin marcar devuelven ambos errores', () => {
    const errors = validateContactForm({ ...validSlice, name: 'A', consent: false });
    expect(errors.some((e) => e.field === 'name')).toBe(true);
    expect(errors.some((e) => e.field === 'consent')).toBe(true);
  });

  it('whatsapp sin teléfono devuelve error de teléfono', () => {
    const errors = validateContactForm({ ...validSlice, channel: 'whatsapp', phone: '' });
    expect(errors.some((e) => e.field === 'phone')).toBe(true);
  });

  it('markup peligroso en el mensaje devuelve error de mensaje', () => {
    const errors = validateContactForm({
      ...validSlice,
      message: 'Hola <script>alert(1)</script> necesito ayuda ya.'
    });
    expect(errors.some((e) => e.field === 'message')).toBe(true);
  });
});

describe('validateContactField', () => {
  const emptySlice: ContactFormSlice = {
    name: '',
    entityType: 'particular',
    channel: 'whatsapp',
    phone: '',
    email: '',
    reason: 'informacionCliente',
    message: '',
    consent: false
  };

  it('teléfono con caracteres no permitidos solo reporta phone', () => {
    const errors = validateContactField('phone', { ...emptySlice, phone: 'abc-not-a-phone' });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((e) => e.field === 'phone')).toBe(true);
  });

  it('markup en el mensaje solo reporta message', () => {
    const errors = validateContactField('message', {
      ...emptySlice,
      message: 'Hola <script>x</script> necesito ayuda ya.'
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.every((e) => e.field === 'message')).toBe(true);
  });

  it('campo válido no reporta errores aunque el resto esté vacío', () => {
    expect(validateContactField('name', { ...emptySlice, name: 'Alex Endros' })).toEqual([]);
  });
});

describe('formatContactFieldErrors', () => {
  it('nombra campo y causa de falta de contenido', () => {
    const parsed = parseContactBody({ ...validCorreo, message: '' });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = formatContactFieldErrors(parsed.error);
    expect(errors.some((e) => e.label === 'Tu petición' && e.cause === 'falta contenido')).toBe(
      true
    );
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

describe('contactReasonForService', () => {
  it('mapea cada slug de servicio a un motivo de contacto válido', () => {
    expect(contactReasonForService('informe-comercial')).toBe('propuestaComercial');
    expect(contactReasonForService('sesion-profesional')).toBe('proyectoEspecial');
    expect(contactReasonForService('auditoria-normativa-ciberseguridad')).toBe(
      'propuestaComercial'
    );
  });

  it('fallback al motivo por defecto con slug desconocido o ausente', () => {
    expect(contactReasonForService('slug-inexistente')).toBe('informacionCliente');
    expect(contactReasonForService('')).toBe('informacionCliente');
    expect(contactReasonForService(null)).toBe('informacionCliente');
    expect(contactReasonForService(undefined)).toBe('informacionCliente');
  });
});
