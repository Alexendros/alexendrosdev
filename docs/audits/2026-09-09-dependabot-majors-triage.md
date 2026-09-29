# Triage majors Dependabot — 2026-09-09 (WP-7)

**Política:** no fusionar upgrades **major** junto a cambios funcionales del formulario. Un PR major por dependencia (o grupo íntimamente acoplado), con CI verde + Preview.

Issue: [#12](https://github.com/Soluciones-Alexendros/miwebsite-alexendrosdev/issues/12).  
Ignora actuales: [`.github/dependabot.yml`](../../.github/dependabot.yml) (`zod`, `nodemailer`, `react`/`react-dom`/`@types/*`, `@astrojs/react`, `@astrojs/tailwind`, `astro`).

## Estado declarado (package.json)

| Paquete                     | Rango actual | Major diferido | Orden sugerido | Notas de triage                                                           |
| --------------------------- | ------------ | -------------- | -------------- | ------------------------------------------------------------------------- |
| zod                         | ^3.23.8      | 4.x            | 1              | Revisar breaking `z.email` / APIs; tocar `contactSchema` + tests contrato |
| nodemailer                  | ^6.9.15      | 10.x           | 2              | Revisar `createTransport`/tipos; smoke SMTP en Preview sandbox            |
| react + react-dom (+ types) | ^18.3.1      | 19.x           | 3              | Coordinar con `@astrojs/react`; isla `ContactForm` + Analytics            |
| @astrojs/react              | ^3.6.2       | major          | 3              | Mismo PR o PR inmediatamente posterior a React                            |
| @astrojs/tailwind           | ^5.1.2       | major          | 4              | Tras Astro o en tándem documentado                                        |
| astro                       | ^4.16.0      | 5.x            | 5              | Adapter `@astrojs/vercel`, hybrid output, CI LHCI/e2e                     |
| @astrojs/vercel             | ^7.8.2       | (seguir Astro) | 5              | Añadir a `ignore` major si Dependabot lo propone aparte                   |

## Criterios por PR major

1. Rama `cursor/deps-<pkg>-major` desde `main` limpio (sin mezclar WP contacto).
2. Changelog upstream leído; lista de breaking en el cuerpo del PR.
3. `pnpm test` + `test:contract` + `test:e2e` + `lhci` verdes.
4. Preview Vercel OK; smoke contacto solo con sandbox.
5. Quitar la entrada `ignore` correspondiente en `dependabot.yml` **solo** tras merge estable.

## Esta entrega (WP-7)

- Documenta el orden y la política; **no** ejecuta bumps major.
- Confirma que el ignore de Dependabot sigue activo (sin cambios de versión en lockfile).
