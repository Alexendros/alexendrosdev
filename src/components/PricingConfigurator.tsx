import { useMemo, useState } from 'react';
import { formatEuro, portalBasePrice, sumPortal } from '../content/pricing';
import { portalModules } from '../content/services';

export default function PricingConfigurator() {
  const [selected, setSelected] = useState<string[]>([]);

  const total = useMemo(() => sumPortal(selected), [selected]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const query = selected.length
    ? `?motivo=propuestaComercial&modulos=${encodeURIComponent(selected.join(','))}`
    : '?motivo=propuestaComercial';

  return (
    <div data-pricing-configurator className="rounded-lg border border-border bg-card p-6 md:p-8">
      <h3 className="text-xl font-bold">Configurador de portal</h3>
      <p className="mt-2 text-sm text-muted">
        Parte del portal de inicio y añade módulos. Los precios son provisionales y están en el HTML
        sin JavaScript.
      </p>

      <ul className="mt-6 space-y-3" data-pricing-list>
        <li className="flex items-start justify-between gap-4 text-sm">
          <span>
            <strong>Portal de inicio</strong>
            <span className="block text-muted">Base incluida siempre</span>
          </span>
          <span className="shrink-0 font-medium">{formatEuro(portalBasePrice)}</span>
        </li>
        {portalModules.map((mod) => (
          <li key={mod.id} className="flex items-start justify-between gap-4 text-sm">
            <label className="flex items-start gap-3 cursor-pointer" htmlFor={`mod-${mod.id}`}>
              <input
                id={`mod-${mod.id}`}
                type="checkbox"
                value={mod.id}
                data-module={mod.id}
                checked={selected.includes(mod.id)}
                onChange={() => toggle(mod.id)}
                className="mt-1"
              />
              <span>
                <strong>{mod.title}</strong>
                <span className="block text-muted">{mod.short}</span>
                <span className="block text-muted">{mod.timeline}</span>
              </span>
            </label>
            <span className="shrink-0 font-medium">+{formatEuro(mod.priceEuros)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
        <p className="text-sm">
          Total provisional:{' '}
          <strong data-pricing-total className="text-lg">
            {formatEuro(total)}
          </strong>
        </p>
        <a
          href={`/contacto${query}`}
          className="btn focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-ink transition-colors hover:bg-primaryHover"
        >
          Contactar
        </a>
      </div>
    </div>
  );
}
