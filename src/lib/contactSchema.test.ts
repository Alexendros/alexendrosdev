import { describe, expect, it } from 'vitest';
import {
  buildContactMessage,
  escapeHtml,
  formatContactFieldErrors,
  isHoneypotFilled,
  parseContactBody,
  portalModuleDisplayNames
} from './contactSchema';

const validCorreo = {
  name: 'Alex Endros',
  entityType: 'particular' as const,
  channel: 'correo' as const,
  email: 'alex@example.com',
  reason: 'propuestaComercial' as const,
  message: 'Quiero un informe comercial para mi dominio.',
  vias: ['revisar'] as const,
  consent: true as const
};

describe('parseContactBody R04', () => {
  it('acepta correo con email y sin teléfono', () => {
    expect(parseContactBody(validCorreo).success).toBe(true);
  });

  it('acepta sin motivo y aplica default informacionCliente', () => {
    const { reason: _r, ...rest } = validCorreo;
    const parsed = parseContactBody(rest);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.reason).toBe('informacionCliente');
  });

  it('rechaza sin mensaje de petición', () => {
    const { message: _m, ...rest } = validCorreo;
    expect(parseContactBody(rest).success).toBe(false);
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

  it('CFG-02/05: módulos se normalizan a IDs permitidos únicos', () => {
    const parsed = parseContactBody({
      ...validCorreo,
      modules: 'contenidos,tienda,tienda,<script>alert(1)</script>,precio,xxx'
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.modules).toBe('tienda,contenidos');
    expect(portalModuleDisplayNames(parsed.data.modules)).toMatch(
      /Integración de catálogo y pagos/
    );
    expect(portalModuleDisplayNames(parsed.data.modules)).toMatch(/Panel de contenidos/);
    expect(portalModuleDisplayNames(parsed.data.modules)).not.toMatch(/script|precio/i);
  });

  it('CFG-05: cadena hostil larga de módulos no rompe ni inyecta', () => {
    const hostile = `${'x'.repeat(5000)},tienda,<img onerror=1>,mensajeria`;
    const parsed = parseContactBody({ ...validCorreo, modules: hostile });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.modules).toBe('tienda,mensajeria');
    const msg = buildContactMessage(parsed.data);
    expect(msg).toContain('Integración de catálogo y pagos');
    expect(msg).not.toContain('<img');
    expect(msg).not.toContain('onerror');
  });

  it('contacto sin módulos sigue válido', () => {
    expect(parseContactBody(validCorreo).success).toBe(true);
    expect(parseContactBody({ ...validCorreo, modules: '' }).success).toBe(true);
    expect(parseContactBody({ ...validCorreo, modules: 'nope,fake' }).success).toBe(true);
    const onlyJunk = parseContactBody({ ...validCorreo, modules: 'nope,fake' });
    expect(onlyJunk.success && onlyJunk.data.modules).toBeUndefined();
  });

  it('CFG-06: servicio y proyecto allowlisted; desconocidos se descartan', () => {
    const parsed = parseContactBody({
      ...validCorreo,
      serviceSlug: 'informe-comercial',
      projectSlug: 'front-valencia',
      origin: 'proceso'
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.serviceSlug).toBe('informe-comercial');
    expect(parsed.data.projectSlug).toBe('front-valencia');
    expect(parsed.data.origin).toBe('proceso');
    const msg = buildContactMessage(parsed.data);
    expect(msg).toMatch(/Auditoría técnica SEO/);
    expect(msg).toMatch(/Front Valencia/);
    expect(msg).toMatch(/Origen de página: proceso/);

    for (const origin of ['home-linux', 'home-gestion', 'home-ia'] as const) {
      const homeOrigin = parseContactBody({ ...validCorreo, origin });
      expect(homeOrigin.success).toBe(true);
      if (!homeOrigin.success) return;
      expect(homeOrigin.data.origin).toBe(origin);
    }

    const junk = parseContactBody({
      ...validCorreo,
      serviceSlug: 'evil-slug',
      projectSlug: '<script>x</script>',
      origin: 'evil',
      precio: '1'
    } as typeof validCorreo & {
      serviceSlug: string;
      projectSlug: string;
      origin: string;
      precio: string;
    });
    expect(junk.success).toBe(true);
    if (!junk.success) return;
    expect(junk.data.serviceSlug).toBeUndefined();
    expect(junk.data.projectSlug).toBeUndefined();
    expect(junk.data.origin).toBeUndefined();
  });
});

describe('parseContactBody (formulario mínimo)', () => {
  it('aplica defaults de categoría y motivo cuando faltan', () => {
    const parsed = parseContactBody({
      name: 'Alex Endros',
      channel: 'correo',
      email: 'alex@example.com',
      message: 'Quiero un informe comercial para mi dominio.',
      vias: ['crear'],
      consent: true
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.entityType).toBe('particular');
    expect(parsed.data.reason).toBe('informacionCliente');
  });

  it('exige al menos una vía y otraDetalle si la vía es otra', () => {
    expect(parseContactBody({ ...validCorreo, vias: [] }).success).toBe(false);
    expect(
      parseContactBody({ ...validCorreo, vias: ['otra'], otraDetalle: undefined }).success
    ).toBe(false);
    const ok = parseContactBody({
      ...validCorreo,
      vias: ['otra'],
      otraDetalle: 'Integración con ERP'
    });
    expect(ok.success).toBe(true);
  });

  it('acepta sitio opcional válido y rechaza sitio inválido', () => {
    expect(parseContactBody({ ...validCorreo, sitio: 'empresa.es' }).success).toBe(true);
    expect(parseContactBody({ ...validCorreo, sitio: 'nope' }).success).toBe(false);
  });

  it('rechaza un canal distinto de correo', () => {
    expect(parseContactBody({ ...validCorreo, channel: 'whatsapp' }).success).toBe(false);
  });

  it('rechaza markup en el mensaje', () => {
    const parsed = parseContactBody({
      ...validCorreo,
      message: 'Hola <script>x</script> necesito ayuda ya.'
    });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    expect(formatContactFieldErrors(parsed.error).some((e) => e.field === 'message')).toBe(true);
  });
});

describe('formatContactFieldErrors', () => {
  it('nombra campo y causa de falta de contenido', () => {
    const parsed = parseContactBody({ ...validCorreo, message: '' });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = formatContactFieldErrors(parsed.error);
    expect(errors.some((e) => e.label === 'Mensaje' && e.cause === 'falta contenido')).toBe(true);
  });

  it('relaciona el error de consent con la aceptación del tratamiento', () => {
    const parsed = parseContactBody({ ...validCorreo, consent: false });
    expect(parsed.success).toBe(false);
    if (parsed.success) return;
    const errors = formatContactFieldErrors(parsed.error);
    expect(
      errors.some((e) => e.field === 'consent' && e.cause === 'falta la aceptación del tratamiento')
    ).toBe(true);
    expect(errors.some((e) => e.field === 'consent' && e.cause === 'falta contenido')).toBe(false);
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
