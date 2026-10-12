import { z } from 'zod';

export const contactSchema = z.object({
  messages: z.object({
    success: z.string().min(1),
    error: z.string().min(1)
  })
});

export const contact = contactSchema.parse({
  messages: {
    success:
      'Mensaje enviado. Te responderé en menos de 24 horas laborables por el canal que hayas elegido.',
    error: 'No se pudo enviar. Escríbeme a contratacion@alexendros.dev'
  }
});
