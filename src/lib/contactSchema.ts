import { z } from 'zod';
import {
  normalizeProjectSlug,
  normalizeServiceSlug,
  projectTitle,
  serviceTitle
} from '../content/contactContext';
import {
  normalizePortalModuleIds,
  serializePortalModuleIds,
  type PortalModuleId,
  portalModules
} from '../content/portalModules';

export const entityTypes = ['particular', 'empresa', 'institucion'] as const;
export const contactChannels = ['correo'] as const;
export const contactReasons = [
  'proyectoEspecial',
  'propuestaComercial',
  'informacionCliente'
] as const;

export const contactOrigins = [
  'proceso',
  'servicios',
  'home',
  'referencias',
  'proyectos',
  'home-linux',
  'home-gestion',
  'home-ia'
] as const;

/** Identificadores de vía del formulario (página única). */
export const contactViaIds = ['revisar', 'crear', 'colaborar', 'otra'] as const;
export type ContactViaId = (typeof contactViaIds)[number];

export const contactViaLabels: Record<ContactViaId, string> = {
  revisar: 'Revisar lo que ya existe',
  crear: 'Crear una web o una tienda',
  colaborar: 'Sumar un programador al equipo',
  otra: 'Otra necesidad'
};

const PORTAL_MODULE_TITLES: Record<PortalModuleId, string> = Object.fromEntries(
  portalModules.map((m) => [m.id, m.title])
) as Record<PortalModuleId, string>;

/** Nombres legibles de módulos ya normalizados (IDs o CSV). */
export function portalModuleDisplayNames(modules: string | readonly string[] | undefined): string {
  const ids = normalizePortalModuleIds(modules);
  return ids.map((id) => PORTAL_MODULE_TITLES[id] ?? id).join(', ');
}

const UNSAFE_CONTENT = /<\s*script|javascript:|on\w+\s*=|data:\s*text\/html/i;

function rejectUnsafe(value: string, ctx: z.RefinementCtx, path: string) {
  if (UNSAFE_CONTENT.test(value)) {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message: 'formato'
    });
  }
}

/** Sitio visible (no honeypot). Acepta dominio o URL http(s). */
const sitioSchema = z.preprocess(
  (v) => {
    if (typeof v !== 'string') return undefined;
    const trimmed = v.trim();
    return trimmed === '' ? undefined : trimmed;
  },
  z
    .string()
    .max(200)
    .regex(/^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i, { message: 'formato' })
    .optional()
);

function normalizeVias(v: unknown): ContactViaId[] {
  const raw = Array.isArray(v) ? v : typeof v === 'string' ? [v] : [];
  const out: ContactViaId[] = [];
  for (const item of raw) {
    if (typeof item !== 'string') continue;
    const id = item.trim() as ContactViaId;
    if ((contactViaIds as readonly string[]).includes(id) && !out.includes(id)) out.push(id);
  }
  return out;
}

export const contactSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    /** UI mínima: default particular si no llega (contexto oculto). */
    entityType: z.preprocess((v) => {
      if (typeof v === 'string' && (entityTypes as readonly string[]).includes(v)) return v;
      return 'particular';
    }, z.enum(entityTypes)),
    channel: z.enum(contactChannels),
    email: z.preprocess((v) => {
      if (typeof v !== 'string') return v;
      const trimmed = v.trim();
      return trimmed === '' ? undefined : trimmed;
    }, z.email().max(254).optional()),
    /** UI mínima: default informacionCliente; query `motivo` allowlisted si llega. */
    reason: z.preprocess((v) => {
      if (typeof v === 'string' && (contactReasons as readonly string[]).includes(v)) return v;
      return 'informacionCliente';
    }, z.enum(contactReasons)),
    /** Tope UI 600; servidor admite hasta 2000. */
    message: z.string().trim().min(10).max(2000),
    vias: z.preprocess(normalizeVias, z.array(z.enum(contactViaIds)).min(1)),
    otraDetalle: z.preprocess((v) => {
      if (typeof v !== 'string') return undefined;
      const trimmed = v.trim();
      return trimmed === '' ? undefined : trimmed;
    }, z.string().min(3).max(120).optional()),
    sitio: sitioSchema,
    modules: z.preprocess((v) => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === 'string' && v.trim() === '') return undefined;
      const ids = normalizePortalModuleIds(v);
      return ids.length > 0 ? serializePortalModuleIds(ids) : undefined;
    }, z.string().optional()),
    serviceSlug: z.preprocess((v) => normalizeServiceSlug(v), z.string().optional()),
    projectSlug: z.preprocess((v) => normalizeProjectSlug(v), z.string().optional()),
    origin: z.preprocess((v) => {
      if (typeof v !== 'string') return undefined;
      const trimmed = v.trim();
      if (!(contactOrigins as readonly string[]).includes(trimmed)) return undefined;
      return trimmed;
    }, z.enum(contactOrigins).optional()),
    consent: z.literal(true),
    honeypot: z.string().optional(),
    turnstileToken: z.string().max(4096).optional()
  })
  .superRefine((data, ctx) => {
    rejectUnsafe(data.name, ctx, 'name');
    rejectUnsafe(data.message, ctx, 'message');
    if (data.otraDetalle) rejectUnsafe(data.otraDetalle, ctx, 'otraDetalle');

    if (data.channel === 'correo' && !data.email) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'falta'
      });
    }

    if (data.vias.includes('otra') && !data.otraDetalle) {
      ctx.addIssue({
        code: 'custom',
        path: ['otraDetalle'],
        message: 'falta'
      });
    }
  });

export type ContactInput = z.infer<typeof contactSchema>;

export function parseContactBody(data: unknown) {
  return contactSchema.safeParse(data);
}

export function isHoneypotFilled(honeypot: string | undefined): boolean {
  return Boolean(honeypot && honeypot.trim().length > 0);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const reasonLabels: Record<(typeof contactReasons)[number], string> = {
  proyectoEspecial: 'Proyecto especial',
  propuestaComercial: 'Propuesta comercial',
  informacionCliente: 'Información para clientes'
};

export const entityLabels: Record<(typeof entityTypes)[number], string> = {
  particular: 'Particular',
  empresa: 'Empresa',
  institucion: 'Institución'
};

export const fieldLabels: Record<string, string> = {
  name: 'Nombre',
  entityType: 'Categoría',
  channel: 'Canal de respuesta',
  email: 'Correo electrónico',
  reason: 'Motivo',
  message: 'Mensaje',
  vias: 'Vías',
  otraDetalle: 'Otra necesidad',
  sitio: 'Sitio web',
  modules: 'Módulos',
  serviceSlug: 'Servicio',
  projectSlug: 'Trabajo',
  consent: 'Consentimiento'
};

export type FieldError = { field: string; label: string; cause: string };

/** Traduce issues de Zod a mensajes «Campo: causa» para la UI. */
export function formatContactFieldErrors(error: z.ZodError): FieldError[] {
  const seen = new Set<string>();
  const out: FieldError[] = [];
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    if (seen.has(field)) continue;
    seen.add(field);
    const label = fieldLabels[field] ?? field;
    let cause: string;
    if (field === 'consent') {
      cause = 'falta la aceptación del tratamiento';
    } else if (field === 'vias') {
      cause = 'marcar al menos una opción';
    } else if (field === 'otraDetalle') {
      cause = 'falta describir la otra necesidad';
    } else if (field === 'sitio') {
      cause = 'el sitio no parece válido';
    } else {
      const missing =
        issue.message === 'falta' || issue.code === 'invalid_type' || issue.code === 'too_small';
      cause = missing ? 'falta contenido' : 'formato no válido';
    }
    out.push({ field, label, cause });
  }
  return out;
}

export function buildContactMessage(input: ContactInput): string {
  const viaLines = input.vias.map((id) =>
    id === 'otra' && input.otraDetalle
      ? `Otra necesidad: ${input.otraDetalle}`
      : contactViaLabels[id]
  );
  const lines = [
    `Categoría: ${entityLabels[input.entityType]}`,
    'Canal preferido: Correo electrónico',
    `Motivo: ${reasonLabels[input.reason]}`,
    `Vías: ${viaLines.join('; ')}`,
    `Petición:\n${input.message}`
  ];
  if (input.email) lines.push(`Email: ${input.email}`);
  if (input.sitio) lines.push(`Sitio web: ${input.sitio}`);
  if (input.modules) {
    const names = portalModuleDisplayNames(input.modules);
    if (names) lines.push(`Módulos de portal: ${names}`);
  }
  const serviceLabel = serviceTitle(input.serviceSlug);
  if (serviceLabel) lines.push(`Servicio de referencia: ${serviceLabel}`);
  const projectLabel = projectTitle(input.projectSlug);
  if (projectLabel) lines.push(`Trabajo de referencia: ${projectLabel}`);
  if (input.origin) lines.push(`Origen de página: ${input.origin}`);
  return lines.join('\n');
}
