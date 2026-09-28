export const CAL_ORIGIN = 'https://cal.com' as const;
export const CAL_EMBED_SCRIPT = 'https://app.cal.com/embed/embed.js' as const;
/** Color de marca del embed de Cal.com (tercero): valor fijo requerido por su theming. */
export const CAL_BRAND = '#FFC53D' as const;

export const PUBLIC_CAL_LINKS = ['alexendros/diagnostico', 'alexendros/sesion-tecnica'] as const;

export type PublicCalLink = (typeof PUBLIC_CAL_LINKS)[number];

export function calEventUrl(calLink: string): string {
  return `${CAL_ORIGIN}/${calLink.replace(/^\/+/, '')}`;
}
