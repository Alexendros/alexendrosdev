/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      // Fuente única de verdad: :root en src/styles/global.css.
      // No duplicar valores literales aquí; los translúcidos son tokens
      // propios (--primary-soft/--primary-ghost) porque Tailwind v3 no
      // aplica /<alpha> sobre var().
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        primary: 'var(--primary)',
        primarySoft: 'var(--primary-soft)',
        primaryGhost: 'var(--primary-ghost)',
        muted: 'var(--muted)',
        border: 'var(--border)',
        card: 'var(--card)',
        ink: 'var(--ink)'
      },
      fontFamily: {
        sans: ['Inter Variable', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono Variable', 'monospace']
      }
    }
  },
  plugins: []
};
