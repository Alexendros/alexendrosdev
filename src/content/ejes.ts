import { z } from 'zod';

export const ejeSchema = z.object({
  index: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1)
});

export type Eje = z.infer<typeof ejeSchema>;

// Tres ejes que sostienen cada entrega. Textos derivados de profile.ts
// (summary, qualityTechnical) y de los highlights de proyectos: sin
// afirmaciones nuevas, solo reorganización del contenido existente.
export const ejes: Eje[] = [
  {
    index: '01',
    title: 'Claridad',
    description: 'Webs que explican bien lo que vendes y no te dan problemas.'
  },
  {
    index: '02',
    title: 'Velocidad',
    description: 'Carga rápida medida antes de entregar, con objetivo Lighthouse ≥90.'
  },
  {
    index: '03',
    title: 'Accesibilidad y privacidad',
    description:
      'Usable con teclado, sin violaciones de accesibilidad y sin trackers de publicidad.'
  }
];

ejes.forEach((e, i) => {
  const r = ejeSchema.safeParse(e);
  if (!r.success) throw new Error(`Eje ${i} inválido: ${r.error.message}`);
});
