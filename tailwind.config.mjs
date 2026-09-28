/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Fuente única de verdad: :root en src/styles/global.css (ADR 0011).
      // No duplicar valores literales aquí; los translúcidos usan
      // color-mix sobre var(--brand) porque Tailwind v3 no aplica
      // /<alpha> sobre var().
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        primary: 'var(--brand)',
        primaryHover: 'var(--brand-hover)',
        primarySoft: 'color-mix(in srgb, var(--brand) 40%, transparent)',
        primaryGhost: 'color-mix(in srgb, var(--brand) 8%, transparent)',
        muted: 'var(--fg-muted)',
        border: 'var(--border)',
        card: 'var(--card)',
        ink: 'var(--brand-fg)',
        danger: 'var(--danger)'
      },
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'monospace']
      }
    }
  },
  plugins: []
};
