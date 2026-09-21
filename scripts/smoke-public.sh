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

BASE="https://landing.viiversion.workers.dev"

# New product architecture
check "$BASE/" "Product × Industry"
check "$BASE/products/" "Продуктовые ядра VIIVERSION"
check "$BASE/products/booking/" "Booking Start"
check "$BASE/products/paybridge/" "PayBridge"
check "$BASE/industries/" "Отраслевые конфигурации"
check "$BASE/industries/tourism/" "Booking Start"
check "$BASE/solutions/" "Решения вокруг конкретной бизнес-задачи"
check "$BASE/cases/" "Кейсы как доказательство"
check "$BASE/enterprise/" "Paid Discovery"
check "$BASE/labs/" "Собственные продукты VIIVERSION"
check "$BASE/sitemap.xml" "viiversion.com/products/"

# Legacy proof library must remain reachable.
check "$BASE/prototypes.html" "PET NIKA"
check "$BASE/prototypes.html" "UNIQ SMART RENT"
check "$BASE/cases/pet-nika.html" "PET NIKA"
check "$BASE/cases/uniq-smart-rent.html" "UNIQ SMART RENT"

# External demos used as proof.
check "https://pet-nika.viiversion.com/" "PET NIKA"
check "https://uniq-smart-rent.mirozdanie6v.workers.dev/" "UNIQ"

echo "PUBLIC QA PASS: product architecture, legacy proof pages and verified demos are reachable."
