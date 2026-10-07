# Threat Model — miwebsite-alexendrosdev

**Versión**: 1.1 | **Fecha**: 2026-10-07 | **Autor**: Alexendros
**Metodología**: STRIDE + ATT&CK v19 | **Revisión**: cada cambio mayor

---

## 1. Activos

| Activo                                         | Tipo          | Criticidad | Descripción                                       |
| ---------------------------------------------- | ------------- | ---------- | ------------------------------------------------- |
| Datos de leads (Notion)                        | PII           | Alta       | Nombre, email, teléfono desde formulario contacto |
| Cookies de consentimiento                      | PII (técnica) | Media      | Preferencias CMP v2, versión consentimiento       |
| Métricas analíticas (GA4, PostHog, Clarity)    | Analítica     | Media      | Eventos de usuario, IDs pseudónimos               |
| Secretos de despliegue (Vercel, Upstash, SMTP) | Credenciales  | Crítica    | Tokens en Vercel/Upstash/Proton; **no en repo**   |
| Código fuente y dependencias                   | IP            | Media      | Repo público GitHub                               |

---

## 2. Actores de amenaza

| Actor                                   | Motivación                    | Capacidad                  |
| --------------------------------------- | ----------------------------- | -------------------------- |
| Atacante externo oportunista            | Robo credenciales, defacement | Media (automatizado)       |
| Atacante dirigido (competidor)          | Espionaje, robo leads         | Alta (manual + tools)      |
| Insider malicioso                       | Fuga datos, sabotaje          | Muy alta (acceso legítimo) |
| Dependencia comprometida (supply chain) | RCE, exfiltración             | Variable                   |

---

## 3. Superficie de ataque (STRIDE)

### Formulario de contacto (`/api/contact`)

| STRIDE                     | Amenaza                 | Mitigación actual                 | Gap        |
| -------------------------- | ----------------------- | --------------------------------- | ---------- |
| **S**poofing               | Falsificación remitente | Turnstile (configurado), honeypot | ✅         |
| **T**ampering              | Inyección en payload    | Zod schema validation             | ✅         |
| **R**epudiation            | Negación envío          | Log estructurado ausente          | ❌ Logging |
| **I**nformation Disclosure | Fuga emails en error    | Respuesta genérica                | ✅         |
| **D**enial of Service      | Flood API               | Upstash Ratelimit (10/min/IP)     | ✅         |
| **E**levation of Privilege | N/A (sin auth)          | —                                 | —          |

### Lead Magnet (`/api/lead-magnet`)

| STRIDE                     | Amenaza                 | Mitigación actual                 | Gap        |
| -------------------------- | ----------------------- | --------------------------------- | ---------- |
| **S**poofing               | Falsificación remitente | Turnstile (configurado), honeypot | ✅         |
| **T**ampering              | Inyección en payload    | Zod schema validation             | ✅         |
| **R**epudiation            | Negación envío          | Log estructurado ausente          | ❌ Logging |
| **I**nformation Disclosure | Fuga emails en error    | Respuesta genérica                | ✅         |
| **D**enial of Service      | Flood API               | Upstash Ratelimit (5/min/IP)      | ✅         |
| **E**levation of Privilege | N/A (sin auth)          | —                                 | —          |

### Frontend estático (Astro + islas React)

| STRIDE                     | Amenaza                     | Mitigación actual                                     | Gap |
| -------------------------- | --------------------------- | ----------------------------------------------------- | --- |
| **S**poofing               | Clickjacking                | `X-Frame-Options: DENY`, CSP `frame-ancestors 'none'` | ✅  |
| **T**ampering              | Modificación JS en tránsito | HSTS, CSP **impuesta**                                | ✅  |
| **R**epudiation            | —                           | —                                                     | —   |
| **I**nformation Disclosure | Fuga env vars en build      | `.env.local` en .gitignore, Vercel env                | ✅  |
| **D**enial of Service      | —                           | Vercel edge caching                                   | ✅  |
| **E**levation of Privilege | XSS via sinks               | Sin `innerHTML`/`dangerouslySetInnerHTML` detectados  | ✅  |

### CI/CD (GitHub Actions)

| STRIDE                     | Amenaza                         | Mitigación actual                                | Gap                  |
| -------------------------- | ------------------------------- | ------------------------------------------------ | -------------------- |
| **S**poofing               | Commit malicioso                | Branch protection, signed commits (pendiente)    | ❌ Branch protection |
| **T**ampering              | Action comprometida             | Actions fijadas por SHA inmutable (security.yml) | ✅                   |
| **R**epudiation            | —                               | Audit log GitHub                                 | ✅                   |
| **I**nformation Disclosure | Secretos en logs                | Gitleaks en CI + pre-commit Husky                | ✅                   |
| **D**enial of Service      | Workflow infinito               | Concurrency cancel-in-progress                   | ✅                   |
| **E**levation of Privilege | Permisos excesivos GITHUB_TOKEN | `permissions: contents: read`                    | ✅                   |

### Dependencias (npm)

| STRIDE                     | Amenaza               | Mitigación actual                                       | Gap       |
| -------------------------- | --------------------- | ------------------------------------------------------- | --------- |
| **S**poofing               | Typosquatting         | Lockfile versionado. Sin detector automático de nombres | Pendiente |
| **T**ampering              | Paquete malicioso     | `pnpm-lock.yaml` commitado, Renovate                    | ✅        |
| **R**epudiation            | —                     | —                                                       | —         |
| **I**nformation Disclosure | CVE en dependencia    | osv-scanner en CI (security.yml)                        | ✅        |
| **D**enial of Service      | —                     | —                                                       | —         |
| **E**levation of Privilege | Postinstall malicioso | Sin `scripts.postinstall` sospechosos                   | ✅        |

Residuales aceptados del expediente `20261007-085704`, tras los parches de la misma línea:

- Solo build o CI, fuera del runtime de Vercel: `basic-ftp` 5.3.1, `braces` 3.0.3, `extract-zip` 2.0.1, `sprintf-js` 1.0.3, `postcss-selector-parser` 6.1.4, `tmp` 0.0.33 y 0.1.0, `uuid` 8.3.2. No hay versión corregida en la misma línea, o el padre no admite el salto. No se fuerza un major.
- `http-cache-semantics` 4.2.0 lo arrastra Astro 4. Queda para el PR `cursor/deps-astro-major`.
- `nodemailer` 6.10.1 se queda por el issue #12. El código no usa `raw` ni OAuth2. El email que va a `replyTo` está limitado a 254 caracteres.
- F-003 a F-007 están cerrados en `.gitleaks.toml`: `STORAGE_KEY` de `localStorage` del banner, no una credencial.

---

## 4. Flujos de datos y zonas de confianza

```
Usuario → [Navegador] → (HTTPS/TLS 1.3) → [Vercel Edge] → [Astro SSR/SSG]
                                                        ↓
                                            [API /contact] → [Zod] → [Upstash Ratelimit]
                                                        ↓
                                              [Proton SMTP] → [Notion API]
                                                        ↓
                                              [GA4/PostHog/Clarity] (consent-gated)
```

**Zonas de confianza:**

1. **Navegador usuario** — No confiable (validar todo en server)
2. **Vercel Edge/Functions** — Confiable (infraestructura gestionada)
3. **Upstash Redis** — Confiable (managed, TLS)
4. **Proton SMTP / Notion API** — Confiable (proveedores externos, auth mutua)
5. **Analytics endpoints** — Semi-confiable (solo con consentimiento)

---

## 5. Matriz de mitigaciones (ATT&CK v19)

| Táctica               | Técnica                            | Mitigación                                    | Estado |
| --------------------- | ---------------------------------- | --------------------------------------------- | ------ |
| **Initial Access**    | T1190 (Exploit Public-Facing App)  | WAF Vercel, rate limit, input validation      | ✅     |
| **Initial Access**    | T1195.001 (Supply Chain)           | Lockfile, Dependabot, osv-scanner CI          | ✅     |
| **Execution**         | T1059 (Command/Script Interpreter) | Sin `eval`/`exec` detectados, CSP             | ✅     |
| **Credential Access** | T1552.001 (Unsecured Credentials)  | Secret scanning (pre-commit + CI), .gitignore | ✅     |
| **Credential Access** | T1557 (MITM)                       | HSTS preload, TLS 1.3 only                    | ✅     |
| **Discovery**         | T1083 (File/Directory Discovery)   | Sin directory listing, CSP                    | ✅     |
| **Collection**        | T1005 (Data from Local System)     | No datos sensibles en cliente                 | ✅     |
| **Exfiltration**      | T1041 (Exfil over C2)              | CSP `connect-src` restrictivo                 | ✅     |
| **Impact**            | T1485 (Data Destruction)           | Backups Vercel, Git history                   | ✅     |

---

## 6. Decisiones de riesgo aceptado

| Riesgo                | Decisión              | Justificación                                        | Revisión   |
| --------------------- | --------------------- | ---------------------------------------------------- | ---------- |
| Sin branch protection | **ACEPTADO temporal** | Requiere admin repo; pendiente configuración manual  | 2026-10-14 |
| Logging estructurado  | **ACEPTADO**          | Vercel Logs + Analytics cubren observabilidad básica | 2026-11-07 |

---

## 7. Pruebas de validación

| Prueba                                                    | Frecuencia                  | Responsable |
| --------------------------------------------------------- | --------------------------- | ----------- |
| `security.yml` (gitleaks, osv-scanner, CodeQL, Scorecard) | En cada PR y push a main    | CI          |
| `secops.py audit`                                         | Bajo demanda, no está en CI | Manual      |
| Ejercicio mesa secret-leak                                | Trimestral                  | Alexendros  |
| Revisión threat model                                     | Cambio mayor                | Alexendros  |

---

## 8. Referencias

- OWASP ASVS 5.0 L1/L2
- MITRE ATT&CK v19 (Enterprise)
- NIST SSDF v1.1
- Vercel Security Best Practices
- Astro Security Guide
