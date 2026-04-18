#!/bin/bash

echo "Iniciando ROLLBACK del sistema CobriXS..."

# Regresar a la versión anterior del código
git checkout HEAD~1

# Detener contenedores actuales
docker-compose down

# Levantar versión anterior estable
docker-compose up --build -d

echo "Rollback completado correctamente"