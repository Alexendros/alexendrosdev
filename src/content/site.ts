export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Tecnologías y servicios informáticos',
  descriptionDefault:
    'Auditoría, diseño y construcción de páginas web, tiendas y herramientas para negocios. Desde Valencia y en remoto.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Referencias', href: '/#referencias' },
    { label: 'Metodología', href: '/#metodo' }
  ],
  footerNav: [
    { label: 'Identidad', href: '/identidad' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' },
    { label: 'Accesibilidad', href: '/accesibilidad' }
  ],
  footerExtraNav: [
    { label: 'Experiencia', href: '/experiencia' },
    { label: 'Contacto', href: '/#contacto' }
  ],
  social: {
    github: 'https://github.com/alexendros',
    linkedin: 'https://linkedin.com/in/alexendros',
    email: 'mailto:contratacion@alexendros.dev'
  }
} as const;
