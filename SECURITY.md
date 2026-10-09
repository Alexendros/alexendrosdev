# Política de seguridad

### Propósito de este documento

- **Objetivos:** Declarar versiones soportadas, el canal privado de avisos y la superficie (formulario, webhook, secretos).
- **Estructura:** Canal → versiones → plazos → secretos → alcance.
- **Contenido a integrar según contexto:** Adapta env SMTP/Upstash/Cal/Notion de este sitio. No copies la política de un SaaS ni un desk de comunidad. No commitees `.env` ni claves.

## Canal de reporte

Reporta vulnerabilidades de forma **privada**:

1. [GitHub Security Advisories](https://github.com/Alexendros/alexendrosdev/security/advisories/new) (preferido).
2. O por correo a `operaciones@alexendros.dev`.

No abras issues públicos con exploits, PoCs ofensivos, tokens, secretos ni PII.

## Versiones soportadas

| Versión                                       | Soporte                                         |
| --------------------------------------------- | ----------------------------------------------- |
| `main` / última Release etiquetada (`vX.Y.Z`) | Activo                                          |
| Tags anteriores                               | Solo rollback operativo; sin parches proactivos |

## Plazo orientativo de respuesta

- Acuse de recibo: ≤ 5 días laborables.
- Evaluación inicial y plan: ≤ 15 días laborables (según severidad).

## Secretos

- Prohibido pegar secretos en issues, PRs, commits, logs de CI o artefactos.
- Valores solo en GitHub Secrets / Vercel Env; nunca en el repo:
  - Proton SMTP (`SMTP_*`)
  - Upstash Redis (`UPSTASH_*`)
  - Cal.com webhook (`CAL_WEBHOOK_SECRET`)
  - Notion (`NOTION_TOKEN`; `NOTION_LEADS_DATABASE_ID` es un id público de data source, no un secreto)
- Rotar tokens ante sospecha de fuga o cadencia trimestral mínima del SMTP.
- `/api/contact` es **fail-closed** sin Upstash o si Redis falla (HTTP 503 genérico). No devolver stacks, detalles Zod, ni nombres de variables al cliente.
- `/api/cal/webhook` es **fail-closed** sin `CAL_WEBHOOK_SECRET`, Upstash o Notion (HTTP 503 genérico). Firma HMAC inválida → 401 genérico. Redis solo para idempotencia (`alexendros:cal:uid:{uid}:{trigger}`); Notion es la fuente de verdad de Leads. Logs sin PII.

Renovate (`.github/renovate.json`) cubre `npm` y `github-actions`. No hay Dependabot de version-updates.

## Alcance

Sitio de marketing/portfolio (alexendros.dev). Fuera de alcance: seguridad de terceros enlazados (Cal.com, Proton, Vercel, Upstash) más allá de su uso documentado.
