#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3003}"
HOST="${HOST:-127.0.0.1}"
RUNTIME_NODE="/Users/j.liu5uva.nl/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin"

if [[ -n "${NEDPOP_NODE_BIN:-}" && -x "${NEDPOP_NODE_BIN}/node" ]]; then
  export PATH="${NEDPOP_NODE_BIN}:$PATH"
elif [[ -x "${RUNTIME_NODE}/node" ]]; then
  export PATH="${RUNTIME_NODE}:$PATH"
fi

echo "Starting NedPop preview on http://${HOST}:${PORT}"
echo "Node: $(command -v node)"

export NEXT_PUBLIC_ENABLE_REVIEW_LOGIN="${NEXT_PUBLIC_ENABLE_REVIEW_LOGIN:-true}"
export NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK="${NEXT_PUBLIC_ENABLE_LOCAL_ACCESS_FALLBACK:-true}"

exec pnpm exec next dev --webpack -H "${HOST}" -p "${PORT}"
