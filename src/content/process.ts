export type ProcessStep = {
  id: string;
  title: string;
  description: string;
  receive: string;
};

/** Pasos alineados al mock v4 (copia aprobada). */
export const processPage = {
  seo: {
    title: 'Metodología clara — Alexendros',
    description:
      'Metodología clara. Desde la idea hasta el producto entregado. Método de trabajo para sitios web y productos digitales.',
    ogTitle: 'Metodología clara'
  },
  hero: {
    h1Lead: 'Cómo se trabaja, paso a paso.',
    h1Accent: ''
  },
  eyebrow: '// 03',
  title: 'Cómo se trabaja, paso a paso',
  steps: [
    {
      id: 'propuesta',
      title: 'Propuesta',
      description: 'Llega en un día laborable con alcance, plazo y condiciones.',
      receive: 'Propuesta por escrito.'
    },
    {
      id: 'acuerdo',
      title: 'Acuerdo',
      description: 'Se confirma por escrito y se fija el calendario de revisiones.',
      receive: 'Acuerdo y calendario.'
    },
    {
      id: 'desarrollo',
      title: 'Desarrollo',
      description: 'Se avanza con dos o tres momentos de revisión, sin sorpresas.',
      receive: 'Versiones para revisar.'
    },
    {
      id: 'entrega',
      title: 'Entrega',
      description: 'Se publica, se documenta y se explica cómo mantenerlo.',
      receive: 'Producto documentado.'
    }
  ] satisfies ProcessStep[],
  close: {
    heading: 'Solicitar propuesta',
    body: 'La respuesta llega en un día laborable.',
    href: '/#contacto'
  }
} as const;
