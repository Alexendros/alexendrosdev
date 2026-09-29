import { asNonEmptyString, type HandledCalTrigger } from './calWebhookSchema';

export const NOTION_PROP = {
  nombre: 'Nombre',
  email: 'Email',
  canal: 'Canal',
  tipo: 'Tipo',
  estado: 'Estado',
  asunto: 'Asunto',
  mensaje: 'Mensaje',
  calBookingId: 'cal_booking_id',
  stripePaymentIntent: 'stripe_payment_intent',
  fuente: 'Fuente',
  fecha: 'Fecha',
  notas: 'Notas',
  vertical: 'Vertical',
  budget: 'Presupuesto',
  referralCode: 'referral_code',
  consentMarketing: 'consent_marketing'
} as const;

export type Canal = 'Formulario' | 'Cal.com' | 'Stripe' | 'Otro';
export type Tipo =
  'Lead contacto' | 'Sesión gratuita' | 'Sesión de pago' | 'Retainer/cubierto' | 'Proyecto';
export type Estado =
  'Nuevo' | 'Contactado' | 'Agendado' | 'Pagado' | 'En curso' | 'Cerrado' | 'Descartado';

export type ExistingLead = {
  id: string;
  notes?: string;
  estado?: string;
};

export type LeadWrite = {
  nombre?: string;
  email?: string;
  canal?: Canal;
  tipo?: Tipo;
  estado?: Estado;
  asunto?: string;
  mensaje?: string;
  calBookingId?: string;
  stripePaymentIntent?: string;
  fuente?: string;
  fecha?: string;
  notas?: string;
  vertical?: string;
  budget?: string;
  referralCode?: string;
  consentMarketing?: boolean;
};

const ESTADO_RANK: Record<string, number> = {
  Nuevo: 0,
  Contactado: 1,
  Agendado: 2,
  Pagado: 3,
  'En curso': 4,
  Cerrado: 5,
  Descartado: 5
};

const RICH_TEXT_MAX = 2000;

export function clipRichText(value: string, max = RICH_TEXT_MAX): string {
  if (value.length <= max) return value;
  return value.slice(0, max);
}

export function eventSlug(payload: Record<string, unknown>): string {
  return (
    asNonEmptyString(payload.type) ||
    asNonEmptyString(payload.eventTypeSlug) ||
    ''
  ).toLowerCase();
}

export function hashedLinkPresent(payload: Record<string, unknown>): boolean {
  const value = payload.hashedLink;
  if (value == null || value === false) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

export function mapEventSlugToTipo(slug: string, hasHashedLink: boolean): Tipo {
  const s = slug.toLowerCase();
  if (s.includes('diagnostico')) return 'Sesión gratuita';
  if (s.includes('sesion-tecnica') || s.includes('sesion_tecnica')) return 'Sesión de pago';
  if (s.includes('retainer') || hasHashedLink) return 'Retainer/cubierto';
  return 'Lead contacto';
}

export function stripePaymentIntentId(payload: Record<string, unknown>): string | undefined {
  const meta = payload.metadata;
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return undefined;
  const externalId = asNonEmptyString((meta as Record<string, unknown>).externalId);
  if (externalId?.startsWith('pi_')) return externalId;
  return undefined;
}

function responseValue(payload: Record<string, unknown>, keys: string[]): string | undefined {
  const responses = payload.responses;
  if (!responses || typeof responses !== 'object' || Array.isArray(responses)) return undefined;
  const rec = responses as Record<string, unknown>;
  for (const key of keys) {
    const entry = rec[key];
    if (typeof entry === 'string') {
      const v = asNonEmptyString(entry);
      if (v) return v;
      continue;
    }
    if (entry && typeof entry === 'object' && 'value' in entry) {
      const raw = (entry as { value: unknown }).value;
      if (typeof raw === 'string') {
        const v = asNonEmptyString(raw);
        if (v) return v;
      }
    }
  }
  return undefined;
}

function firstAttendee(payload: Record<string, unknown>): { name?: string; email?: string } {
  const attendees = payload.attendees;
  if (!Array.isArray(attendees) || attendees.length === 0) return {};
  const first = attendees[0];
  if (!first || typeof first !== 'object' || Array.isArray(first)) return {};
  const rec = first as Record<string, unknown>;
  return {
    name: asNonEmptyString(rec.name),
    email: asNonEmptyString(rec.email)
  };
}

export function guestFromPayload(payload: Record<string, unknown>): {
  name: string;
  email?: string;
} {
  const attendee = firstAttendee(payload);
  const name =
    attendee.name ||
    responseValue(payload, ['name', 'nombre']) ||
    asNonEmptyString(payload.title) ||
    'Reserva Cal.com';
  const email = attendee.email || responseValue(payload, ['email']);
  return { name, email };
}

export function bookingStartIso(payload: Record<string, unknown>): string | undefined {
  return asNonEmptyString(payload.startTime);
}

export function appendLeadNote(
  existing: string | undefined,
  createdAt: string | undefined,
  trigger: string,
  detail: string
): string {
  const when = createdAt?.trim() || new Date().toISOString();
  const line = `[${when} ${trigger}] ${detail}`.trim();
  const next = existing && existing.trim() ? `${existing.trim()}\n${line}` : line;
  if (next.length <= RICH_TEXT_MAX) return next;
  let trimmed = next;
  while (trimmed.length > RICH_TEXT_MAX) {
    const idx = trimmed.indexOf('\n');
    if (idx < 0) return trimmed.slice(trimmed.length - RICH_TEXT_MAX);
    trimmed = trimmed.slice(idx + 1);
  }
  return trimmed;
}

function shouldSetAgendado(existingEstado?: string): boolean {
  if (!existingEstado) return true;
  return (ESTADO_RANK[existingEstado] ?? 0) <= ESTADO_RANK.Agendado;
}

function identityFields(payload: Record<string, unknown>, uid: string): LeadWrite {
  const guest = guestFromPayload(payload);
  const slug = eventSlug(payload);
  const title = asNonEmptyString(payload.title) || asNonEmptyString(payload.eventTitle) || slug;
  const notes =
    asNonEmptyString(payload.additionalNotes) || responseValue(payload, ['notes', 'mensaje']);
  return {
    nombre: guest.name,
    email: guest.email,
    canal: 'Cal.com',
    tipo: mapEventSlugToTipo(slug, hashedLinkPresent(payload)),
    asunto: title,
    mensaje: notes,
    calBookingId: uid,
    fuente: slug ? `cal.com/${slug}` : 'cal.com',
    fecha: bookingStartIso(payload)
  };
}

function cancellationDetail(trigger: HandledCalTrigger): string {
  return trigger === 'BOOKING_CANCELLED' ? 'cancelado' : 'rechazado';
}

/**
 * Mapea un evento Cal.com a un patch de Leads.
 * Redis no es SoT: el upsert real es Notion keyed by cal_booking_id.
 * No incluye PII en los textos de nota más allá de uids de reserva.
 */
export function mapCalEventToLeadWrite(input: {
  trigger: HandledCalTrigger;
  payload: Record<string, unknown>;
  uid: string;
  createdAt?: string;
  existing: ExistingLead | null;
}): LeadWrite {
  const { trigger, payload, uid, createdAt, existing } = input;
  const base = identityFields(payload, uid);

  switch (trigger) {
    case 'BOOKING_CREATED': {
      const write: LeadWrite = { ...base };
      if (shouldSetAgendado(existing?.estado)) write.estado = 'Agendado';
      return write;
    }
    case 'BOOKING_PAID': {
      const write: LeadWrite = {
        ...base,
        estado: 'Pagado'
      };
      const pi = stripePaymentIntentId(payload);
      if (pi) write.stripePaymentIntent = pi;
      write.notas = appendLeadNote(existing?.notes, createdAt, trigger, 'pago confirmado');
      return write;
    }
    case 'BOOKING_PAYMENT_INITIATED': {
      const write: LeadWrite = existing
        ? { notas: appendLeadNote(existing.notes, createdAt, trigger, 'pago iniciado') }
        : {
            ...base,
            estado: 'Agendado',
            notas: appendLeadNote(undefined, createdAt, trigger, 'pago iniciado')
          };
      return write;
    }
    case 'BOOKING_RESCHEDULED': {
      const rescheduleUid = asNonEmptyString(payload.rescheduleUid) || 'unknown';
      const fecha = bookingStartIso(payload);
      const note = appendLeadNote(
        existing?.notes,
        createdAt,
        trigger,
        `rescheduleUid=${rescheduleUid}`
      );
      if (existing) {
        const write: LeadWrite = { notas: note };
        if (fecha) write.fecha = fecha;
        return write;
      }
      return { ...base, estado: 'Agendado', fecha: fecha || base.fecha, notas: note };
    }
    case 'BOOKING_CANCELLED':
    case 'BOOKING_REJECTED': {
      const note = appendLeadNote(existing?.notes, createdAt, trigger, cancellationDetail(trigger));
      if (existing) return { estado: 'Descartado', notas: note };
      return { ...base, estado: 'Descartado', notas: note };
    }
  }
}
