#!/usr/bin/env bash
set -euo pipefail

# Runs a JS script using `node` or `nodejs`, whichever exists in PATH.
# This makes npm scripts more portable across machines where `node` isn't on PATH.

BIN=""
if command -v node >/dev/null 2>&1; then
  BIN="$(command -v node)"
elif command -v nodejs >/dev/null 2>&1; then
  BIN="$(command -v nodejs)"
fi

if [ -z "${BIN}" ]; then
  echo "Error: neither \`node\` nor \`nodejs\` was found in PATH."
  echo "Install Node.js 18+ (e.g. via nvm or brew) and retry."
  exit 1
fi

"${BIN}" "$@"

