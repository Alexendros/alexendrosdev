export const site = {
  name: 'Alexendros',
  url: 'https://alexendros.dev',
  titleDefault: 'Alexendros — Webs claras y rápidas para profesionales y pequeños negocios',
  descriptionDefault:
    'Creo y mejoro webs para que tus clientes entiendan lo que haces y te contacten. También reviso sitios existentes y preparo planes de mejora realistas.',
  locale: 'es',
  ogLocale: 'es_ES',
  nav: [
    { label: 'Cómo puedo ayudarte', href: '/servicios' },
    { label: 'Casos', href: '/proyectos' },
    { label: 'Cómo trabajo', href: '/como-trabajo' },
    { label: 'Sobre mí', href: '/sobre-mi' }
  ],
  footerNav: [
    { label: 'Aviso legal', href: '/aviso-legal' },
    { label: 'Privacidad', href: '/privacidad' },
    { label: 'Cookies', href: '/cookies' }
  ],
  social: {
    github: 'https://github.com/alexendros',
    linkedin: 'https://linkedin.com/in/alexendros',
    email: 'mailto:hola@alexendros.dev',
    cal: 'https://cal.com/alexendros'
  }
} as const;
