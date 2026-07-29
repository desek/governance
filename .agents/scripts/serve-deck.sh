#!/usr/bin/env bash
#
# Serves the committed deck page at docs/deck/ over HTTP.
#
# The deck cannot be opened as a file. open-slide builds a single-page app on
# React Router's BrowserRouter, which routes by URL path; a file:// document has
# origin "null", and Chrome refuses any path-changing pushState or replaceState
# there with a SecurityError. So the app can never reach /s/<slide> from a
# file:// URL and always lands on its not-found page. That is a property of the
# framework, not of how the page is built, and no build flag changes it.
#
# Serving it over HTTP costs one command and works everywhere, which is what
# this script is for.
#
# Usage:
#   .agents/scripts/serve-deck.sh [PORT]
#
# Parameters:
#   PORT  Port to listen on. Defaults to 8080.
#
# @agents-index Serves the committed deck page over HTTP, since file:// cannot route it.

set -euo pipefail

PORT="${1:-8080}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DECK_DIR="${REPO_ROOT}/docs/deck"
SLIDE_ID="checkpoint-distill"

if [[ ! -f "${DECK_DIR}/index.html" ]]; then
  echo "error: no built page at ${DECK_DIR}/index.html" >&2
  echo "       build it with: cd deck && npm run build:single" >&2
  exit 1
fi

echo "deck  → http://127.0.0.1:${PORT}/s/${SLIDE_ID}"
echo "video → ${DECK_DIR}/${SLIDE_ID}.mp4"
echo "ctrl-c to stop"

# Every unknown path falls back to index.html so client-side routes resolve,
# which is what any static host serving a single-page app does.
exec npx --yes serve --single --listen "${PORT}" "${DECK_DIR}"
