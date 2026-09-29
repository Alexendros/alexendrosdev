#!/usr/bin/env bash
set -euo pipefail

FILE="${ENV_FILE:-.env.local}"
ENVIRONMENTS=(production preview development)
TARGET_ENVS=("${ENVIRONMENTS[@]}")
DRY_RUN=0
ONLY=()

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --only)
      ONLY+=("$2")
      shift 2
      ;;
    --envs)
      IFS=',' read -r -a TARGET_ENVS <<<"$2"
      shift 2
      ;;
    *)
      echo "Uso: $0 [--dry-run] [--only CLAVE] [--envs production,preview,development]" >&2
      exit 2
      ;;
  esac
done

[ -f "$FILE" ] || {
  echo "No existe $FILE. Ejecuta antes: node scripts/env-collect.mjs" >&2
  exit 1
}

command -v vercel >/dev/null 2>&1 || {
  echo "Falta el CLI de Vercel (npm i -g vercel) y 'vercel link' en el repo." >&2
  exit 1
}

push_key() {
  local key="$1" value="$2" environment="$3"
  if [ "$DRY_RUN" -eq 1 ]; then
    printf 'dry-run %s → %s (%s bytes)\n' "$key" "$environment" "${#value}"
    return
  fi
  vercel env rm "$key" "$environment" -y >/dev/null 2>&1 || true
  printf '%s' "$value" | vercel env add "$key" "$environment" >/dev/null
  printf 'ok %s → %s\n' "$key" "$environment"
}

while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    '' | '#'*) continue ;;
  esac
  key="${line%%=*}"
  value="${line#*=}"
  case "$key" in
    '' | *[!A-Z0-9_]*) continue ;;
  esac
  [ -n "$value" ] || continue
  if [ "${#ONLY[@]}" -gt 0 ]; then
    selected=0
    for wanted in "${ONLY[@]}"; do
      [ "$wanted" = "$key" ] && selected=1
    done
    [ "$selected" -eq 1 ] || continue
  fi
  for environment in "${TARGET_ENVS[@]}"; do
    push_key "$key" "$value" "$environment"
  done
done <"$FILE"

echo "Hecho. Redeploy para aplicar los cambios: vercel --prod"
