// ============================================================
// CONFIGURATION — y'a rien à regarder.exe
// ============================================================

// Utilisateur fictif connecté
const CURRENT_USER = {
  uid: "usr_4x7f9b2c",
  firstName: "Jean-Michel",
  lastName: "Cinéphile",
  displayName: "Jean-Michel Cinéphile",
};

// Base URL des fonctions serverless
const BASE_URL = `${location.origin}/function`;

// Routes serverless
const ROUTES = {
  searchTmdb:          `${BASE_URL}/search-tmdb`,
  addToWatchlist:      `${BASE_URL}/add-to-watchlist`,
  removeFromWatchlist: `${BASE_URL}/remove-from-watchlist`,
  getWatchlist:        `${BASE_URL}/get-watchlist`,
};
