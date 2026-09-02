#!/usr/bin/env bash
set -euo pipefail

check() {
  local url="$1"
  local marker="$2"
  local tmp
  tmp="$(mktemp)"
  local code=""
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    code="$(curl -L --silent --show-error --connect-timeout 10 --max-time 25 --output "$tmp" --write-out '%{http_code}' "$url" || true)"
    if [[ "$code" == "200" ]] && [[ -s "$tmp" ]]; then
      if [[ -z "$marker" ]] || grep -Fqi "$marker" "$tmp"; then
        echo "OK $url HTTP 200"
        rm -f "$tmp"
        return 0
      fi
    fi
    sleep 3
  done
  echo "FAIL $url HTTP ${code:-none} marker=$marker" >&2
  rm -f "$tmp"
  return 1
}

# VIIVERSION main, prototype library and case pages
check "https://landing.viiversion.workers.dev/" "VIIVERSION"
check "https://landing.viiversion.workers.dev/prototypes.html" "PET NIKA"
check "https://landing.viiversion.workers.dev/prototypes.html" "UNIQ SMART RENT"
check "https://landing.viiversion.workers.dev/cases/pet-nika.html" "PET NIKA"
check "https://landing.viiversion.workers.dev/cases/uniq-smart-rent.html" "UNIQ SMART RENT"

# PET NIKA current public routes
check "https://pet-nika.mirozdanie6v.workers.dev/" "PET NIKA"
check "https://pet-nika.mirozdanie6v.workers.dev/miniapp" "PET NIKA"

# UNIQ SMART RENT current public app
check "https://uniq-smart-rent.mirozdanie6v.workers.dev/" "UNIQ"

echo "PUBLIC QA PASS: VIIVERSION main/prototypes/cases, PET NIKA and UNIQ SMART RENT routes are reachable."
