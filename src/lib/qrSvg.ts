import { renderSVG } from 'uqr';

/** Colores fijos a propósito: el QR necesita contraste máximo y fondo claro
    para ser escaneable con cualquier tema del sitio (ver BookingOptions). */
const QR_OPTIONS = {
  ecc: 'M' as const,
  border: 2,
  pixelSize: 1,
  whiteColor: '#ffffff',
  blackColor: '#141a21'
};

/** SVG de QR generado en build; módulos oscuros sobre fondo claro para escanear bien. */
export function qrSvg(data: string): string {
  return renderSVG(data, QR_OPTIONS).replace(
    '<svg ',
    '<svg width="112" height="112" class="h-full w-full" shape-rendering="crispEdges" '
  );
}
