// Tailwind 3 sin @astrojs/tailwind: esa integración no admite Astro 7.
// applyBaseStyles queda en false de hecho: global.css ya trae las directivas.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
