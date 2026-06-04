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
// Remplacer par l'URL réelle en production via variable d'env ou config
const BASE_URL = window.ENV_BASE_URL || "http://127.0.0.1:8080/function";

// Routes serverless
const ROUTES = {
  searchTmdb:        `${BASE_URL}/search-tmdb`,
  addToWatchlist:    `${BASE_URL}/add-to-watchlist`,
  removeFromWatchlist: `${BASE_URL}/remove-from-watchlist`,
  getWatchlist:      `${BASE_URL}/get-watchlist`,
};
