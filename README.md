# OpenFaaS Project - Watchlist

## Setup

### Install CouchDB

```sh
helm repo add couchdb https://apache.github.io/couchdb-helm
helm install couchdb \
  --version=4.6.3 \
  --set couchdbConfig.couchdb.uuid=$(uuidgen) \
  couchdb/couchdb
```

### Create secrets

```sh
echo "<TMDB_ACCESS_KEY>" | faas-cli secret create tmdb-access-token
kubectl get secret couchdb-couchdb -o go-template='{{ .data.adminUsername }}' | base64 --decode | faas-cli secret create couchdb-user
kubectl get secret couchdb-couchdb -o go-template='{{ .data.adminPassword }}' | base64 --decode | faas-cli secret create couchdb-password
```
