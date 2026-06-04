# ============================================================
# Dockerfile — y'a rien à regarder.exe
# Image légère nginx pour servir le frontend statique
# ============================================================

FROM nginx:1.25-alpine

# Copie la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie les sources du frontend
COPY src/ /usr/share/nginx/html/

# Copie et configure l'entrypoint (injection de BASE_URL)
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
