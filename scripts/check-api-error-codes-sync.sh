#!/usr/bin/env sh
set -eu

# Needs jobhound_core checked out next to this repo (or JOBHOUND_CORE_DIR set).
committed="app/types/generated/apiErrorCodes.ts"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

pnpm gen:api-error-codes --out "$tmp" >/dev/null

if ! diff -u "$committed" "$tmp/apiErrorCodes.ts"; then
  echo "API error codes are out of sync with jobhound_core. Run: pnpm gen:api-error-codes"
  exit 1
fi
