import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://alexendros.dev',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/design-system')
    })
  ],
  // Astro 5 elimina output: 'hybrid'. static conserva el opt-in por ruta
  // (prerender = false en API y /r/[code]).
  output: 'static',
  // El adapter 11 emite nodejs24.x. scripts/fix-vercel-runtime.mjs lo deja en
  // nodejs22.x, que es el engines del repo.
  adapter: vercel({
    maxDuration: 10
  }),
  build: {
    // Fase ② PROTECCIÓN: externaliza los estilos de Astro a /_astro/*.css
    // para poder retirar 'unsafe-inline' de style-src en la fase ③.
    inlineStylesheets: 'never'
  },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  vite: {
    plugins: [tailwindcss()],
    build: { cssMinify: true },
    // Expone VERCEL al prerender estático: en builds locales/CI queda vacío y
    // Layout.astro omite los scripts /_vercel/* (que allí darían 404).
    define: { __IS_VERCEL__: JSON.stringify(!!process.env.VERCEL) }
  }
});
