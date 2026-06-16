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

# Enable project MCP servers (playwright) in user-level remote settings
REMOTE_SETTINGS="$HOME/.claude/remote-settings.json"
if [ ! -f "$REMOTE_SETTINGS" ] || ! grep -q '"enableAllProjectMcpServers"' "$REMOTE_SETTINGS"; then
  echo "Setting enableAllProjectMcpServers in $REMOTE_SETTINGS..."
  node -e "
    const fs = require('fs');
    const path = '$REMOTE_SETTINGS';
    const existing = fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : {};
    existing.enableAllProjectMcpServers = true;
    fs.writeFileSync(path, JSON.stringify(existing, null, 2) + '\n');
  "
fi

echo "=== Session start complete ==="
