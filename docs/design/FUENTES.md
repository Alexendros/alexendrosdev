# Fuentes de diseño — página única v1

Fecha: 2026-10-31.

## Mock v4

| Campo              | Valor                                                              |
| ------------------ | ------------------------------------------------------------------ |
| Archivo en el repo | [`mock-v4-singlepage.html`](./mock-v4-singlepage.html)             |
| Origen             | Adjunto de Alejandro (Downloads), 31-10-2026                       |
| sha256             | `6b451e2cceceb073ff14b0fbe5d23279868508d73d004e9f9ddbdd6d79b10102` |
| Ubicación          | Solo en `docs/design/`. Nunca en `public/`.                        |

### Revisión previa al guardado

- Sin scripts de seguimiento (GTM, Meta, Clarity, PostHog, LinkedIn).
- Sin datos personales reales. El único correo del HTML es el de ejemplo `nombre@empresa.es` en un mensaje de validación.
- Contiene Google Fonts, Tailwind compilado en línea, scripts en línea, `style=` e `innerHTML`. Eso no se porta.

## Qué se toma del mock

- Estructura de anclas: `#top`, `#servicios`, `#referencias`, `#metodo` (con `#faq`), `#contacto`.
- Textos de hero, vías, método, FAQ, contacto y mensajes de validación del formulario.
- Componentes daisyUI de referencia: `navbar`, `dropdown` sobre `<details>`, `footer`, `hero`, `mockup-browser`, `stats`, `card`, `badge`, `steps`, `collapse`, `modal`/`dialog`, `fieldset`, `checkbox`, `input`, `textarea`, `validator`, `alert`, `toast`, `theme-controller`, `btn`, `join`.
- Temas visuales `alexlight` / `alexdark` en OKLCH, con el ámbar de acento en claro fijado en `oklch(52% 0.105 65)` (cierre de Arquitecto; el mock trae otro valor).
- Patrón de marco: navbar y footer en `base-100`, cuerpo en `base-200`, borde en `base-300`.

## Qué no se toma del mock (código)

- CSS de Tailwind compilado en un `<style>` monolítico.
- Google Fonts externas (JetBrains Mono se autoaloja con `@fontsource-variable/jetbrains-mono`).
- Scripts en línea e `innerHTML`.
- Atributos `style=` (incluidos los retardos `--d` de `.rise`).
- Barra de progreso de scroll (solo JS).
- Paleta de comandos ⌘K (queda fuera; PR aparte si cabe).
- Navbar translúcida (`bg-base-200/85`): manda el marco sólido en `base-100`.
- FAQ con radios: la web usa `<details name="faq">`.
- Filtro de referencias con `tabs`: la web usa `join` + `btn` con `aria-pressed`.
