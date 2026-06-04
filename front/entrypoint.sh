#!/bin/sh
# Injecte la variable d'environnement BASE_URL dans le frontend au démarrage
# Utilisation : docker run -e BASE_URL=https://my-openfaas.example.com/function ...

TARGET=/usr/share/nginx/html/config.js
BASE_URL="${BASE_URL:-http://127.0.0.1:8080/function}"

# Remplace la valeur de BASE_URL dans config.js
sed -i "s|http://127.0.0.1:8080/function|${BASE_URL}|g" "$TARGET"

echo "[entrypoint] BASE_URL set to: ${BASE_URL}"

exec nginx -g "daemon off;"
