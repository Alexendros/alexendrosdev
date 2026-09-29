# Runbook — Obtener y configurar cada variable de entorno

Objetivo: guiar paso a paso la obtención de **cada** token/credencial que necesita el sitio
(contacto, CRM, analítica, CAPI, email) y su alta en Vercel, sin inventar valores ni filtrar
secretos. Este runbook es la fuente única para cerrar la configuración pendiente en producción.

## 1. Reglas generales

- **Inventario**: `.env.example` (nombres y descripción) y `src/env.d.ts` (tipos) son la lista
  canónica. Si añades una variable, actualiza **ambos**.
- **Nunca commitear valores**. `.env`, `.env.local` y `.env.*.local` están en `.gitignore`.
  `PUBLIC_*` no son secretos, pero tampoco se commitean valores reales.
- **`PUBLIC_*` = build-time**. Vite las inlinea al compilar: deben existir en el build de
  Production/Preview y **cambiar su valor exige un redeploy** para que surtan efecto.
- **El resto = runtime**. Se leen dentro de las Serverless Functions (`POST /api/*`); basta con
  guardarlas/actualizarlas y volver a desplegar para que el proceso las lea.
- **Entornos Vercel**: alta en `Production`, `Preview` y `Development` salvo que se indique lo
  contrario. Un valor solo en `Production` deja las previews rotas.
- **Seguridad**: pega los tokens directamente en el dashboard/CLI, nunca en un issue, PR o chat.
  Si un token se filtra, **rótalo** en el proveedor y actualízalo en Vercel.

## 2. Cómo dar de alta los valores en Vercel

Dashboard: **Project `alexendros-dev` → Settings → Environment Variables → Add New**, con nombre
exacto, valor, y marcas de entorno.

CLI. Forma no interactiva (pasa el valor por stdin, nunca en el propio comando):

```bash
# No interactiva: el valor viaja por stdin y no queda en el historial del shell.
printf '%s' "$VALUE" | vercel env add SMTP_PASS production

# Varios entornos de una vez
printf '%s' "$VALUE" | vercel env add SMTP_PASS production,preview,development

# Ver nombres ya configurados (no imprime valores)
vercel env ls
```

> **`Preview` necesita el git-branch posicional, aunque sea vacío.** Si se omite, la CLI abre
> el prompt «Leave empty to apply to all Preview branches / ? Git branch?» y, con stdin por
> pipe o `--value`, **no crea la variable** (sale con código 0 pero sin efecto). La forma que
> funciona es:
>
> ```bash
> printf '%s' "$VALUE" | vercel env add SMTP_PASS preview "" --value "$VALUE" -y
> # o, sin stdin:
> vercel env add SMTP_PASS preview "" --value "$VALUE" -y
> ```
>
> La lista `production,preview,development` también cubre Preview correctamente.

### Subida en lote con `scripts/env-push.sh`

Para cargar varias variables desde un fichero sin volcar secretos en pantalla:

```bash
# 1) Escribe los valores en un fichero gitignored (NO en .env.local; ver aviso)
#    .env.provision, .env.* están en .gitignore.

# 2) Simula (18 operaciones = 6 claves × production,preview,development)
ENV_FILE=.env.provision bash scripts/env-push.sh --dry-run

# 3) Sube de verdad, opcionalmente acotando claves o entornos
ENV_FILE=.env.provision bash scripts/env-push.sh
ENV_FILE=.env.provision bash scripts/env-push.sh --only RESEND_API_KEY --envs production,preview
```

El script borra antes la clave en cada entorno (`vercel env rm … -y`) y la re-añade por stdin,
imprimiendo solo `ok CLAVE → entorno` (nunca el valor).

> **Nunca subas el `.env.local` que genera `vercel env pull`.** Para las variables cifradas la
> CLI escribe el literal `[SENSITIVE]`, no el secreto. Re-subir ese fichero **sobrescribiría
> los valores reales** en Vercel. Usa siempre un fichero de aprovisionamiento propio
> (`.env.provision`) con valores reales o generados.

### Traer valores a local (solo para probar)

```bash
# Las variables cifradas llegan como [SENSITIVE]; úsalo para nombres/estructura,
# no como fuente de secretos.
vercel env pull .env.local
```

Tras cargar variables que afecten al **build** (`PUBLIC_*`) o al runtime, **redeploy**:

```bash
vercel --prod      # producción (alexendros.dev)
```

## 3. Tabla maestra

| Variable                                                          | Obligatoria                 | Ámbito          | Secreto                | Sección                         |
| ----------------------------------------------------------------- | --------------------------- | --------------- | ---------------------- | ------------------------------- |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`             | Sí (contacto)               | runtime         | Sí (USER/PASS)         | [4.1](#41-smtp--proton-mail)    |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`             | Sí (rate limit fail-closed) | runtime         | Sí                     | [4.2](#42-upstash-redis)        |
| `PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY`              | Recomendada                 | build + runtime | SITE_KEY no, SECRET sí | [4.3](#43-cloudflare-turnstile) |
| `NOTION_TOKEN` / `NOTION_LEADS_DATA_SOURCE_ID`                    | Sí (CRM)                    | runtime         | Sí                     | [4.4](#44-notion)               |
| `CAL_WEBHOOK_SECRET`                                              | Sí (webhook Cal.com)        | runtime         | Sí                     | [4.5](#45-calcom-webhook)       |
| `PUBLIC_COOKIE_CONSENT_VERSION`                                   | Sí (CMP)                    | build           | No                     | [4.6](#46-consentimiento-cmp)   |
| `PUBLIC_GA4_ID`                                                   | Opcional                    | build           | No                     | [5.1](#51-google-analytics-4)   |
| `PUBLIC_GTM_ID` / `PUBLIC_GTM_SS_DOMAIN`                          | Opcional                    | build           | No                     | [5.2](#52-google-tag-manager)   |
| `PUBLIC_META_PIXEL_ID`                                            | Opcional                    | build           | No                     | [6.1](#61-meta-pixel-capi)      |
| `META_PIXEL_ID` / `META_CAPI_TOKEN` / `META_CAPI_TEST_EVENT_CODE` | Opcional                    | runtime         | Sí (TOKEN)             | [6.1](#61-meta-pixel-capi)      |
| `PUBLIC_CLARITY_ID`                                               | Opcional                    | build           | No                     | [5.3](#53-microsoft-clarity)    |
| `PUBLIC_POSTHOG_KEY` / `PUBLIC_POSTHOG_HOST`                      | Opcional                    | build           | No                     | [5.4](#54-posthog-eu)           |
| `PUBLIC_LINKEDIN_PARTNER_ID`                                      | Opcional                    | build           | No                     | [6.2](#62-linkedin-insight-tag) |
| `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_FROM_NAME`               | Opcional                    | runtime         | Sí (API_KEY)           | [7.1](#71-resend)               |
| `UNSUBSCRIBE_SECRET`                                              | Recomendada con Resend      | runtime         | Sí                     | [7.2](#72-secretos-generados)   |
| `PUBLIC_SITE_URL`                                                 | Opcional (documentada)      | build           | No                     | [8](#8-variables-de-referencia) |

## 4. Contacto, anti-spam y CRM

### 4.1 SMTP — Proton Mail

Endpoint afectado: `POST /api/contact`, `POST /api/afiliados`, `POST /api/lead-magnet`.

1. Necesitas un plan de Proton de pago con **SMTP submission** (Proton Mail Business/paid).
2. Entra en Proton → **Settings → IMAP/SMTP** (o _Security and login → IMAP/SMTP tokens_).
3. Genera un **token SMTP** para `operaciones@alexendros.dev`. El valor se muestra **una sola vez**:
   cópialo; será `SMTP_PASS`. No uses la contraseña de la cuenta.
4. Valores:
   - `SMTP_HOST=smtp.protonmail.ch`
   - `SMTP_PORT=587` (STARTTLS; `secure` se activa solo con 465)
   - `SMTP_USER=operaciones@alexendros.dev` (dirección completa)
   - `SMTP_PASS=<token SMTP>`

> **Aviso (issue #13)**: Proton Mail Bridge escucha en `127.0.0.1` y **no es alcanzable** desde
> Vercel. Si solo tienes Bridge, usa el token SMTP hospedado de un plan de pago o un relay
> transaccional. No configures Bridge para producción.

Cargar en Vercel en `Production`, `Preview` y `Development`.

### 4.2 Upstash Redis

Protege `/api/contact` (10/min), `/api/afiliados` (5/min), `/api/lead-magnet` (5/min) y la
idempotencia del webhook de Cal.com. Sin estas variables los endpoints de contacto responden
**503 fail-closed**.

1. Entra en <https://console.upstash.com> → **Create Database**.
2. Nombre `alexendros`, tipo **Regional**, región próxima (p. ej. `eu-west-1`). Plan Free es
   suficiente.
3. En la base creada, pestaña **REST API** → copia:
   - `UPSTASH_REDIS_REST_URL` (empieza por `https://`)
   - `UPSTASH_REDIS_REST_TOKEN`
4. Alta en Vercel (los tres entornos).

### 4.3 Cloudflare Turnstile

Si `TURNSTILE_SECRET_KEY` está definido, el servidor **exige** un token válido; el widget solo
aparece si hay `PUBLIC_TURNSTILE_SITE_KEY`. Con ambas vacías, el captcha se omite.

1. Entra en <https://dash.cloudflare.com> → **Turnstile → Add site**.
2. Nombre `alexendros.dev`; dominios: `alexendros.dev`, `www.alexendros.dev` y, si quieres probar
   previews, `*.vercel.app`.
3. Widget mode: **Managed** (recomendado) o _Non-interactive_.
4. Copia la **Site Key** (pública) y la **Secret Key**:
   - `PUBLIC_TURNSTILE_SITE_KEY=<site key>`
   - `TURNSTILE_SECRET_KEY=<secret key>`

`PUBLIC_TURNSTILE_SITE_KEY` es build-time (exige redeploy); la secret es runtime.

### 4.4 Notion

El formulario de contacto (`POST /api/contact`) y el webhook de Cal.com escriben en la base de
datos **Leads** de Notion.

1. Entra en <https://www.notion.so/my-integrations> → **New integration** (Internal).
2. Nombre `alexendros-web`; capabilities: **Read content**, **Insert content**, **Update content**.
3. Copia el **Internal Integration Secret** → `NOTION_TOKEN` (empieza por `ntn_`/`secret_`).
4. Abre la base de datos **Leads** en Notion → menú `···` → **Connections → Connect to** →
   selecciona `alexendros-web` (sin esto la API responde 404 aunque el token sea válido).
5. Obtén el **data source id** (el cliente usa `notionVersion 2025-09-03` y `dataSources.query`,
   que **no** acepta el id de la página):
   - URL de la base: `.../<database_id a 32 hex>?v=...` → ese id es `NOTION_LEADS_DATABASE_ID`.
   - Para el data source id, consulta la API:
     ```bash
     curl -s https://api.notion.com/v1/databases/<database_id> \
       -H "Authorization: Bearer $NOTION_TOKEN" \
       -H "Notion-Version: 2025-09-03" | grep -o '"id":"[^"]*"' | head
     ```
     El valor de `data_sources[0].id` es `NOTION_LEADS_DATA_SOURCE_ID` (tiene prioridad sobre
     `NOTION_LEADS_DATABASE_ID` si defines ambos).
6. Alta en Vercel. Al crear el lead, `contractHandler`/`contact.ts` añaden `Canal=Formulario`,
   `Vertical`, `Presupuesto` y `referral_code`. **Esas propiedades deben existir** en la base con
   esos nombres exactos (`Vertical`, `Presupuesto`, `referral_code`, `consent_marketing`).

### 4.5 Cal.com webhook

1. Cal.com → **Settings → Developer → Webhooks → Create**.
2. Subscriber URL: `https://alexendros.dev/api/cal/webhook`.
3. Activa los eventos que maneja el handler: `BOOKING_CREATED`, `BOOKING_PAID`,
   `BOOKING_PAYMENT_INITIATED`, `BOOKING_RESCHEDULED`, `BOOKING_CANCELLED`, `BOOKING_REJECTED`.
4. Al guardar, Cal.com muestra el **signing secret** (cabecera `x-cal-signature-256`) →
   `CAL_WEBHOOK_SECRET`. Si lo pierdes, regenera el webhook.

### 4.6 Consentimiento (CMP)

- `PUBLIC_COOKIE_CONSENT_VERSION` (entero). **Increméntalo** cuando cambien categorías, finalidades
  o el inventario de cookies; invalida el consentimiento previo y fuerza a recapturarlo.
- Debe coincidir con `docs/cookies-inventory.json` (verificado por `pnpm audit:cookies`).
- **No** se configura por proveedor: es una constante de build en Vercel.

## 5. Analítica (client-side, gated por consentimiento)

Todas estas son `PUBLIC_*` (build-time): al cambiarlas, redeploy. Sin ID, el loader correspondiente
no carga nada.

### 5.1 Google Analytics 4

1. <https://analytics.google.com> → **Admin → Create → Property** (`alexendros.dev`).
2. **Data streams → Web** → URL `https://alexendros.dev`.
3. Copia el **Measurement ID** (`G-XXXXXXXXXX`) → `PUBLIC_GA4_ID`.

### 5.2 Google Tag Manager

1. <https://tagmanager.google.com> → **Create Account/Container** tipo **Web**.
2. Copia el **Container ID** (`GTM-XXXXXXX`) → `PUBLIC_GTM_ID`.
3. Contenedor **Server-Side**: sigue `docs/runbooks/gtm-server-side.md`. El dominio propio
   (`metrics.alexendros.dev`) se guarda en `PUBLIC_GTM_SS_DOMAIN` (referencia/documentación; el
   runtime actual no lo consume).

### 5.3 Microsoft Clarity

1. <https://clarity.microsoft.com> → **Add new project** (nombre `alexendros.dev`, URL del sitio).
2. **Settings → Overview** → copia el **Project ID** → `PUBLIC_CLARITY_ID`.

### 5.4 PostHog EU

1. <https://eu.posthog.com> → **Create project** (región EU por RGPD).
2. **Project settings → Project API key** (`phc_...`) → `PUBLIC_POSTHOG_KEY`.
3. `PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com`.

## 6. Conversiones server-side

### 6.1 Meta Pixel + CAPI

El loader client-side usa `PUBLIC_META_PIXEL_ID`; el envío server-side (`src/lib/tracking/capi.ts`)
usa `META_PIXEL_ID` (cae a `PUBLIC_META_PIXEL_ID` si está vacío) + `META_CAPI_TOKEN`. Emite `Lead`
en contacto y `Schedule`/`Purchase` en el webhook de Cal.com.

1. <https://business.facebook.com/events_manager> → **Connect data sources → Web → Create Pixel**.
2. Copia el **Pixel ID** (numérico):
   - `PUBLIC_META_PIXEL_ID=<pixel id>`
   - `META_PIXEL_ID=<pixel id>`
3. **Settings → Conversions API → Generate access token**. Recomendado: System User token
   (Business Settings → Users → System users, con el píxel asignado). Copia el token →
   `META_CAPI_TOKEN`.
4. Para depurar, **Test Events** genera un **Test Event Code** (`TEST######`) →
   `META_CAPI_TEST_EVENT_CODE` (quítalo cuando termines).

### 6.2 LinkedIn Insight Tag

1. <https://www.linkedin.com/campaignmanager> → cuenta de anuncios → **Measure → Insight Tag**.
2. Copia el **Partner ID** (numérico) → `PUBLIC_LINKEDIN_PARTNER_ID`.

## 7. Email transaccional (doble opt-in)

### 7.1 Resend

Con `RESEND_API_KEY` + `EMAIL_FROM`, el lead magnet envía un correo de confirmación (doble opt-in
LSSI art. 21) con baja en un clic (`List-Unsubscribe`).

1. <https://resend.com> → **Domains → Add Domain** → `alexendros.dev`.
2. Añade en el DNS del dominio los registros **SPF** y **DKIM** que indique Resend y espera a que
   verifiquen (**Verified**).
3. **API Keys → Create API Key** con permiso _Sending access_ → copia `re_...`:
   - `RESEND_API_KEY=re_...`
   - `EMAIL_FROM=hola@alexendros.dev` (o cualquier buzón del dominio verificado)
   - `EMAIL_FROM_NAME=Alexendros`
4. URLs de confirmación/baja: `https://alexendros.dev/api/newsletter/confirm` y
   `/api/newsletter/unsubscribe` (estas rutas exigen `UNSUBSCRIBE_SECRET`, ver 7.2).

### 7.2 Secretos generados

Genera localmente y pega solo el resultado en Vercel (no lo commitees):

```bash
openssl rand -hex 32   # -> UNSUBSCRIBE_SECRET (firma HMAC de confirmación/baja)
```

`UNSUBSCRIBE_SECRET` **no debe rotarse** sin asumir que los enlaces ya enviados dejan de validar;
si rotas, reenvía confirmaciones. Úsalo en el mismo entorno donde emites el correo.

## 8. Variables de referencia

- `PUBLIC_SITE_URL=https://alexendros.dev` (informativa; el canonical se deriva de `site.url` en
  `astro.config.mjs`).
- `__IS_VERCEL__` **no es una variable de entorno**: la inyecta `vite.define` en `astro.config.mjs`
  y controla Analytics/Speed Insights de Vercel.
- `UPSTASH_*`, `SMTP_*`, `NOTION_*`, `TURNSTILE_SECRET_KEY`, `META_*`, `RESEND_*` son **runtime**;
  `PUBLIC_*` son **build-time**.

## 9. Verificación tras configurar

Sustituye el dominio por una URL de Preview para validar antes de producción.

```bash
# 1. Contacto accesible (400 = valida el body, 503 = falta SMTP/Upstash)
curl -sS -o /dev/null -w '%{http_code}\n' -X POST https://alexendros.dev/api/contact \
  -H 'Content-Type: application/json' -d '{}'

# 2. Rate limit activo (11 peticiones seguidas -> la última debe ser 429)
for i in $(seq 1 11); do
  curl -sS -o /dev/null -w '%{http_code} ' -X POST https://alexendros.dev/api/contact \
    -H 'Content-Type: application/json' -d '{}'
done; echo

# 3. Doble opt-in responde 400 con token inválido (confirma UNSUBSCRIBE_SECRET presente)
curl -sS -o /dev/null -w '%{http_code}\n' 'https://alexendros.dev/api/newsletter/confirm?token=x'

# 4. SEO y sitemap
curl -sS -o /dev/null -w '%{http_code}\n' https://alexendros.dev/sitemap-index.xml

# 5. Con consentimiento de marketing, fuerza un envío y comprueba "CAPI 200" en Events Manager
#    (usa META_CAPI_TEST_EVENT_CODE durante las pruebas).
```

Comprobaciones manuales:

- **CMP**: en una visita limpia `window.gtag`/`window.fbq` son `undefined`; tras "Aceptar analítica"
  aparece `gtag` y no `fbq`; tras "Aceptar todo", ambos (`tests/e2e/consent.spec.ts`).
- **Notion**: envía el formulario y verifica que se crea la fila con `Canal=Formulario` y, si
  aplica, `Vertical`/`Presupuesto`/`referral_code`.
- **Turnstile**: sin token en el body, con `TURNSTILE_SECRET_KEY` definido, `POST /api/contact`
  responde 400 `Captcha verification failed`.
- **Resend**: envía el lead magnet y confirma el correo de confirmación; `GET` del enlace debe
  responder 200 y `unsubscribe` dar de baja.
- **Edge Function/Serverless**: revisa **Vercel → Deployments → Functions → Logs** para ver
  `contact_sent` y errores `contact_*`.

## 10. Checklist de aceptación

- [ ] `SMTP_HOST/PORT/USER/PASS` en Production, Preview y Development (issue #13).
- [ ] `UPSTASH_REDIS_REST_URL/TOKEN` (rate limit fail-closed operativo).
- [ ] `PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY`.
- [ ] `NOTION_TOKEN` + `NOTION_LEADS_DATA_SOURCE_ID` y base compartida con la integración.
- [ ] `CAL_WEBHOOK_SECRET` con el webhook apuntando a `/api/cal/webhook`.
- [ ] `PUBLIC_COOKIE_CONSENT_VERSION` al día con el inventario de cookies.
- [ ] IDs de analítica (`PUBLIC_GA4_ID`, `PUBLIC_GTM_ID`, `PUBLIC_CLARITY_ID`, `PUBLIC_POSTHOG_KEY`,
      `PUBLIC_LINKEDIN_PARTNER_ID`) cargados y redeploy hecho.
- [ ] `META_PIXEL_ID` + `META_CAPI_TOKEN` verificados en Events Manager (modo test primero).
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` + `EMAIL_FROM_NAME` + `UNSUBSCRIBE_SECRET` con dominio verificado.
- [ ] Redeploy de Production y comprobación de Preview.

## 11. Rollback

El sistema degrada de forma segura: vaciar una variable **desactiva** su función sin romper el sitio.

- Quitar `PUBLIC_*` de tracking → los loaders no cargan scripts.
- Quitar `TURNSTILE_SECRET_KEY` → el captcha deja de exigirse (recomendado reactivarlo enseguida).
- Quitar `META_CAPI_TOKEN` → `isCapiConfigured()` es `false` y no hay envío server-side.
- Quitar `RESEND_API_KEY`/`EMAIL_FROM` → el lead magnet sigue funcionando con la notificación SMTP.
- Quitar `NOTION_TOKEN`/data source → el lead no se escribe en Notion, pero el email de contacto
  se sigue enviando.
- Quitar `UPSTASH_*` → los endpoints de contacto pasan a **503 fail-closed** (no fail-open).

## 12. Referencias

- Inventario de nombres: [`.env.example`](../../.env.example) · tipos: [`src/env.d.ts`](../../src/env.d.ts)
- GTM Server-Side: [`gtm-server-side.md`](gtm-server-side.md)
- CI y release: [`ci-release.md`](ci-release.md)
