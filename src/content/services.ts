import { z } from 'zod';

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
  pricingFrom: z.string().min(1),
  timeline: z.string().min(1),
  cta: z.string().min(1),
  metrics: z.array(z.object({ label: z.string(), value: z.string() })).min(1)
});

export type Service = z.infer<typeof serviceSchema>;

export const services: Service[] = [
  {
    slug: 'produccion-sitios-web',
    title: 'Web nueva o renovación',
    short:
      'Una web clara, rápida y fácil de usar para explicar tu negocio y facilitar que te contacten.',
    description:
      'Si tu web actual se ha quedado antigua, carga mal o no explica bien lo que haces, creo una nueva o mejoro la que ya tienes. Trabajamos el mensaje, la estructura y el diseño para que tus clientes entiendan tu propuesta y sepan cómo contactar o comprar.',
    audience:
      'Profesionales que necesitan una primera web seria · Negocios locales con una web antigua · Empresas de servicios que reciben pocas consultas',
    problems: [
      'Tu web no explica bien lo que haces',
      'Carga lenta o se ve mal en el móvil',
      'Recibes pocas consultas o solicitudes',
      'Es difícil de actualizar o mantener'
    ],
    scope: [
      'Reunión inicial para entender el negocio y los objetivos',
      'Estructura de páginas y textos principales',
      'Diseño adaptado a móvil, tablet y ordenador',
      'Formulario de contacto o pagos cuando el proyecto lo necesita',
      'Publicación, revisión y guía básica de uso'
    ],
    deliverables: [
      'Una web lista para presentar tu negocio',
      'Textos y estructura más claros',
      'Guía para gestionar lo acordado'
    ],
    process: [
      'Reunión inicial y definición de alcance',
      'Estructura y contenidos',
      'Diseño y construcción con avances para validar',
      'Revisión y publicación',
      'Entrega de guía y soporte inicial'
    ],
    technologies: [
      'Stack habitual: Next.js o Astro, TypeScript estricto, Tailwind. Entrega con repositorio privado, CI en verde, informe Lighthouse y 0 violaciones axe-core.'
    ],
    exclusions: [
      'No incluye tienda online completa ni mantenimiento continuo (disponible como servicio aparte).'
    ],
    pricingFrom: 'Desde 1.500 €',
    timeline: '1–4 semanas según alcance',
    cta: '/contacto',
    metrics: [
      { label: 'Enfoque', value: 'Clientes' },
      { label: 'Entrega', value: 'Lista para usar' }
    ]
  },
  {
    slug: 'auditorias',
    title: 'Revisión y plan de mejora de tu web',
    short:
      'Descubre qué está frenando tu web y qué conviene mejorar primero, con un plan claro y ordenado.',
    description:
      'Reviso tu web para detectar problemas que pueden hacerte perder visitas, confianza o contactos. Recibes un informe claro, priorizado por impacto, para saber qué mejorar ahora, qué puede esperar y qué inversión requiere cada paso.',
    audience: 'Dueños de negocio y equipos que quieren saber qué mejorar antes de invertir más.',
    problems: [
      '¿Tu web carga lenta, recibe pocas consultas o parece difícil de usar?',
      'No sabes por dónde empezar a mejorar',
      'Has recibido propuestas técnicas difíciles de priorizar',
      'Quieres un plan claro antes de gastar en cambios'
    ],
    scope: [
      'Velocidad y experiencia en móvil',
      'Claridad de contenidos y facilidad para contactar',
      'Visibilidad básica en buscadores',
      'Accesibilidad, mantenimiento y seguridad básica'
    ],
    deliverables: [
      'Informe claro con problemas encontrados',
      'Lista de mejoras ordenada por prioridad',
      'Explicación del impacto de cada mejora',
      'Reunión de 1 hora para revisar el informe'
    ],
    process: [
      'Definimos el alcance de la revisión',
      'Analizo tu web',
      'Priorizo hallazgos por impacto',
      'Te entrego el informe',
      'Revisamos juntos en una reunión de 1 hora'
    ],
    technologies: [
      'Para equipos técnicos: análisis CWV (LCP, CLS, INP), axe-core + revisión manual teclado/lector de pantalla, SEO técnico, seguridad proporcional, priorización ICE y scripts de reproducción.'
    ],
    exclusions: [
      'No incluye implementación de las mejoras',
      'No incluye pruebas de seguridad avanzadas',
      'No incluye certificación oficial de accesibilidad'
    ],
    pricingFrom: 'Desde 650 €',
    timeline: '3–5 días',
    cta: '/contacto',
    metrics: [
      { label: 'Entrega', value: 'Informe claro' },
      { label: 'Reunión', value: '1 hora' }
    ]
  },
  {
    slug: 'consultoria-tecnologica',
    title: 'Plan digital y automatización',
    short:
      'Antes de invertir en una nueva herramienta o desarrollo, definimos qué necesitas y cuál es el camino más sensato.',
    description:
      'Te ayudo a ordenar una idea, elegir entre opciones y preparar un plan de trabajo por fases. Es útil cuando necesitas mejorar procesos, conectar herramientas, reducir tareas repetitivas o decidir si merece la pena crear una solución a medida.',
    audience: 'Negocios y equipos que necesitan ordenar su plan digital antes de invertir.',
    problems: [
      'Hay demasiadas opciones y no sabes cuál encaja',
      'Procesos manuales que consumen tiempo',
      'Herramientas desconectadas entre sí',
      'Dudas entre comprar una herramienta o construir a medida'
    ],
    scope: [
      'Reducir tareas manuales repetitivas',
      'Conectar un formulario con tu correo, CRM o agenda',
      'Ordenar información repartida en varias herramientas',
      'Decidir entre herramienta existente o desarrollo a medida'
    ],
    deliverables: [
      'Documento de diagnóstico',
      'Comparativa de opciones',
      'Plan por fases con prioridades'
    ],
    process: [
      'Conversación de descubrimiento',
      'Diagnóstico de la situación actual',
      'Comparativa de opciones',
      'Plan por fases',
      'Entrega y sesión de transferencia'
    ],
    technologies: [
      'Evaluación de arquitectura, ADRs y runbooks cuando el proyecto lo requiere. Stack de referencia: TypeScript, Node, Rust, Go, integraciones MCP/Ollama.'
    ],
    exclusions: [
      'No incluye la implementación del plan',
      'No incluye infraestructura ni alojamiento',
      'No incluye entrenamiento avanzado de modelos de IA'
    ],
    pricingFrom: 'Desde 900 €',
    timeline: '1–2 semanas',
    cta: '/contacto',
    metrics: [
      { label: 'Resultado', value: 'Plan claro' },
      { label: 'Enfoque', value: 'Por fases' }
    ]
  },
  {
    slug: 'landing-10-dias',
    title: 'Landing en 10 días',
    short: 'Landing A/B con captura de leads, lista en 10 días laborables desde brief y marca.',
    description:
      'Paquete fijo (no web a medida): landing de alto impacto con test A/B del CTA, formulario de leads, tema claro/oscuro, personalización de marca y deploy en Vercel. Base técnica: plantilla PortfolioSaaS (demo: https://landing-ab-testing.vercel.app).',
    audience:
      'Negocios locales y profesionales que necesitan una landing de conversión rápida · Campañas o lanzamientos con plazo cerrado · Quien ya tiene marca y copy básico',
    problems: [
      'Web genérica que no convierte',
      'Plazo largo de "web completa"',
      'No hay captura de leads',
      'Mensaje poco claro en móvil'
    ],
    scope: [
      'Brief + materiales de marca',
      'Estructura 1 landing + gracias',
      'A/B de CTA',
      'Formulario leads',
      'Deploy Vercel',
      'Guía breve de edición de copy'
    ],
    deliverables: [
      'Landing en producción',
      'Repo privado del cliente',
      'Guía de edición',
      'Acceso Vercel acordado'
    ],
    process: [
      'Brief y materiales de marca',
      'Configuración de marca (site.config / assets)',
      'Preview para validar',
      'Ajustes de copy y CTA',
      'Publicación en el día 10',
      'Handoff (repo, Vercel, guía de edición)'
    ],
    technologies: [
      'Next.js',
      'TypeScript',
      'Tailwind',
      'A/B CTA (plantilla PortfolioSaaS)',
      'Vercel',
      'CI en verde + Lighthouse + accesibilidad (estándar Alexendros)'
    ],
    exclusions: [
      'No ecommerce completo',
      'No SEO continuo',
      'No mantenimiento mensual',
      'No tienda ni pasarela de pago (salvo enlace a contacto/calendario)',
      'No reescritura total de marca desde cero si faltan textos/logo'
    ],
    pricingFrom: 'Desde 990 €',
    timeline: '10 días laborables desde brief + materiales de marca',
    cta: '/contacto',
    metrics: [
      { label: 'Enfoque', value: 'Conversión' },
      { label: 'Entrega', value: '10 días' },
      { label: 'Base', value: 'Plantilla A/B' }
    ]
  }
];

const slugs = new Set<string>();
services.forEach((s, i) => {
  const r = serviceSchema.safeParse(s);
  if (!r.success) throw new Error(`Service ${i} inválido: ${r.error.message}`);
  if (slugs.has(s.slug)) throw new Error(`Service slug duplicado: ${s.slug}`);
  slugs.add(s.slug);
});
