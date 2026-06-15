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

# Ensure @playwright/mcp is installed locally
if ! [ -f node_modules/.bin/playwright-mcp ] 2>/dev/null; then
  echo "Installing @playwright/mcp..."
  npm install -D @playwright/mcp@latest 2>/dev/null || true
fi

# Install Playwright browser binaries (requires cdn.playwright.dev in network egress allowlist)
if npx playwright install chromium 2>/dev/null; then
  echo "Playwright chromium installed successfully"
else
  echo "WARNING: Could not install Playwright chromium."
  echo "To fix: add 'cdn.playwright.dev' to your network egress allowlist at code.claude.com/environments"
  echo "Pipeline will work without browser automation (search + cover letters only)"
fi

echo "=== Session start complete ==="
