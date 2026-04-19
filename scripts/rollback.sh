#!/bin/bash
set -euo pipefail

echo "Iniciando ROLLBACK del sistema CobriXS..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"
git checkout HEAD~1

cd "$ROOT/infra"
docker compose down
docker compose up --build -d

echo "Rollback completado correctamente"
