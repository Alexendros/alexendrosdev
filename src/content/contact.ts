import { z } from 'zod';
import { calEventUrl } from '../lib/calBooking';

export const bookingEventSchema = z
  .object({
    id: z.enum(['diagnostico', 'sesion-tecnica']),
    calLink: z.string().regex(/^alexendros\/[a-z0-9-]+$/),
    url: z.string().url(),
    title: z.string().min(1),
    priceLabel: z.string().min(1),
    summary: z.string().min(1),
    cta: z.string().min(1),
    qrLabel: z.string().min(1)
  })
  .refine((event) => event.url === calEventUrl(event.calLink), {
    message: 'url debe ser https://cal.com/{calLink}'
  });

export const contactChannelSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  href: z.string().min(1),
  priority: z.number().int(),
  external: z.boolean().optional()
});

export const contactSchema = z.object({
  channels: z.array(contactChannelSchema).min(1),
  subjects: z.array(z.string().min(1)).min(1),
  messages: z.object({
    success: z.string().min(1),
    error: z.string().min(1)
  }),
  bookings: z.object({
    heading: z.string().min(1),
    intro: z.string().min(1),
    scanLabel: z.string().min(1),
    events: z.array(bookingEventSchema).length(2)
  })
});

export const contact = contactSchema.parse({
  channels: [
    { id: 'form', label: 'Enviar mensaje', href: '#escribir', priority: 1 },
    { id: 'cal', label: 'Reservar una sesión', href: '#reservar', priority: 2 },
    {
      id: 'email',
      label: 'hola@alexendros.dev',
      href: 'mailto:hola@alexendros.dev',
      priority: 3,
      external: true
    }
  ],
  subjects: [
    'Web nueva o renovación',
    'Revisión y plan de mejora',
    'Plan digital y automatización',
    'Landing en 10 días',
    'Consulta general',
    'Otro'
  ],
  messages: {
    success:
      'Mensaje enviado. Te responderé en menos de 24 horas laborables. Si prefieres, también puedes agendar una sesión.',
    error: 'No se pudo enviar. Escríbeme directamente a hola@alexendros.dev'
  },
  bookings: {
    heading: 'Reserva una sesión',
    intro:
      'Dos opciones con horario en Cal.com. El pago (75 € o 150 €) se confirma al reservar. Si todavía no encaja, el formulario de abajo sigue disponible.',
    scanLabel: 'Escanea para reservar',
    events: [
      {
        id: 'diagnostico',
        calLink: 'alexendros/diagnostico',
        url: calEventUrl('alexendros/diagnostico'),
        title: 'Diagnóstico',
        priceLabel: '75 €',
        summary:
          'Una sesión de diagnóstico técnico para entender tu situación y salir con siguientes pasos claros.',
        cta: 'Reservar diagnóstico',
        qrLabel: 'Código QR para reservar Diagnóstico (75 €) en Cal.com'
      },
      {
        id: 'sesion-tecnica',
        calLink: 'alexendros/sesion-tecnica',
        url: calEventUrl('alexendros/sesion-tecnica'),
        title: 'Sesión técnica',
        priceLabel: '150 €',
        summary:
          'Una sesión de trabajo para desbloquear un problema concreto o decidir el siguiente paso técnico.',
        cta: 'Reservar sesión técnica',
        qrLabel: 'Código QR para reservar Sesión técnica (150 €) en Cal.com'
      }
    ]
  }
});

export const publicBookingEvents = contact.bookings.events;
