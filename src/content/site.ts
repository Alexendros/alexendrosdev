export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Servicios digitales medibles para negocios',
  descriptionDefault:
    'Diseño y publicación de webs y portales para profesionales y negocios, con precio cerrado, plazos concretos y garantía. Informe, sesión o portal de inicio.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Servicios', href: '/servicios' },
    { label: 'Publicaciones', href: '/proyectos' },
    { label: 'Metodología', href: '/metodologia' },
    { label: 'Valores', href: '/valores' }
  ],
  footerNav: [
    { label: 'Identidad', href: '/identidad' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' }
  ],
  social: {
    github: 'https://github.com/alexendros',
    linkedin: 'https://linkedin.com/in/alexendros',
    email: 'mailto:contratacion@alexendros.dev',
    cal: 'https://cal.com/alexendros'
  }
} as const;
