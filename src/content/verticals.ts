import { z } from 'zod';

export const verticalSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  title: z.string().min(1),
  short: z.string().min(1),
  intro: z.string().min(1),
  painPoints: z.array(z.string()).min(3),
  solutions: z.array(z.object({ title: z.string().min(1), description: z.string().min(1) })).min(3),
  faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) })).min(3),
  relatedService: z.string().min(1),
  cta: z.string().min(1)
});

export type Vertical = z.infer<typeof verticalSchema>;

export const verticals: Vertical[] = [
  {
    slug: 'abogados',
    name: 'Abogados y despachos',
    title: 'Diseño web para abogados y despachos',
    short:
      'Webs para despachos de abogados que transmiten confianza, explican sus áreas de práctica y facilitan la primera consulta.',
    intro:
      'Quien busca abogado compara varios despachos en minutos. Si tu web no explica con claridad en qué especialidad destacas, cuánto cuesta la primera consulta y cómo contactar, el cliente potencial se va a otro sitio.',
    painPoints: [
      'La web parece genérica y no deja claro en qué áreas de práctica destacas',
      'El visitante no entiende cómo se inicia el contacto ni qué esperar',
      'No hay un formulario claro para dejar los datos del caso sin exponer detalles sensibles',
      'La web carga lenta o se ve mal en el móvil, donde llegan la mayoría de consultas'
    ],
    solutions: [
      {
        title: 'Especialidades claras',
        description:
          'Cada área de práctica con su propia página: qué cubre, cómo se trabaja y preguntas frecuentes para reducir la incertidumbre.'
      },
      {
        title: 'Contacto sin fricción',
        description:
          'Formulario reservado con consentimiento expreso, teléfono visible y opción de reservar una primera consulta por videollamada.'
      },
      {
        title: 'Confianza y cumplimiento',
        description:
          'Textos de aviso legal, privacidad y cookies en regla, sin promesas de resultado, y con la firma profesional siempre visible.'
      }
    ],
    faqs: [
      {
        question: '¿Podéis trabajar con las normas deontológicas de la abogacía?',
        answer:
          'Sí. Reformulamos cualquier mensaje que pueda leerse como promesa de resultado y mantenemos la información honesta, informativa y verificable.'
      },
      {
        question: '¿Se pueden publicar casos con nombres de clientes?',
        answer:
          'Solo con consentimiento explícito. Por defecto trabajamos con casos anonimizados (tipo de asunto, jurisdicción y resultado sin datos identificativos).'
      },
      {
        question: '¿Cuánto tarda la puesta en marcha?',
        answer:
          'Una web de despacho suele estar entre 2 y 4 semanas desde que tenemos los textos y las áreas de práctica definidas.'
      },
      {
        question: '¿Podemos reservar la primera consulta desde la web?',
        answer:
          'Sí, integro agenda con Cal.com para que el cliente reserve el hueco y reciba confirmación sin llamadas previas.'
      }
    ],
    relatedService: 'produccion-sitios-web',
    cta: '/contacto?servicio=produccion-sitios-web&vertical=abogados'
  },
  {
    slug: 'clinicas',
    name: 'Clínicas y centros de salud',
    title: 'Diseño web para clínicas y centros de salud',
    short:
      'Webs para clínicas que explican tratamientos, transmiten cercanía y facilitan pedir cita sin fricción desde el móvil.',
    intro:
      'El paciente decide en el móvil, casi siempre fuera del horario de la clínica. Una web que no deja claro los tratamientos, el equipo y cómo pedir cita pierde pacientes frente a centros con una presencia digital más clara.',
    painPoints: [
      'Los tratamientos no están explicados en un lenguaje que el paciente entienda',
      'Pedir cita exige llamar y no siempre hay quien atienda el teléfono',
      'No hay respuestas claras sobre precios, seguros o preparación previa',
      'La web no se ve bien en el móvil, que es donde se busca la clínica'
    ],
    solutions: [
      {
        title: 'Tratamientos explicados',
        description:
          'Cada tratamiento con qué resuelve, cómo se realiza, cuánto dura y qué preparación requiere, para reducir dudas antes de la cita.'
      },
      {
        title: 'Cita online',
        description:
          'Reserva integrada con Cal.com, con confirmación automática y recordatorio, sin colgar el teléfono ni llamar en horario de consulta.'
      },
      {
        title: 'Cercanía y privacidad',
        description:
          'Página de equipo con foto y especialidad, aviso legal y privacidad claros, y sin datos de salud en analíticas no consentidas.'
      }
    ],
    faqs: [
      {
        question: '¿Se pueden tratar datos de salud en el formulario?',
        answer:
          'El formulario de contacto recoge el mínimo imprescindible con consentimiento explícito; los datos clínicos se tratan en la consulta, no en la web.'
      },
      {
        question: '¿Es compatible con la agenda que ya usamos?',
        answer:
          'Trabajo con Cal.com, que sincroniza con Google Calendar y permite conectar con las principales agendas. Si ya usas un software clínico, estudiamos la integración.'
      },
      {
        question: '¿Se pueden mostrar precios?',
        answer:
          'Sí, en la forma que decidas: tarifa base, rango o "consultar". Es habitual publicar el precio de la primera visita y dejar el tratamiento a valorar en consulta.'
      },
      {
        question: '¿Cumple con el RGPD para datos sensibles?',
        answer:
          'Sí. Consentimiento granular, política de privacidad específica y ninguna etiqueta no esencial cargada sin autorización previa.'
      }
    ],
    relatedService: 'produccion-sitios-web',
    cta: '/contacto?servicio=produccion-sitios-web&vertical=clinicas'
  },
  {
    slug: 'restaurantes',
    name: 'Restaurantes y hostelería',
    title: 'Diseño web para restaurantes y hostelería',
    short:
      'Webs para restaurantes que muestran carta, horarios y reservas de forma clara y se ven perfectas en el móvil.',
    intro:
      'Un cliente decidido entre dos restaurantes no llama para preguntar. Si tu web no muestra la carta actualizada, los horarios y cómo reservar, se va a la ficha de al lado.',
    painPoints: [
      'La carta está en un PDF que no se lee bien en el móvil',
      'Horarios y días de cierre quedan desactualizados o no aparecen',
      'No está claro cómo reservar mesa o pedir para recoger',
      'Las fotos pesan demasiado y la web tarda en cargar'
    ],
    solutions: [
      {
        title: 'Carta viva',
        description:
          'Carta en HTML por secciones (entrantes, principales, postres), fácil de actualizar sin depender de nadie y legible en cualquier pantalla.'
      },
      {
        title: 'Reservas y ubicación',
        description:
          'Botón de reserva visible, mapa con la dirección, horarios por día y teléfono con un solo toque desde el móvil.'
      },
      {
        title: 'Imágenes ligeras',
        description:
          'Fotografía del local y los platos optimizada en formatos modernos para que la web cargue rápido aun con conexión justa.'
      }
    ],
    faqs: [
      {
        question: '¿Podemos actualizar la carta nosotros mismos?',
        answer:
          'Sí. Dejo la carta y los horarios editables con una guía breve; si prefieres, actualizo yo los cambios por un precio fijo.'
      },
      {
        question: '¿Sirve para pedidos para recoger o reparto?',
        answer:
          'Sí, enlazo tu sistema de reparto actual o añado un enlace de pedido directo sin duplicar comisiones.'
      },
      {
        question: '¿Se integra con Google Maps y reseñas?',
        answer:
          'La web incluye mapa y enlace a tu perfil de Google Business. Si lo necesitas, trabajo también la ficha de Google.'
      },
      {
        question: '¿Cuánto cuesta mantener la carta actualizada?',
        answer:
          'Si la editas tú, el coste es cero. Si prefieres delegarlo, ofrezco un mantenimiento mensual con cambios de carta incluidos.'
      }
    ],
    relatedService: 'produccion-sitios-web',
    cta: '/contacto?servicio=produccion-sitios-web&vertical=restaurantes'
  },
  {
    slug: 'gimnasios',
    name: 'Gimnasios y centros deportivos',
    title: 'Diseño web para gimnasios y centros deportivos',
    short:
      'Webs para gimnasios que explican cuotas, actividades y horarios, y convierten visitas en pruebas gratuitas.',
    intro:
      'Quien busca gimnasio quiere saber cuánto cuesta, qué horarios hay y cómo probarlo. Si tu web no responde a esas tres preguntas al instante, la prueba gratuita se la lleva otro centro.',
    painPoints: [
      'Las tarifas y planes no están claros o hay que preguntar por teléfono',
      'No se explica la oferta de actividades ni los horarios',
      'No hay forma sencilla de reservar una clase o sesión de prueba',
      'La web no transmite valor por encima de la competencia local'
    ],
    solutions: [
      {
        title: 'Tarifas transparentes',
        description:
          'Planes con precio, qué incluye cada uno y compromiso, para que el visitante compare sin tener que escribir.'
      },
      {
        title: 'Reserva de prueba',
        description:
          'Formulario y agenda para reservar una sesión de prueba gratis, con confirmación automática por email.'
      },
      {
        title: 'Actividades y horarios',
        description:
          'Cuadro de clases por día, sala y monitor, editable, para que el socio planifique su semana desde el móvil.'
      }
    ],
    faqs: [
      {
        question: '¿Se pueden gestionar las cuotas de socios desde la web?',
        answer:
          'La web puede enlazar a tu software de gestión actual o, si lo necesitas, integro pasarela de pago para cuotas recurrentes.'
      },
      {
        question: '¿Cómo captamos pruebas gratuitas?',
        answer:
          'Con un formulario corto y una agenda conectada, la persona reserva ella misma la sesión y llega con la decisión casi tomada.'
      },
      {
        question: '¿Se puede mostrar el cuadro de clases actualizado?',
        answer:
          'Sí, con una plantilla editable por semanas o conectado al calendario que ya uses para publicar horarios.'
      },
      {
        question: '¿Funciona también para centros de entrenamiento personal?',
        answer:
          'Sí. Adapto la estructura a entrenamiento personal, grupos reducidos, crossfit, yoga o pilates sin perder claridad.'
      }
    ],
    relatedService: 'landing-10-dias',
    cta: '/contacto?servicio=landing-10-dias&vertical=gimnasios'
  },
  {
    slug: 'inmobiliarias',
    name: 'Inmobiliarias y agentes',
    title: 'Diseño web para inmobiliarias y agentes',
    short:
      'Webs para inmobiliarias y agentes que presentan inmuebles con claridad y convierten visitas en solicitudes de información.',
    intro:
      'Un comprador descarta un inmueble en segundos si las fotos no cargan, falta la referencia o no está claro cómo preguntar. Una web ordenada por zona, tipo y precio reduce esas pérdidas.',
    painPoints: [
      'Los inmuebles se publican sin estructura clara por zona o tipo',
      'Las fotos pesan demasiado y la web tarda en cargar en el móvil',
      'No hay un formulario claro para pedir información o visitar',
      'La marca personal del agente no se distingue de la del portal'
    ],
    solutions: [
      {
        title: 'Inmuebles ordenados',
        description:
          'Listado por zona, tipo y rango de precio con ficha clara: superficies, extras, referencia y estado de obra.'
      },
      {
        title: 'Contacto directo',
        description:
          'Formulario por inmueble y agenda para visitar, con la referencia viajando en el asunto para no perder el contexto.'
      },
      {
        title: 'Fotos rápidas',
        description:
          'Galería optimizada en formatos modernos para que el inmueble se vea bien sin esperar minutos de carga.'
      }
    ],
    faqs: [
      {
        question: '¿Se integra con los portales inmobiliarios?',
        answer:
          'Puedo mostrar tu cartera propia y enlazar a los portales donde ya publicas, sin duplicar trabajo de mantenimiento.'
      },
      {
        question: '¿Cuántos inmuebles se pueden publicar?',
        answer:
          'El sistema que uso no limita el número de fichas. Cada inmueble tiene su propia página con URL compartible.'
      },
      {
        question: '¿Se puede reservar visita desde la web?',
        answer:
          'Sí, con Cal.com puedes ofrecer huecos de visita y recibir la solicitud con la referencia del inmueble incluida.'
      },
      {
        question: '¿Sirve para una sola persona o para un equipo?',
        answer:
          'Ambas. Hay estructura para agente individual con marca personal o para equipo con páginas por comercial y zona.'
      }
    ],
    relatedService: 'produccion-sitios-web',
    cta: '/contacto?servicio=produccion-sitios-web&vertical=inmobiliarias'
  }
];

const slugs = new Set<string>();
verticals.forEach((v, i) => {
  const r = verticalSchema.safeParse(v);
  if (!r.success) throw new Error(`Vertical ${i} inválida: ${r.error.message}`);
  if (slugs.has(v.slug)) throw new Error(`Vertical slug duplicado: ${v.slug}`);
  slugs.add(v.slug);
});
