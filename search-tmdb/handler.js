'use strict'

const fs = require('node:fs/promises');

module.exports = async (event, context) => {
  const tmdbAccessToken = await getTmdbAccessToken();

  if (!tmdbAccessToken) {
    return context.fail("Missing TMDB access token");
  }

  const result = await searchMovies(tmdbAccessToken, {
    query: event.body.query ?? '',
  });

  if (!result && result.success === false) {
    return context.fail(result?.status_message ?? 'An error occured while querying TMDB');
  }

  return context
    .status(200)
    .succeed(JSON.stringify(result.results));
}

/**
 * Get TMDB access token from openfaas secret
 */
async function getTmdbAccessToken() {
  try {
    return await fs.readFile('/var/openfaas/secrets/tmdb-access-token', { encoding: 'utf8' });
  } catch (err) {
    return undefined;
  }
}

/**
 * Search movies on TMDB
 * @param {string} tmdbAccessToken 
 * @param {{ query: string }} params 
 */
async function searchMovies(tmdbAccessToken, params) {
  // Build url with query
  const url = new URL('https://api.themoviedb.org/3/search/movie');
  url.searchParams.set('include_adult', 'true');
  url.searchParams.set('language', 'fr-FR');
  url.searchParams.set('page', 1);
  url.searchParams.set('query', params.query);

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
