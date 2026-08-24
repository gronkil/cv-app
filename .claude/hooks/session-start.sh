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

echo "=== Session start complete ==="
