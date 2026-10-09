# Readiness report — Alexendros/alexendrosdev — 2026-10-09

### Propósito de este documento

- **Objetivos:** Dejar evidencia del saneado pre-Remachar (gate de entrada a `/repo-ending`) sin publicar release en este ciclo.
- **Estructura:** Veredicto → baseline vs post → PRs → residuales → checklist readiness → handoff.
- **Contenido a integrar según contexto:** Actualiza solo el estado de cierre/auditoría. No cambia pricing ni contenido comercial.

**Veredicto:** READY FOR REMACHAR (auditoría `/repo-ending`) — no publicación automática.

**Modo:** remediación completada → handoff a auditoría repo-ending  
**Repo crítico:** sí — despliega a producción (`https://alexendros.dev`).

## Resumen

| Métrica               | Baseline (main pre-trabajo)                     | Post (main tras merges)                     |
| --------------------- | ----------------------------------------------- | ------------------------------------------- |
| Dependabot open       | 92 (2 critical, 29 high, 49 medium, 12 low)     | 42 (2 critical, 16 high, 21 medium, 3 low)  |
| Tests Vitest          | 119                                             | 134 (+ property-based + headers)            |
| Astro                 | 4.16.x                                          | 7.3.5                                       |
| CI jobs               | quality/test/build/smoke (+ e2e opt-in)         | + `e2e-critical` always-on + `security.yml` |
| Repo canónico en docs | `Soluciones-Alexendros/miwebsite-alexendrosdev` | `Alexendros/alexendrosdev`                  |

## PRs mergeados en este ciclo

| PR  | Título                                                              | Estado |
| --- | ------------------------------------------------------------------- | ------ |
| #78 | security: Astro 7.3.5, overrides misma línea y residuales aceptados | MERGED |
| #75 | feat(skills): cimientos Protocolo Trifásico + PROTECCIÓN            | MERGED |
| #76 | feat(skills): área ACCESIBILIDAD                                    | MERGED |
| #80 | feat(skills): área ORDEN (reemplazo de #77 cerrado)                 | MERGED |
| #83 | docs: canónico Alexendros/alexendrosdev + Astro 7.3                 | MERGED |
| #79 | test: property-based, headers, e2e-critical                         | MERGED |
| #84 | docs(audits): informe pre-Remachar 2026-10-09                       | MERGED |

Superseded / closed: #73 (contenido absorbido en #78), #74 (cerrado sin merge; overrides recuperados en #78), #77 (cerrado al borrar base; recreado como #80).

**Verificación local 2026-10-09 (post-merge):** `pnpm test` 134/134, `pnpm test:contract` 79/79, `pnpm build` + `pnpm smoke` OK. Workflow `security` en `main`: secrets/sca/sast verdes; `scorecard` fallaba en privado (`Resource not accessible by integration`) → job condicionado a `visibility == public` (mismo patrón que dependency-review).

## Residuales aceptados

Documentados en [`docs/threat-model.md`](../threat-model.md) y allowlist [`osv-scanner.toml`](../../osv-scanner.toml):

- **nodemailer 6.x** — diferido (issue #12); email `replyTo` limitado a 254 caracteres; tests de contrato.
- **Toolchain/CI** — `basic-ftp`, `braces`, `extract-zip`, `tmp`, `uuid`, `handlebars`, `postcss-selector-parser`, `sprintf-js`, `http-cache-semantics` cuando no hay parche usable en la misma línea.
- Dependabot aún reporta **2 critical / 16 high** abiertos: triar tras dismiss alineado con allowlist OSV (muchas son nodemailer/toolchain ya aceptadas; no bloquean SCA en CI).

## Capas de validación

1. **Unit/contract** — Vitest + `fast-check` (`contactSchema`, `smtpConfig`, `calWebhookSchema`).
2. **Regresión seguridad** — `securityHeaders.test.ts` sobre `vercel.json`.
3. **Smoke** — `scripts/smoke.sh` siempre-on.
4. **E2E crítico** — job `e2e-critical` (home, contacto, consent deny-by-default).
5. **E2E completo + LHCI** — sigue opt-in con label `e2e`.
6. **Security pipeline** — gitleaks, osv-scanner (con allowlist), CodeQL sin upload, scorecard solo si el repo es público.

## Checklist readiness (repo-ending)

| Ítem                              | Estado | Notas                                                                                      |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| Secreto en árbol                  | OK     | Gitleaks CI + allowlist STORAGE_KEY falso positivo                                         |
| `uses:` con SHA                   | OK     | ci.yml / security.yml / release.yml                                                        |
| `permissions:` explícito          | OK     |                                                                                            |
| `timeout-minutes` por job         | OK     | Añadido en security.yml                                                                    |
| Entrada no confiable en `run:`    | OK     | Revisado                                                                                   |
| Tag/CHANGELOG/manifiesto          | N/A    | Sin publicación en este ciclo                                                              |
| Labels taxonomía                  | WARN   | Coexisten labels GitHub-default y `type:*` — Fase A Remachar                               |
| Lockfile + deps                   | WARN   | 42 alertas Dependabot abiertas; SCA CI verde con allowlist                                 |
| Runtime EOL                       | OK     | Node 22.x                                                                                  |
| SECURITY.md / README              | OK     |                                                                                            |
| actionlint / pipeline             | OK     | CI verde; security secrets/sca/sast verdes; scorecard N/A en privado                       |
| Required checks                   | OK     | quality/test/build/smoke (+ e2e-critical)                                                  |
| CodeQL / secret scanning settings | WARN   | CodeQL en CI con `upload: false`; secret scanning API no habilitada (paso manual settings) |
| Despliegue Vercel                 | OK/WIP | Hobby + repo público (decisión 1B; transición 2026-10-09)                                  |
| Mutation testing                  | WARN   | No ejecutado (coste); anotado para Remachar                                                |

## Pasos (actualización 2026-10-09 tarde)

1. **Dependabot:** 42 alertas allowlist dismissadas (`tolerable_risk`); open = 0.
2. **Visibilidad:** transición a **público** tras revisión de subsecciones (AGENTS/SECURITY/IDENTITY/PLAN).
3. **Settings:** habilitar secret scanning / private vulnerability reporting si el plan GitHub lo permite.
4. **Issue #12:** majors zod/nodemailer/React en curso tras visibilidad pública.
5. **Labels:** Fase A de `/repo-ending` (deduplicar default vs `type:*`).

## Handoff Remachar

Arrancar en el clon local:

```bash
cd /home/alexendros/Aplicaciones/Portales/alexendrosdev
# /repo-ending en modo auditoría primero
```

Skill: [`repo-ending`](file:///home/alexendros/.cursor/skills/repo-ending/SKILL.md) — modo **auditoría**, luego remediación solo con sí. No publicar tag/release hasta checklist en verde y confirmación de publicación.
