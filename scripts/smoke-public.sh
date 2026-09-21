#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-https://landing.viiversion.workers.dev}"

check() {
  local url="$1"
  local marker="$2"
  local tmp
  tmp="$(mktemp)"
  local code=""
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    code="$(curl --silent --show-error --connect-timeout 10 --max-time 25 --output "$tmp" --write-out '%{http_code}' "$url" || true)"
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

check_absent() {
  local url="$1"
  local marker="$2"
  local tmp
  tmp="$(mktemp)"
  curl --silent --show-error --connect-timeout 10 --max-time 25 "$url" -o "$tmp"
  if grep -Fqi "$marker" "$tmp"; then
    echo "FAIL $url unexpectedly contains $marker" >&2
    rm -f "$tmp"
    return 1
  fi
  echo "OK $url excludes $marker"
  rm -f "$tmp"
}

# Canonical commercial architecture.
check "$BASE/" "Что можно купить для вашего бизнеса"
check "$BASE/products/" "Онлайн-бронирование"
check "$BASE/products/online-booking/" "Первый пакет"
check "$BASE/products/system-integration/" "Интеграция двух систем"
check "$BASE/industries/" "Решения по типу бизнеса"
check "$BASE/industries/tourism/" "Обычно начинают с"
check "$BASE/software/" "Proposal Studio"
check "$BASE/partners/" "Mini App Factory"
check "$BASE/enterprise/" "Сложные внутренние системы"
check "$BASE/en/" "Digital solutions for specific business tasks"
check "$BASE/sitemap.xml" "viiversion.com/products/online-booking/"

# Legacy commercial URLs must remain non-indexable compatibility pages.
check "$BASE/modules/online-booking/" "noindex,follow"
check "$BASE/modules/online-booking/" "/products/online-booking/"
check "$BASE/offers/booking-start/" "noindex,follow"
check "$BASE/offers/booking-start/" "/products/online-booking/"
check_absent "$BASE/sitemap.xml" "/modules/"
check_absent "$BASE/sitemap.xml" "/offers/"

# Real proof assets and legacy proof library stay reachable.
check "$BASE/assets/cases/max-tour.webp" ""
check "$BASE/assets/cases/uniq-smart-rent.webp" ""
check "$BASE/assets/cases/pet-nika.webp" ""
check "$BASE/prototypes.html" "PET NIKA"

# Server-side lead storage must be live.
check "$BASE/api/leads/health" '"version":"canonical-v3"'

echo "PUBLIC QA PASS: canonical products, legacy noindex routes, proof assets and lead API are reachable."
