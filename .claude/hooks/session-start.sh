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

# Ensure @playwright/mcp is available globally (uses pre-installed Chromium at /opt/pw-browsers)
if ! which playwright-mcp &>/dev/null; then
  echo "Installing @playwright/mcp globally..."
  npm install -g @playwright/mcp@latest
fi

echo "=== Session start complete ==="
