#!/usr/bin/env bash
# Enlaces rotos sobre el build estático: arranca un servidor efímero,
# ejecuta linkinator en recursivo (solo URLs locales) y lo apaga.
# Uso: pnpm build && pnpm check:links
set -euo pipefail

ROOT="${SMOKE_ROOT:-.vercel/output/static}"
PORT="${LINKS_PORT:-4322}"
BASE="http://127.0.0.1:${PORT}"

if [[ ! -d "$ROOT" ]]; then
  echo "error: no existe ${ROOT}. Ejecuta pnpm build antes." >&2
  exit 1
fi

npx serve "$ROOT" -l "$PORT" --no-clipboard >/dev/null 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 30); do
  if curl -sf -o /dev/null "$BASE/"; then break; fi
  sleep 0.5
done

# --skip: solo se verifican URLs del servidor local (las externas ya se
# validaron en la auditoría 2026-09-28; en CI serían flaky).
linkinator "$BASE" --recurse --skip "^(?!http://127\\.0\\.0\\.1:${PORT})"
