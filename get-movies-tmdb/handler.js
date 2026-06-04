'use strict'

const fs = require('node:fs/promises');

module.exports = async (event, context) => {
  if (!event.body?.movies?.length) {
    return context
      .status(400)
      .succeed("Missing required parameter: movies");
  }

  const tmdbAccessToken = await getTmdbAccessToken();

  if (!tmdbAccessToken) {
    return context.fail("Missing TMDB access token");
  }

  const result = await getMovies(tmdbAccessToken, event.body.movies);

  return context
    .status(200)
    .succeed(JSON.stringify(result));
}

/**
 * Get TMDB access token from OpenFaaS secret
 */
async function getTmdbAccessToken() {
  try {
    return await fs.readFile('/var/openfaas/secrets/tmdb-access-token', { encoding: 'utf8' });
  } catch (err) {
    return undefined;
  }
}

/**
 * Get movies details from TMDB
 * @param {string} tmdbAccessToken 
 * @param {string[]} movies 
 */
async function getMovies(tmdbAccessToken, movies) {
  const results = await Promise.all(movies.map(
    movie => {
          return getMovie(tmdbAccessToken, movie);
      }
  ));

  return results.filter(movie => movie && movie.success !== false);
}

/**
 * Get movie details from TMDB
 * @param {string} tmdbAccessToken 
 * @param {string} movie 
 */
async function getMovie(tmdbAccessToken, movie) {
  // Build url with query
  const url = new URL(`${process.env.TMDB_API_URL}/movie/${movie}`);

  // Build headers with access token
  const headers = {
    accept: 'application/json',
    'Authorization': `Bearer ${tmdbAccessToken}`,
  };

  try {
    // Call TMDB
    return await fetch(url, {
      method: 'GET',
      headers,
    })
      .then(res => res.json());
  } catch (err) {
    console.error("TMDB request failed:", err);
    return undefined;
  }
}
