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

# Start playwright-mcp as HTTP server (port 3456) so it's ready before MCP connects
if ! curl -sf http://localhost:3456/mcp > /dev/null 2>&1; then
  echo "Starting playwright-mcp HTTP server on port 3456..."
  /opt/node22/bin/playwright-mcp \
    --browser chromium \
    --executable-path /opt/pw-browsers/chromium-1194/chrome-linux/chrome \
    --headless \
    --port 3456 \
    > /tmp/playwright-mcp.log 2>&1 &
  # Wait up to 5s for it to be ready
  for i in 1 2 3 4 5; do
    sleep 1
    if curl -sf http://localhost:3456/mcp > /dev/null 2>&1; then
      echo "playwright-mcp ready on port 3456"
      break
    fi
  done
else
  echo "playwright-mcp already running on port 3456"
fi

echo "=== Session start complete ==="
