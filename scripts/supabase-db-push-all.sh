#!/usr/bin/env bash
# Push migrations to one or more remote Supabase projects.
# The Next.js app uses NEXT_PUBLIC_SUPABASE_URL — the CLI "linked" ref in
# supabase/.temp/ must match that host, or `db push` updates the wrong database.
#
# Usage:
#   npm run supabase:db:push
#       → links SUPABASE_APP_PROJECT_REF (default: see package.json supabase:link), then db push
#
#   SUPABASE_EXTRA_PROJECT_REFS=otherref,anotherref npm run supabase:db:push:all
#       → same, then link + push each extra ref (comma-separated)

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

trim() {
  local s="$1"
  s="${s#"${s%%[![:space:]]*}"}"
  s="${s%"${s##*[![:space:]]}"}"
  printf '%s' "$s"
}

APP_REF="${SUPABASE_APP_PROJECT_REF:-ucoomilccfdybcywqnoq}"

echo "==> supabase link --project-ref ${APP_REF} && supabase db push"
npx supabase link --project-ref "${APP_REF}" --yes
npx supabase db push

if [ -n "${SUPABASE_EXTRA_PROJECT_REFS:-}" ]; then
  IFS=',' read -r -a extras <<< "${SUPABASE_EXTRA_PROJECT_REFS}"
  for ref in "${extras[@]}"; do
    ref="$(trim "${ref}")"
    [ -z "${ref}" ] && continue
    if [ "${ref}" = "${APP_REF}" ]; then
      echo "==> skip duplicate ref ${ref}"
      continue
    fi
    echo "==> supabase link --project-ref ${ref} && supabase db push"
    npx supabase link --project-ref "${ref}" --yes
    npx supabase db push
  done
  echo "==> re-link CLI to app ref ${APP_REF} (matches NEXT_PUBLIC_SUPABASE_URL)"
  npx supabase link --project-ref "${APP_REF}" --yes
fi
