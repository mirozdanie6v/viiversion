#!/usr/bin/env bash
set -euo pipefail

cat site.xz.b64.* | base64 -d > site.tar.xz
xz -dc site.tar.xz > site.tar
rm -rf public
mkdir -p public
tar -xf site.tar -C public

for file in \
  public/index.html \
  public/prototypes.html \
  public/cases/ave-clinic.html \
  public/cases/pet-nika.html \
  public/cases/true-surf.html \
  public/cases/gbeauty.html; do
  test -f "$file"
done

echo "VIIVERSION landing restored successfully."
