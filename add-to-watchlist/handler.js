'use strict'

const fs = require('node:fs/promises');

module.exports = async (event, context) => {
  if (!event.body?.user?.length) {
    return context
      .status(400)
      .succeed("Missing required parameter: user");
  }

  if (!event.body?.movie?.length) {
    return context
      .status(400)
      .succeed("Missing required parameter: movie");
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

  try {
    await addMovieToWatchlist(db, event.body.user, event.body.movie);
  } catch (err) {
    return context.fail(err);
  }

  let watchlist = [];
  try {
    watchlist = await getWatchlist(event.body.user);
  } catch (err) {
    return context.fail(err);
  }

  return context
    .status(200)
    .succeed(JSON.stringify(watchlist));
}

/**
 * Get the provided user's watchlist from the get-watchlist function
 * @param {string} user
 */
async function getWatchlist(user) {
  const url = new URL(process.env.GET_WATCHLIST_URL);

  const headers = {
    "Content-Type": "application/json"
  };

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ user: user }),
  });

  // Throw an error if the request didn't succeed
  if (res.status >= 400) {
    throw new Error(await res.text());
  }

  return await res.json();
}

/**
 * @param {string} user
 * @param {string} movie
 */
async function addMovieToWatchlist(db, user, movie) {
  try {
    const doc = await db.get(user);

    // Add movie to document's movies if it isn't already in there
    const movies = doc.movies ?? [];
    if (!movies.includes(movie)) {
      await db.insert({ _id: user, _rev: doc._rev, movies: [...movies, movie] });
    }
  } catch (err) {
    if (err.error === "not_found") {
      // Document doesn't exist, create it
      await db.insert({ _id: user, movies: [movie] });
    } else {
      throw err;
    }
  }
}

/**
 * Connect to CouchDB with the provided credentials
 * @param {{ user: string, password: string }} credentials
 * @returns The database object
 */
async function connectToCouchdb(credentials) {
  const nano = require("nano")(process.env.COUCHDB_URL);
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
