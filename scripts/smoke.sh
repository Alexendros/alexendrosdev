#!/usr/bin/env bash
# Smoke del sitio estático (sin Playwright). Usado por el job CI `smoke`.
set -euo pipefail

ROOT="${SMOKE_ROOT:-.vercel/output/static}"
PORT="${SMOKE_PORT:-4321}"
BASE="http://127.0.0.1:${PORT}"

if [[ ! -d "$ROOT" ]]; then
  echo "error: no existe ${ROOT}. Ejecuta pnpm build antes." >&2
  exit 1
fi

required_files=(
  index.html
  servicios/index.html
  proyectos/index.html
  contacto/index.html
  como-trabajo/index.html
)

for rel in "${required_files[@]}"; do
  if [[ ! -f "${ROOT}/${rel}" ]]; then
    echo "error: falta ${ROOT}/${rel}" >&2
    exit 1
  fi
done

echo "archivos estáticos OK (${#required_files[@]} rutas)"

mapfile -t html_files < <(find "$ROOT" -type f -name '*.html')
if (( ${#html_files[@]} == 0 )); then
  echo "error: no se encontraron .html en ${ROOT}" >&2
  exit 1
fi

tracker_patterns=(
  'googletagmanager\.com'
  'google-analytics\.com'
  'connect\.facebook\.net'
  'clarity\.ms'
  'i\.posthog\.com'
  'posthog\.(com|init)'
  'snap\.licdn\.com'
  'gtag\('
  'fbq\('
)

for pattern in "${tracker_patterns[@]}"; do
  if hits=$(grep -rlE "$pattern" "${html_files[@]}"); then
    echo "error: tracker/píxel estático (/${pattern}/) inyectado en:" >&2
    echo "$hits" >&2
    exit 1
  fi
done

echo "sin trackers estáticos OK (${#html_files[@]} .html)"

if ! command -v python3 >/dev/null 2>&1; then
  echo "error: python3 es necesario para el smoke HTTP" >&2
  exit 1
fi

python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT" >/tmp/alexendros-smoke-http.log 2>&1 &
server_pid=$!
cleanup() {
  kill "$server_pid" >/dev/null 2>&1 || true
}
trap cleanup EXIT

for _ in $(seq 1 20); do
  if curl -fsS -o /dev/null "$BASE/" 2>/dev/null; then
    break
  fi
  sleep 0.25
done

routes=(/ /servicios/ /proyectos/ /contacto/ /como-trabajo/)
for path in "${routes[@]}"; do
  code=$(curl -fsS -o /tmp/alexendros-smoke-body.html -w '%{http_code}' "${BASE}${path}")
  if [[ "$code" != "200" ]]; then
    echo "error: ${path} → HTTP ${code}" >&2
    exit 1
  fi
  if ! grep -qi 'alexendros' /tmp/alexendros-smoke-body.html; then
    echo "error: ${path} no contiene la marca alexendros" >&2
    exit 1
  fi
  echo "HTTP 200 ${path}"
done

echo "smoke OK"
