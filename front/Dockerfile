# ============================================================
# Dockerfile — y'a rien à regarder.exe
# Image légère nginx pour servir le frontend statique
# ============================================================

FROM nginx:1.25-alpine

# Copie les sources du frontend
COPY src/ /usr/share/nginx/html/

# Copie la config nginx
COPY nginx.conf.template /nginx.conf.template

EXPOSE 80

CMD ["/bin/sh" , "-c" , "envsubst '$OPENFAAS_GATEWAY_URL' < /nginx.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]
