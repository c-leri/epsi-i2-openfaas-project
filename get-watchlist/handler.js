'use strict'

const fs = require('node:fs/promises');

module.exports = async (event, context) => {
  if (!event.body?.user?.length) {
    return context
      .status(400)
      .succeed("Missing required parameter: user");
  }

  const couchdbCredentials = await getCouchdbCredentials();

  if (!couchdbCredentials) {
    return context.fail("CouchDB credentials missing");
  }

  let db;
  try {
    db = await connectToCouchdb(couchdbCredentials);
  } catch (err) {
    return context.fail(err);
  }

  let watchlist = [];
  try {
    const doc = await db.get(event.body.user);

    if (doc.movies?.length) {
      watchlist = doc.movies;
    }
  } catch (err) {
    if (err.error === "not_found") {
      // Special error if no watchlist exist for the user
      return context
        .status(404)
        .succeed(`No watchlist found for user: ${event.body.user}`);
    } else {
      return context.fail(err);
    }
  }

  return context
    .status(200)
    .succeed(JSON.stringify(watchlist));
}

/**
 * Connect to CouchDB with the provided credentials
 * @param {{ user: string, password: string }} credentials
 * @returns The database object
 */
async function connectToCouchdb(credentials) {
  const nano = require("nano")("http://couchdb-couchdb.default.svc.cluster.local:5984");
  await nano.auth(credentials.user, credentials.password);

  try {
    // Try to create db
    await nano.db.create("watchlist");
  } catch (err) {
    if (err.error !== "file_exists") {
      // Don't throw if database already exists
      throw err;
    }
  }

  return nano.db.use("watchlist");
}

/**
 * Get CouchDB credentials from OpenFaaS secrets
 */
async function getCouchdbCredentials() {
  const user = await getSecret("couchdb-user");
  const password = await getSecret("couchdb-password");

  if (!user?.length || !password?.length) return undefined;

  return { user, password };
}

/**
 * Get an OpenFaaS secret
 * @param {string} secretName
 */
async function getSecret(secretName) {
  if (!secretName?.length) return undefined;

  try {
    return await fs.readFile(`/var/openfaas/secrets/${secretName}`, { encoding: 'utf8' });
  } catch (err) {
    return undefined;
  }
}
