#!/bin/bash
set -euo pipefail

echo "DESPLIEGUE A PRODUCCIÓN COBRIXS..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$ROOT"
git pull origin main

cd "$ROOT/infra"
docker compose down
docker compose up --build -d

echo "Producción actualizada correctamente"
