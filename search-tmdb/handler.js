'use strict'

module.exports = async (event, context) => {
  const fs = require('node:fs');

  // Get TMDB access token from openfaas secret
  let tmdbAccessToken;
  try {
    tmdbAccessToken = fs.readFileSync('/var/openfaas/secrets/tmdb-access-token', 'utf8');
  } catch (err) {
    return context.status(500);
  }

  // Build url with query
  const url = new URL('https://api.themoviedb.org/3/search/movie');
  url.searchParams.set('include_adult', 'true');
  url.searchParams.set('language', 'fr-FR');
  url.searchParams.set('page', 1);
  url.searchParams.set('query', event.body.query ?? '');

  // Build headers with access token
  const headers = {
    accept: 'application/json',
    'Authorization': `Bearer ${tmdbAccessToken}`,
  };

  // Call TMDB
  const res = await fetch(url, {
    method: 'GET',
    headers,
  })
  .then(res => res.json());

  const result = JSON.stringify(res.results?.map(m => m.title));

  return context
    .status(200)
    .succeed(result);
}
