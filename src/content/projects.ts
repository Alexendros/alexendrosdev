import type { ImageMetadata } from 'astro';
import { z } from 'zod';
import coverFront from '../assets/projects/front-valencia.webp';
import coverNasve from '../assets/projects/graficas-nasve.webp';
import coverVcf from '../assets/projects/vcf-cribador.webp';
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
  results: z.array(z.string()).min(1),
  links: z.object({
    prod: z.string().url().optional(),
    github: z.string().url().optional()
  }),
  published: z.string().min(1),
  featured: z.boolean(),
  coverAlt: z.string().min(1)
});

export type Project = z.infer<typeof projectSchema> & { cover: ImageMetadata };

export const projects: Project[] = [
  {
    slug: 'front-valencia',
    title: 'Front Valencia — Restaurante',
    short:
      'Web para un negocio local que necesitaba explicar sus servicios y recibir solicitudes de presupuesto.',
    summary:
      'Renovamos la web de un restaurante para que los clientes entiendan la oferta, consulten el menú y pidan reserva con menos fricción.',
    role: 'Diseño, desarrollo y publicación',
    context:
      'La web anterior era lenta, difícil de actualizar y no facilitaba las reservas. Editar el menú llevaba demasiado tiempo.',
    challenge:
      'Publicar una web clara sin interrumpir el negocio, conservar la visibilidad en buscadores y dejar al equipo un editor sencillo.',
    solution:
      'Nueva web con menú actualizable, textos más claros y un flujo de reservas más directo. Entregamos guía de uso y comprobamos velocidad y usabilidad antes de publicar.',
    responsibilities: [
      'Definición de estructura y mensajes',
      'Diseño y desarrollo completo',
      'Editor para actualizar el menú',
      'Revisión de usabilidad',
      'Publicación y documentación'
    ],
    technologies: [
      'Detalles técnicos: Astro + Payload CMS, TypeScript, Tailwind. Objetivo Lighthouse ≥90. Publicación en Vercel + VPS.'
    ],
    highlights: [
      'Publicación sin cortar el servicio',
      'Editor visual para el equipo',
      'Usable con teclado',
      'Velocidad medida antes de entregar'
    ],
    results: ['Carga mucho más rápida', 'Más reservas desde la web', 'Menú editable en minutos'],
    links: { prod: 'https://frontvalencia.com/' },
    published: '2024-03-15',
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
      'Detalles técnicos: Next.js, TypeScript, PostgreSQL, Prisma, Stripe (webhooks idempotentes), Zod.'
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
    slug: 'vcf-cribador',
    title: 'VCF Cribador — Herramienta de contactos',
    short: 'Herramienta interna para automatizar un proceso manual y reducir errores.',
    summary:
      'Una utilidad para limpiar y unificar listados de contactos exportados desde distintas agendas, evitando trabajo repetitivo y fallos al migrar.',
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
      'Detalles técnicos: CLI en Rust (clap, phonenumber, serde). Binario estático ~3MB. FOSS MIT.'
    ],
    highlights: [
      'Instalación sencilla',
      'Tolera formatos imperfectos',
      'Deduplicación configurable',
      'Código abierto'
    ],
    results: ['Menos errores al migrar', 'Miles de contactos procesados', 'Uso recurrente'],
    links: { github: 'https://github.com/Iniciativas-Alexendros/zedazo' },
    published: '2024-01-10',
    featured: false,
    cover: coverVcf,
    coverAlt:
      'Interfaz de VCF Cribador, herramienta de código abierto para limpiar y unificar listados de contactos.'
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
    technologies: [
      'Detalles técnicos: Next.js, TypeScript, Tailwind, MDX, Zod. Objetivo 98/100/100/100 Lighthouse móvil; 0 violaciones axe-core.'
    ],
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
