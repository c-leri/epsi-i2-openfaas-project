# y'a rien à regarder.exe 🎬

Frontend serverless pour gérer sa watchlist de films. Interface CRT/VHS dark.

## Stack

- HTML/CSS/JS vanilla — zéro dépendance frontend
- Nginx Alpine pour le serving
- Docker pour le déploiement

## Fonctions serverless attendues

| Fonction               | Route                        | Body                            |
|------------------------|------------------------------|---------------------------------|
| Recherche TMDB         | `POST /search-tmdb`          | `{ "query": "..." }`            |
| Récupérer la watchlist | `POST /get-watchlist`        | `{ "user": "uid" }`             |
| Ajouter à la watchlist | `POST /add-to-watchlist`     | `{ "user": "uid", "movie": {} }`|
| Retirer de la watchlist| `POST /remove-from-watchlist`| `{ "user": "uid", "movie": {} }`|

## Lancement local

```bash
# Build et démarrage
docker compose up --build

# L'app tourne sur http://localhost:3000
```

## Configuration

La `BASE_URL` des fonctions serverless est injectée via variable d'environnement :

```bash
docker run -p 3000:80 -e BASE_URL=https://my-openfaas.example.com/function yrtarexe-frontend
```

Ou dans `docker-compose.yml` :

```yaml
environment:
  BASE_URL: "https://my-openfaas.example.com/function"
```

## Utilisateur fictif

Défini dans `src/config.js` :

```js
const CURRENT_USER = {
  uid: "usr_4x7f9b2c",
  firstName: "Jean-Michel",
  lastName: "Cinéphile",
  displayName: "Jean-Michel Cinéphile",
};
```

## Structure

```
yrtarexe/
├── src/
│   ├── index.html   # Structure HTML
│   ├── style.css    # Styles CRT/VHS
│   ├── config.js    # Utilisateur + routes API
│   ├── api.js       # Couche appels serverless
│   └── app.js       # Logique applicative
├── nginx.conf       # Config nginx
├── entrypoint.sh    # Injection BASE_URL
├── Dockerfile
└── docker-compose.yml
```
