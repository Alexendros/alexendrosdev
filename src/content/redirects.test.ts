import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

type Redirect = { source: string; destination: string; permanent?: boolean; has?: unknown[] };

describe('redirecciones permanentes', () => {
  const raw = JSON.parse(readFileSync(resolve(process.cwd(), 'vercel.json'), 'utf8')) as {
    redirects: Redirect[];
  };
  const unconditional = raw.redirects.filter((r) => !r.has);
  const bySource = new Map(unconditional.map((r) => [r.source, r]));

  it('R08: índices y rutas retiradas saltan al ancla o ficha en un salto', () => {
    const expected: Array<[string, string]> = [
      ['/metodologia', '/#metodo'],
      ['/metodologia/', '/#metodo'],
      ['/valores', '/#metodo'],
      ['/valores/', '/#metodo'],
      ['/como-trabajo', '/#metodo'],
      ['/como-trabajo/', '/#metodo'],
      ['/proceso-y-entrega', '/#metodo'],
      ['/proceso-y-entrega/', '/#metodo'],
      ['/metodo', '/#metodo'],
      ['/metodo/', '/#metodo'],
      ['/proyectos', '/#referencias'],
      ['/proyectos/', '/#referencias'],
      ['/proyectos/:path*', '/referencias/:path*'],
      ['/referencias', '/#referencias'],
      ['/referencias/', '/#referencias'],
      ['/servicios', '/#servicios'],
      ['/servicios/', '/#servicios'],
      ['/contacto', '/#contacto'],
      ['/contacto/', '/#contacto'],
      ['/sobre-mi', '/experiencia'],
      ['/sobre-mi/', '/experiencia'],
      ['/design-system', 'https://designsystem.alexendros.dev/'],
      ['/design-system/', 'https://designsystem.alexendros.dev/'],
      ['/aviso-legal', '/identidad'],
      ['/afiliados', '/'],
      ['/servicios/produccion-sitios-web', '/#servicios'],
      ['/servicios/auditorias', '/servicios/informe-comercial'],
      ['/servicios/consultoria-tecnologica', '/#servicios'],
      ['/servicios/landing-10-dias', '/#servicios'],
      ['/servicios/sesion-profesional', '/#servicios'],
      ['/servicios/sesion-profesional/', '/#servicios'],
      ['/servicios/auditoria-normativa-ciberseguridad', '/servicios/cumplimiento-normativo'],
      ['/servicios/auditoria-normativa-ciberseguridad/', '/servicios/cumplimiento-normativo'],
      ['/servicios/web-para', '/#servicios'],
      ['/servicios/web-para/:path*', '/#servicios']
    ];

    for (const [source, destination] of expected) {
      const rule = bySource.get(source);
      expect(rule, source).toBeDefined();
      expect(rule?.destination).toBe(destination);
      expect(rule?.permanent).toBe(true);
    }
  });

  it('cada redirección es permanente (301/308 en Vercel) y el destino no redirige otra vez', () => {
    const sources = new Set(unconditional.map((r) => r.source));
    for (const rule of unconditional) {
      expect(rule.permanent, rule.source).toBe(true);
      // Destinos con ancla o externos no entran en el mapa de sources.
      const destPath = rule.destination.split('#')[0] ?? rule.destination;
      if (destPath.startsWith('http')) continue;
      if (destPath.includes(':path*')) continue;
      expect(
        sources.has(destPath) || sources.has(`${destPath}/`),
        `${rule.source} → ${rule.destination} no debe ser otro source (un salto)`
      ).toBe(false);
    }
  });

  it('nota: si Vercel recorta el # en Location, documentar en el PR; no inventar cadena', () => {
    const withHash = unconditional.filter((r) => r.destination.includes('#'));
    expect(withHash.length).toBeGreaterThan(0);
  });

  it('las páginas retiradas ya no existen; experiencia y fichas sí', () => {
    expect(existsSync(resolve(process.cwd(), 'src/pages/metodologia.astro'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/pages/valores.astro'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/pages/proceso-y-entrega.astro'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/pages/proyectos'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/pages/experiencia.astro'))).toBe(true);
    expect(existsSync(resolve(process.cwd(), 'src/pages/referencias/index.astro'))).toBe(true);
  });
});
