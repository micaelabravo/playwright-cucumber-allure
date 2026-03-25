#!/usr/bin/env bash
set -euo pipefail

# Serves the latest Allure HTML report over HTTP and opens it in the browser.
# This avoids file:// issues like "404 [object Object]" caused by SPA routing/fetch.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORTS_DIR="${ROOT}/reports"

latest_dir=""
if compgen -G "${REPORTS_DIR}/allure-report-*" > /dev/null; then
  # Pick newest by modification time.
  latest_dir="$(ls -1td "${REPORTS_DIR}"/allure-report-* 2>/dev/null | head -n 1 || true)"
fi

if [ -z "${latest_dir}" ]; then
  latest_dir="${REPORTS_DIR}/allure-report"
fi

if [ ! -f "${latest_dir}/index.html" ]; then
  echo "Missing ${latest_dir}/index.html"
  echo "Generate the report first: npm run report:generate"
  exit 1
fi

cd "${latest_dir}"

PORT="${ALLURE_PORT:-0}"
PYTHON_BIN="${PYTHON_BIN:-python3}"

if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
  echo "Error: python3 not found. Install Python 3 or set PYTHON_BIN."
  exit 1
fi

# Pick a free port if ALLURE_PORT not provided.
if [ "${PORT}" = "0" ]; then
  # macOS-compatible ephemeral port selection by asking python itself.
  PORT="$("${PYTHON_BIN}" - <<'PY'
import socket
s = socket.socket()
s.bind(('', 0))
print(s.getsockname()[1])
s.close()
PY
)"
fi

URL="http://localhost:${PORT}/"

if [ "${NO_OPEN:-0}" != "1" ]; then
  if command -v open >/dev/null 2>&1; then
    # Opening the browser can sometimes fail on macOS due to unrelated system prompts (e.g. Xcode license).
    # We explicitly ignore failures so the local server still starts.
    open "${URL}" >/dev/null 2>&1 || true
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "${URL}" >/dev/null 2>&1 || true
  fi
fi

echo "Serving: ${latest_dir}"
echo "URL: ${URL}"
echo "Press Ctrl+C to stop."

exec "${PYTHON_BIN}" -m http.server "${PORT}"

