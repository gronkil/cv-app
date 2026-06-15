#!/bin/bash
set -euo pipefail

# Only run in remote (web) sessions — local CLI handles this natively
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

echo "=== Session start: installing dependencies ==="

cd "$CLAUDE_PROJECT_DIR"

# Install project dependencies
npm install

# Playwright MCP uses pre-installed Chromium at /opt/pw-browsers/chromium-1194/
# No download needed — configured via --executable-path in settings.json

echo "=== Session start complete ==="
