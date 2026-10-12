import { z } from 'zod';
import { formatEuro, modulePrices, portalBasePrice, provisionalPrices } from './pricing';

export const catalogEntrySchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['service', 'portal', 'module']),
  title: z.string().min(1),
  priceEuros: z.number().positive(),
  payment: z.string().min(1),
  timeline: z.string().min(1),
  delivery: z.string().min(1),
  guarantee: z.string().min(1)
});

export type CatalogEntry = z.infer<typeof catalogEntrySchema>;

export const serviceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  description: z.string().min(1),
  audience: z.string().min(1),
  problems: z.array(z.string()).min(1),
  scope: z.array(z.string()).min(1),
  deliverables: z.array(z.string()).min(1),
  process: z.array(z.string()).min(1),
  technologies: z.array(z.string()).min(1),
  exclusions: z.array(z.string()).min(1),
  priceEuros: z.number().positive(),
  payment: z.string().min(1),
  timeline: z.string().min(1),
  delivery: z.string().min(1),
  guarantee: z.string().min(1),
  cta: z.string().min(1),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).min(1)
});

export type Service = z.infer<typeof serviceSchema>;

export const portalModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  priceEuros: z.number().positive(),
  payment: z.string().min(1),
  timeline: z.string().min(1),
  delivery: z.string().min(1),
  guarantee: z.string().min(1),
  additive: z.boolean()
});

export type PortalModule = z.infer<typeof portalModuleSchema>;

export const services: Service[] = [
  {
    slug: 'informe-comercial',
    title: 'Informe comercial',
    short:
      'Inspección metodológica de tu dominio y presencia en internet, con dossier de hallazgos y recomendaciones.',
    description:
      'Reviso tu dominio web y tu presencia en internet. Te envío un dossier con detecciones, hallazgos, áreas a corregir ya y recomendaciones para construir algo más eficiente para tu negocio.',
    audience: 'Negocios y profesionales que necesitan saber por dónde empezar antes de invertir.',
    problems: [
      'La web no trae contactos',
      'No sabes qué corregir primero',
      'Has recibido propuestas difíciles de priorizar'
    ],
    scope: [
      'Dominio web y presencia pública',
      'Claridad de mensaje y camino a contacto',
      'Velocidad y uso en móvil',
      'Priorización de hallazgos'
    ],
    deliverables: [
      'Dossier informativo de detecciones y hallazgos',
      'Áreas a corregir ya',
      'Recomendaciones de siguiente paso'
    ],
    process: [
      'Encargo y acceso al dominio',
      'Inspección metodológica',
      'Redacción del dossier',
      'Entrega y ronda de aclaraciones'
    ],
    technologies: ['Análisis CWV, SEO técnico básico, revisión de contenidos y accesibilidad.'],
    exclusions: [
      'No incluye implementación de las mejoras',
      'No incluye pentest ni certificación oficial'
    ],
    priceEuros: provisionalPrices.informeComercial,
    payment: 'Pago único antes de empezar',
    timeline: '5 días laborables',
    delivery: 'Dossier con hallazgos priorizados y recomendaciones',
    guarantee: 'Una ronda de aclaraciones en 10 días naturales',
    cta: '/contacto',
    metrics: [
      { label: 'Precio', value: formatEuro(provisionalPrices.informeComercial) },
      { label: 'Plazo', value: '5 días' }
    ]
  },
  {
    slug: 'sesion-profesional',
    title: 'Sesión profesional',
    short:
      'Sesión de trabajo para desbloquear un problema concreto o decidir el siguiente paso técnico.',
    description:
      'Una hora de trabajo enfocado. Sales con siguientes pasos por escrito en el siguiente día laborable.',
    audience: 'Quien necesita desbloquear una decisión técnica o de producto con plazo corto.',
    problems: [
      'Hay un bloqueo concreto',
      'Necesitas decidir el siguiente paso',
      'No quieres un proyecto completo todavía'
    ],
    scope: ['Conversación de 60 minutos', 'Priorización del problema', 'Siguientes pasos escritos'],
    deliverables: ['Resumen de siguientes pasos por escrito'],
    process: ['Reserva en Cal.com', 'Sesión de 60 minutos', 'Entrega del resumen'],
    technologies: ['Cal.com para reserva y pago.'],
    exclusions: ['No incluye implementación', 'No incluye auditoría completa'],
    priceEuros: provisionalPrices.sesionProfesional,
    payment: 'Pago al reservar en Cal.com',
    timeline: '60 minutos',
    delivery: 'Siguientes pasos por escrito en 1 día laborable',
    guarantee: 'Resumen entregado en 1 día laborable tras la sesión',
    cta: 'https://cal.com/alexendros/sesion-tecnica',
    metrics: [
      { label: 'Precio', value: formatEuro(provisionalPrices.sesionProfesional) },
      { label: 'Duración', value: '60 min' }
    ]
  },
  {
    slug: 'auditoria-normativa-ciberseguridad',
    title: 'Auditoría de normativa y ciberseguridad',
    short:
      'Informe de RGPD/LSSI y seguridad básica, con severidad y corrección recomendada por hallazgo.',
    description:
      'Revisión de cumplimiento normativo y de seguridad básica de tu presencia web. Cada hallazgo lleva severidad y corrección recomendada. No incluye pentest ni certificación.',
    audience: 'Negocios que necesitan un informe accionable antes de endurecer su sitio.',
    problems: [
      'Dudas de cumplimiento RGPD/LSSI',
      'Superficie de seguridad sin priorizar',
      'Necesitas un informe, no un pentest'
    ],
    scope: [
      'RGPD y LSSI en la superficie pública',
      'Seguridad básica (cabeceras, secretos expuestos, superficies evidentes)',
      'Priorización por severidad'
    ],
    deliverables: [
      'Informe con hallazgos de normativa y seguridad básica',
      'Severidad y corrección por hallazgo'
    ],
    process: ['Alcance del encargo', 'Análisis', 'Redacción del informe', 'Entrega'],
    technologies: ['Revisión proporcional OWASP ASVS L1, CSP, cookies y formularios.'],
    exclusions: [
      'No incluye pentest',
      'No incluye certificación oficial',
      'No incluye implementación de remedios'
    ],
    priceEuros: provisionalPrices.auditoria,
    payment: '50 % al encargo y 50 % a la entrega, sin recargo',
    timeline: '10 días laborables',
    delivery:
      'Informe RGPD/LSSI y seguridad básica; cada hallazgo con severidad y corrección recomendada',
    guarantee: 'Corrección de desviaciones del alcance escrito en 15 días naturales',
    cta: '/contacto',
    metrics: [
      { label: 'Precio', value: formatEuro(provisionalPrices.auditoria) },
      { label: 'Plazo', value: '10 días' }
    ]
  }
];

export const portalBase: PortalModule = {
  id: 'portal-inicio',
  title: 'Portal de inicio',
  short: 'Landing clásica con página de gracias, formulario y publicación.',
  priceEuros: portalBasePrice,
  payment: '50 % al encargo y 50 % al publicar, sin recargo',
  timeline: '10 días laborables',
  delivery: 'Landing, página de gracias, formulario y publicación',
  guarantee:
    '30 días naturales para corregir desviaciones del alcance escrito. LCP ≤ 2,5 s, axe 0 en rutas acordadas, contraste AA',
  additive: false
};

export const portalModules: PortalModule[] = [
  {
    id: 'tienda',
    title: 'Tienda online',
    short: 'Catálogo y pasarela de pagos.',
    priceEuros: modulePrices.tienda,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+15 días laborables',
    delivery: 'Catálogo y pasarela de pagos operativa',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  },
  {
    id: 'mensajeria',
    title: 'Canal de mensajería',
    short: 'Canalización de clientes a través de aplicaciones de mensajería.',
    priceEuros: modulePrices.mensajeria,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+5 días laborables',
    delivery: 'Canal de mensajería conectado al portal',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  },
  {
    id: 'usuarios',
    title: 'Registro de usuarios y gestión de clientes',
    short: 'Registro de usuarios y gestión interna de clientes.',
    priceEuros: modulePrices.usuarios,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+10 días laborables',
    delivery: 'Registro y panel interno de clientes',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  },
  {
    id: 'contenidos',
    title: 'Panel de contenidos',
    short: 'Publicaciones de fácil administración.',
    priceEuros: modulePrices.contenidos,
    payment: 'Incluido en el pago fraccionado del portal',
    timeline: '+5 días laborables',
    delivery: 'Panel de contenidos y publicaciones',
    guarantee: 'Misma garantía del portal sobre el alcance de este módulo',
    additive: true
  }
];

export const catalogEntries: CatalogEntry[] = [
  ...services.map((s) => ({
    id: s.slug,
    kind: 'service' as const,
    title: s.title,
    priceEuros: s.priceEuros,
    payment: s.payment,
    timeline: s.timeline,
    delivery: s.delivery,
    guarantee: s.guarantee
  })),
  {
    id: portalBase.id,
    kind: 'portal',
    title: portalBase.title,
    priceEuros: portalBase.priceEuros,
    payment: portalBase.payment,
    timeline: portalBase.timeline,
    delivery: portalBase.delivery,
    guarantee: portalBase.guarantee
  },
  ...portalModules.map((m) => ({
    id: m.id,
    kind: 'module' as const,
    title: m.title,
    priceEuros: m.priceEuros,
    payment: m.payment,
    timeline: m.timeline,
    delivery: m.delivery,
    guarantee: m.guarantee
  }))
];

const slugs = new Set<string>();
services.forEach((s, i) => {
  const r = serviceSchema.safeParse(s);
  if (!r.success) throw new Error(`Service ${i} inválido: ${r.error.message}`);
  if (slugs.has(s.slug)) throw new Error(`Service slug duplicado: ${s.slug}`);
  slugs.add(s.slug);
});

catalogEntries.forEach((e, i) => {
  const r = catalogEntrySchema.safeParse(e);
  if (!r.success) throw new Error(`CatalogEntry ${i} inválido: ${r.error.message}`);
});

portalModules.forEach((m, i) => {
  const r = portalModuleSchema.safeParse(m);
  if (!r.success) throw new Error(`PortalModule ${i} inválido: ${r.error.message}`);
});
