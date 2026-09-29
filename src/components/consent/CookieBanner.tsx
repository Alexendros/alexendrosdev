import { useEffect } from 'react';
import * as CookieConsent from 'vanilla-cookieconsent';
import 'vanilla-cookieconsent/dist/cookieconsent.css';
import {
  CONSENT_CATEGORIES,
  CONSENT_COOKIE,
  CONSENT_EXPIRES_DAYS,
  consentVersion,
  writeConsent,
  type ConsentCategory
} from '../../lib/tracking/consent';

type CookieValue = { categories?: string[] };

function toCategories(cookie: CookieValue | undefined): ConsentCategory[] {
  const raw = Array.isArray(cookie?.categories) ? cookie.categories : [];
  return raw.filter((item): item is ConsentCategory =>
    (CONSENT_CATEGORIES as readonly string[]).includes(item)
  );
}

export default function CookieBanner() {
  useEffect(() => {
    CookieConsent.run({
      revision: consentVersion(),
      cookie: {
        name: CONSENT_COOKIE,
        expiresAfterDays: CONSENT_EXPIRES_DAYS,
        sameSite: 'Lax',
        path: '/'
      },
      guiOptions: {
        consentModal: {
          layout: 'box inline',
          position: 'bottom center',
          equalWeightButtons: true,
          flipButtons: false
        },
        preferencesModal: {
          layout: 'box',
          equalWeightButtons: true,
          flipButtons: false
        }
      },
      onFirstConsent: ({ cookie }) => {
        writeConsent(toCategories(cookie));
      },
      onChange: ({ cookie }) => {
        writeConsent(toCategories(cookie));
      },
      categories: {
        necessary: { enabled: true, readOnly: true },
        preferences: {},
        analytics: {},
        marketing: {}
      },
      language: {
        default: 'es',
        translations: {
          es: {
            consentModal: {
              title: 'Valoramos tu privacidad',
              description:
                'Usamos cookies propias y de terceros para analizar el tráfico y mejorar nuestros servicios. Las cookies analíticas y de marketing solo se activan si nos das tu consentimiento. Puedes aceptar, rechazar o configurar tus preferencias.',
              acceptAllBtn: 'Aceptar todo',
              acceptNecessaryBtn: 'Rechazar todo',
              showPreferencesBtn: 'Configurar'
            },
            preferencesModal: {
              title: 'Preferencias de cookies',
              acceptAllBtn: 'Aceptar todo',
              acceptNecessaryBtn: 'Rechazar todo',
              savePreferencesBtn: 'Guardar preferencias',
              closeIconLabel: 'Cerrar',
              sections: [
                {
                  title: 'Cookies técnicas',
                  description:
                    'Imprescindibles para el funcionamiento del sitio y para recordar tu decisión. No requieren consentimiento.',
                  linkedCategory: 'necessary'
                },
                {
                  title: 'Preferencias',
                  description: 'Recuerdan tus ajustes para personalizar tu experiencia.',
                  linkedCategory: 'preferences'
                },
                {
                  title: 'Analítica',
                  description: 'Nos permiten medir el uso del sitio de forma agregada y anónima.',
                  linkedCategory: 'analytics'
                },
                {
                  title: 'Marketing',
                  description: 'Se usan para medir y personalizar campañas publicitarias.',
                  linkedCategory: 'marketing'
                }
              ]
            }
          }
        }
      }
    });
  }, []);

  return null;
}
