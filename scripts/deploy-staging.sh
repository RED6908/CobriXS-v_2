#!/bin/bash
set -euo pipefail

echo "Desplegando a ENTORNO DE PRUEBAS (STAGING)..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT/infra"

docker compose down
docker compose up --build -d

echo "Despliegue en staging completado correctamente"
