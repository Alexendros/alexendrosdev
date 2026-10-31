/** Textos de la página única (mock v4). Si un módulo de datos tiene copia más nueva, manda ese módulo. */

export const homeHero = {
  prompt: '~/alexendros $',
  command: 'nuevo-encargo',
  title: 'Auditoría, diseño y construcción de páginas web, tiendas y herramientas para negocios.',
  lead: 'Desde Valencia y en remoto. Cada encargo empieza con alcance, plazo y condiciones por escrito.',
  primaryCta: { label: 'Solicitar propuesta', href: '#contacto' },
  secondaryCta: { label: 'Ver servicios', href: '#servicios' },
  browserUrl: 'alexendros.dev/propuesta',
  checklist: [
    {
      title: 'Alcance',
      detail: 'Por escrito antes de empezar',
      status: 'Acordado'
    },
    {
      title: 'Plazo',
      detail: 'Calendario con revisiones',
      status: 'Acordado'
    },
    {
      title: 'Condiciones',
      detail: 'Sin letra pequeña',
      status: 'Acordado'
    }
  ],
  responseLabel: 'Respuesta a la solicitud',
  responseValue: '1 día laborable'
} as const;

export const homeStats = [
  {
    title: 'Antes de empezar',
    value: 'Por escrito',
    desc: 'Alcance, plazo y condiciones'
  },
  {
    title: 'Propuesta',
    value: '1 día',
    desc: 'Laborable desde la solicitud'
  },
  {
    title: 'Durante el desarrollo',
    value: '2–3 revisiones',
    desc: 'Acordadas en el calendario'
  },
  {
    title: 'Al entregar',
    value: 'Documentado',
    desc: 'Con guía de mantenimiento'
  }
] as const;

export const homeVias = [
  {
    id: 'revisar',
    badge: 'Revisión',
    title: 'Revisar lo que ya existe',
    short:
      'Informe claro sobre la web actual, con hallazgos ordenados por impacto y plan de mejoras.',
    tags: ['Posicionamiento en buscadores', 'Cumplimiento normativo', 'Ciberseguridad'],
    delivery: 'Entrega: informe por escrito',
    formLabel: 'Revisar lo que ya existe',
    formHint: 'Informe sobre la web actual'
  },
  {
    id: 'crear',
    badge: 'Construcción',
    title: 'Crear una web o una tienda',
    short:
      'Páginas profesionales y tiendas con catálogo y pagos, diseñadas para entenderse a la primera.',
    tags: ['Sitio web', 'Catálogo y pagos', 'Mensajería', 'Panel de contenidos'],
    delivery: 'Entrega: sitio publicado y documentado',
    formLabel: 'Crear una web o una tienda',
    formHint: 'Sitio nuevo, con catálogo y pagos si hace falta'
  },
  {
    id: 'colaborar',
    badge: 'Colaboración',
    title: 'Sumar un programador al equipo',
    short: 'Trabajo por fases en herramientas internas, automatismos o integraciones ya en marcha.',
    tags: ['Diseño y desarrollo', 'Por fases', 'Integración en equipos'],
    delivery: 'Entrega: código y documentación',
    formLabel: 'Sumar un programador al equipo',
    formHint: 'Colaboración por fases'
  }
] as const;

export const homeServiciosIntro = {
  eyebrow: '// 01',
  title: 'Tres maneras de empezar un encargo',
  lead: 'La situación actual decide por dónde empezar. Plazos y condiciones se fijan por escrito en la propuesta.'
} as const;

export const homeReferenciasIntro = {
  eyebrow: '// 02',
  title: 'Proyectos realizados',
  filters: [
    { id: 'all', label: 'Todos' },
    { id: 'encargo', label: 'Encargos' },
    { id: 'propio', label: 'Proyectos propios' }
  ]
} as const;

export const homeFaq = [
  {
    q: '¿Cuándo llega la propuesta?',
    a: 'En un día laborable desde la solicitud, con alcance, plazo y condiciones por escrito.'
  },
  {
    q: '¿Hace falta tener ya una web para empezar?',
    a: 'No. Para una web nueva bastan una idea y algunas referencias; para una revisión, el sitio actual.'
  },
  {
    q: '¿Qué ocurre tras enviar la solicitud?',
    a: 'Llega una confirmación por correo y, en un día laborable, la propuesta con alcance, plazo y condiciones.'
  },
  {
    q: '¿Qué pasa si el alcance cambia a mitad del proyecto?',
    a: 'Cualquier cambio se acuerda por escrito antes de continuar, para que plazo y condiciones sigan siendo claros.'
  },
  {
    q: '¿Qué incluye la entrega?',
    a: 'El trabajo publicado, su documentación y una explicación de cómo mantenerlo.'
  }
] as const;

export const homeContactoIntro = {
  eyebrow: '// 04',
  title: 'Contacto',
  lead: 'Marcar por dónde empezar y contar qué necesita el proyecto. La respuesta llega en un día laborable.',
  badges: ['Valencia', 'Remoto', 'Respuesta en 1 día laborable']
} as const;

export const homeExperienciaTeaser = {
  title: 'Experiencia',
  body: 'Trayectoria, modalidad de colaboración y CV en una página aparte.',
  href: '/experiencia',
  cta: 'Ver experiencia'
} as const;
