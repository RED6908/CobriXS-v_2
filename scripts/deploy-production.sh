#!/bin/bash

echo "DESPLIEGUE A PRODUCCIÓN COBRIXS..."

git pull origin main

docker-compose down
docker-compose up --build -d

echo "Producción actualizada correctamente"