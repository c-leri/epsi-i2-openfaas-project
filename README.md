# OpenFaaS Project - Watchlist

## Requirements

### TMDB API Access Key

You will need to create a TMDB account and get an api access key by creating an application [here](https://www.themoviedb.org/settings/api).

## Setup

### Install CouchDB

```sh
helm repo add couchdb https://apache.github.io/couchdb-helm
helm install couchdb \
  --version=4.6.3 \
  --set couchdbConfig.couchdb.uuid=$(uuidgen) \
  couchdb/couchdb --wait
kubectl exec --namespace default -it couchdb-couchdb-0 -c couchdb -- \
  curl -s \
  http://127.0.0.1:5984/_cluster_setup \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"action": "finish_cluster"}' \
  -u "$(kubectl get secret couchdb-couchdb -o go-template='{{ .data.adminUsername }}' | base64 --decode):$(kubectl get secret couchdb-couchdb -o go-template='{{ .data.adminPassword }}' | base64 --decode)"
```

### Create secrets

```sh
echo "<TMDB_ACCESS_KEY>" | faas-cli secret create tmdb-access-token
kubectl get secret couchdb-couchdb -o go-template='{{ .data.adminUsername }}' \
  | base64 --decode \
  | faas-cli secret create couchdb-user
kubectl get secret couchdb-couchdb -o go-template='{{ .data.adminPassword }}' \
  | base64 --decode \
  | faas-cli secret create couchdb-password
```

### Front

Go into `./front` directory and launch the front with docker compose: `docker compose up`.
It will then be then be available at <http://127.0.0.1:80>.
