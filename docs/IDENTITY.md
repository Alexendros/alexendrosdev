# IDENTIDAD DE CADA ELEMENTO — alexendros.dev

Repo canónico **público**: [`Alexendros/alexendrosdev`](https://github.com/Alexendros/alexendrosdev). Deploy: Vercel Hobby proyecto **`alexendros-dev`** (apex producción).

## site.ts

Config global: name, url https://alexendros.dev apex, titleDefault "webs que convierten", nav Servicios/Proyectos/Sobre mi/Contacto, footer legal, social GitHub/LinkedIn/mailto/cal.com. Fuente verdad SEO canonical OG JSON-LD Person.

## profile.ts

Quien eres: role Full Stack · Auditor · Consultor, summary conversion-focused, method 6 pasos (definicion alcance, arquitectura ADRs, TS estricto + a11y, validacion CI, deploy Vercel <1.65s LCP, transferencia 30 dias), Valencia remoto.

## services.ts — 3 servicios con alcance cerrado

- produccion-sitios-web: Para fundadores WP lento. Problemas LCP>4s, landings genericas, forms rotos 78% abandono. Scope 10 inc Stripe/PayPal forms Zod 3 campos. Deliverables app+CI verde+informe Lighthouse/axe+guia. Metricas -65% LCP 3.2% conversion. Desde 1500€ 1-4 sem. Exclusiones sin CMS gestionado.
- auditorias: Para CTOs tech leads. Scope perf CWV LCP CLS INP, a11y axe-core+teclado/NVDA, SEO tecnico, calidad, seguridad proporcional, priorizacion ICE, plan remediacion. Deliverables informe navegable+ICE+scripts+sesion 1h. Desde 650€ 3-5 dias.
- consultoria-tecnologica: Sin hype. Diagnostico arquitectura evaluacion alternativas plan faseado ADRs/runbooks. Stack TS Node Rust Go MCP Ollama Zod. Desde 900€ 1-2 sem.

## projects.ts — 4 proyectos (profundidad > cantidad, 70% recruiters prefiere)

- front-valencia: Astro+React+Tailwind, Payload CMS 3+PostgreSQL i18n ES/EN carta con alergenos reservas CoverManager panel propio. Web rapida y accesible
- graficas-nasve: Next.js motor precios 200+ reglas validacion PDF Stripe Checkout B2B/B2C. 48h->5min +300% pedidos 0 errores -70% gestion PCI SAQ-A
- zedazo: CLI Rust 3MB limpiar VCF E.164 dedup VCF/CSV. Open source MIT
- alexendros-me: Next.js lab contenido MDX privacidad real sin GA. Lectura comoda y accesible

## Componentes

- Header.astro: sticky blur nav activo CTA Reservar siempre visible
- Footer.astro: 3 col marca+nav+legal+contacto claim sin cookies GA
- Hero.astro: H1 "Construyo webs y apps que convierten y escalan", 3 formas trabajar, CTA doble contacto+proyectos, 3 metricas pill -65% 3.2% 0 viol, terminal logs CI verde stack pills, trust bar 85% hiring managers revisan portfolio 88% clientes investigan 1s vs5s 3x 3 campos 3.2% vs 9+ 0.8%
- ServiceCard.astro: pricingDesde timeline metricas scope count hover border primary
- ProjectCard.astro: titulo short results pills primary/10 tech pills role footer
- ContactForm.tsx: Unica isla React client:load. Campos nombre* email* empresa opcional asunto* select 6 opciones mensaje* 20-2000 consent RGPD no pre-marcado honeypot hidden. Zod validacion. Nota conversion.
- BookingOptions.astro: CTAs Cal.com (diagnóstico 75€, sesión técnica 150€) con embed.js diferido en modal + QR SVG de build (uqr). Retainer oculto.

## Paginas

- index.astro: Hero+Servicios grid 3+transparencia+Proyectos featured 3+por que convierte 3 col velocidad prueba friccion+CTA final
- servicios/index.astro y [slug].astro: metricas arriba pricing timeline 2 col problemas/alcance/exclusiones vs entregables/proceso/stack CTA sticky
- proyectos/index.astro y [slug].astro: contexto reto solucion responsabilidades vs stack highlights links CTA Similar?
- sobre-mi.astro: method 6 pasos por que distinto 0 JS contenido self-hosted sin GA
- contacto.astro: Reservas Cal (diagnóstico 75€ / sesión técnica 150€ + QR) + Form + canales email; nota privacidad 12 meses RGPD 6.1.b
- api/contact.ts: Zod honeypot rate-limit Upstash nodemailer Proton SMTP From/To operaciones@alexendros.dev
- aviso-legal.astro privacidad.astro: NIF 21002968N C/Higinio Noja 21 p9 Valencia hola@alexendros.dev sin alta autonomo bajo SMI 12 meses retencion Proton Vercel DPF+SCC

Cada elemento existe para reducir objecion o aumentar trust. No anadir sin justificar metrica conversion.
