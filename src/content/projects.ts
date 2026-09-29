import type { ImageMetadata } from 'astro';
import { z } from 'zod';
import coverFront from '../assets/projects/front-valencia.webp';
import coverNasve from '../assets/projects/graficas-nasve.webp';
import coverZedazo from '../assets/projects/zedazo.webp';
import coverMe from '../assets/projects/alexendros-me.webp';

export const projectSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  summary: z.string().min(1),
  role: z.string().min(1),
  context: z.string().min(1),
  challenge: z.string().min(1),
  solution: z.string().min(1),
  responsibilities: z.array(z.string()).min(1),
  technologies: z.array(z.string()).min(1),
  highlights: z.array(z.string()).min(1),
  results: z.array(z.string()).min(1).optional(),
  links: z.object({
    prod: z.string().url().optional(),
    github: z.string().url().optional()
  }),
  published: z.string().min(1),
  featured: z.boolean(),
  coverAlt: z.string().min(1),
  testimonial: z
    .object({
      quote: z.string().min(1),
      author: z.string().min(1),
      role: z.string().optional()
    })
    .optional(),
  metrics: z.array(z.object({ label: z.string().min(1), value: z.string().min(1) })).optional()
});

export type Project = z.infer<typeof projectSchema> & { cover: ImageMetadata };

export const projects: Project[] = [
  {
    slug: 'front-valencia',
    title: 'Front Valencia — Restaurante',
    short:
      'Web para un restaurante en La Marina de Valencia: carta digital bilingüe con alérgenos y reservas directas, editable por el equipo sin tocar código.',
    summary:
      'Diseñamos y publicamos la web del restaurante: carta bilingüe con alérgenos y etiquetas dietéticas, espacios y eventos, y reservas con CoverManager, todo editable desde un panel propio.',
    role: 'Diseño, desarrollo y publicación',
    context:
      'El restaurante necesitaba una presencia clara en La Marina de Valencia y una carta que pudiera actualizar su propio equipo cuando cambiaran precios o platos.',
    challenge:
      'Publicar una web bilingüe (ES/EN) con carta, espacios y reservas, mantenerla rápida y dejar al equipo un editor sencillo para la carta y los eventos.',
    solution:
      'Web con carta digital bilingüe (alérgenos, etiquetas dietéticas y precios), páginas de espacios y eventos, y reservas integradas con CoverManager. El equipo edita todo desde un panel propio, sin tocar código.',
    responsibilities: [
      'Definición de estructura y contenidos',
      'Diseño y desarrollo web',
      'Carta digital bilingüe con alérgenos',
      'Integración de reservas (CoverManager)',
      'Panel de edición para el equipo',
      'Publicación y documentación'
    ],
    technologies: [
      'Astro + React',
      'Tailwind CSS',
      'Payload CMS 3 + PostgreSQL',
      'pnpm + Turborepo',
      'TypeScript estricto',
      'Vercel (web) + Railway (CMS)'
    ],
    highlights: [
      'Carta bilingüe con alérgenos',
      'Reservas integradas con CoverManager',
      'El equipo edita sin tocar código',
      'Web rápida y accesible'
    ],
    links: {
      prod: 'https://website-frontvalencia.vercel.app/',
      github: 'https://github.com/Soluciones-Alexendros/website-frontvalencia'
    },
    published: '2025-07-13',
    featured: true,
    cover: coverFront,
    coverAlt:
      'Home de la web del restaurante Front Valencia: cabecera con foto del local, menú destacado y botón de reserva.'
  },
  {
    slug: 'graficas-nasve',
    title: 'Gráficas Nasve — Tienda online',
    short:
      'Tienda online para un taller familiar que quería vender sus productos sin depender de terceros.',
    summary:
      'Pasamos de presupuestos por email y teléfono a un catálogo online con precios claros y pago seguro, reduciendo el tiempo de venta de días a minutos.',
    role: 'Diseño del proceso de venta y desarrollo',
    context:
      'Las ventas dependían de llamadas y correos. Los presupuestos tardaban y se perdían pedidos.',
    challenge:
      'Calcular precios con muchas combinaciones, validar archivos del cliente y cobrar online de forma fiable.',
    solution:
      'Catálogo con precios en tiempo real, validación de archivos y pago online. Paneles claros para seguir pedidos.',
    responsibilities: [
      'Diseño del flujo de compra',
      'Motor de precios',
      'Catálogo usable',
      'Pagos online',
      'Paneles de pedidos',
      'Pruebas antes de publicar'
    ],
    technologies: [
      'Next.js',
      'TypeScript',
      'PostgreSQL + Prisma',
      'Stripe (webhooks idempotentes)',
      'Zod'
    ],
    highlights: [
      'Precios calculados al momento',
      'Validación de archivos del cliente',
      'Pagos preparados para evitar cobros duplicados',
      'Sin depender de un CMS externo'
    ],
    results: ['Presupuesto en minutos', 'Pedidos sin gestión manual', 'Menos tiempo de gestión'],
    links: {
      prod: 'https://ecommerce-graficasnasve.vercel.app/',
      github: 'https://github.com/Soluciones-Alexendros/ecommerce-graficasnasve'
    },
    published: '2023-11-20',
    featured: true,
    cover: coverNasve,
    coverAlt:
      'Tienda online de Gráficas Nasve: catálogo de productos con precios calculados al momento y pago online.'
  },
  {
    slug: 'zedazo',
    title: 'Zedazo — Herramienta de contactos',
    short:
      'Herramienta de código abierto para limpiar y unificar listados de contactos sin trabajo manual.',
    summary:
      'Una utilidad libre para limpiar y unificar listados de contactos exportados desde distintas agendas, evitando trabajo repetitivo y fallos al migrar.',
    role: 'Diseño y desarrollo de la herramienta',
    context:
      'Migrar contactos entre Google, iCloud y Outlook generaba duplicados, formatos rotos y mucho trabajo manual.',
    challenge:
      'Leer distintos formatos de agenda, unificar teléfonos y exportar listados limpios sin instalar software pesado.',
    solution:
      'Una herramienta ligera que limpia, deduplica y exporta contactos en formatos útiles, con documentación clara.',
    responsibilities: [
      'Diseño de la herramienta',
      'Limpieza y unificación de contactos',
      'Exportación a formatos útiles',
      'Pruebas y documentación'
    ],
    technologies: [
      'CLI en Rust (clap, phonenumber, serde)',
      'Binario estático ~3 MB',
      'Open source bajo licencia MIT'
    ],
    highlights: [
      'Instalación sencilla',
      'Tolera formatos imperfectos',
      'Deduplicación configurable',
      'Código abierto'
    ],
    results: ['Menos errores al migrar', 'Miles de contactos procesados', 'Uso recurrente'],
    links: { github: 'https://github.com/Soluciones-Alexendros/zedazo' },
    published: '2024-01-10',
    featured: false,
    cover: coverZedazo,
    coverAlt:
      'Interfaz de Zedazo, herramienta de código abierto para limpiar y unificar listados de contactos.'
  },
  {
    slug: 'alexendros-me',
    title: 'Alexendros.me — Web personal',
    short:
      'Web personal rápida y clara, centrada en explicar los servicios sin distraer a quien la visita.',
    summary:
      'Espacio propio para explicar servicios y publicar textos largos, con lectura cómoda, privacidad respetada y sin elementos que distraigan.',
    role: 'Diseño, contenido y desarrollo',
    context:
      'Necesitaba un sitio propio para ensayos y documentación sin las limitaciones de plataformas genéricas.',
    challenge:
      'Priorizar la lectura, el teclado y la privacidad, manteniendo la web ligera y fácil de mantener.',
    solution:
      'Web centrada en el contenido, tipografía legible, sin trackers de publicidad y con un flujo editorial sencillo.',
    responsibilities: [
      'Arquitectura del sitio',
      'Sistema visual',
      'Contenidos',
      'Privacidad',
      'Publicación'
    ],
    technologies: ['Next.js', 'TypeScript', 'Tailwind', 'MDX', 'Zod'],
    highlights: [
      'Lectura cómoda',
      'Buen contraste',
      'Sin trackers de publicidad',
      'Contenido en Git'
    ],
    results: ['Carga rápida', 'Lectura clara', 'Privacidad respetada'],
    links: {
      prod: 'https://alexendros.me',
      github: 'https://github.com/Iniciativas-Alexendros/website-alexendrosme'
    },
    published: '2024-01-15',
    featured: true,
    cover: coverMe,
    coverAlt:
      'Home de Alexendros.me, web personal centrada en lectura cómoda, buen contraste y privacidad.'
  }
];

const projectSlugs = new Set<string>();
projects.forEach((p, i) => {
  const { cover: _c, ...data } = p;
  const r = projectSchema.safeParse(data);
  if (!r.success) throw new Error(`Project ${i} inválido: ${r.error.message}`);
  if (projectSlugs.has(p.slug)) throw new Error(`Project slug duplicado: ${p.slug}`);
  projectSlugs.add(p.slug);
});

export function getFeaturedProjects() {
  return projects.filter((p) => p.featured);
}
