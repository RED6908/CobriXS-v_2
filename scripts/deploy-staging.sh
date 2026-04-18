#!/bin/bash

echo "Desplegando a ENTORNO DE PRUEBAS (STAGING)..."

# Detener contenedores anteriores
docker-compose down

# Construir y levantar nueva versión
docker-compose up --build -d

echo "Despliegue en staging completado correctamente"