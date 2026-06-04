// ============================================================
// API LAYER — y'a rien à regarder.exe
// Connecteur vers les fonctions serverless OpenFaaS
// ============================================================

const api = (() => {
  async function post(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`[${response.status}] ${text || response.statusText}`);
    }
    return response.json();
  }

  /**
   * Recherche un film via TMDB
   * @param {string} query - Terme de recherche
   * @returns {Promise<Array>} - Liste de films
   */
  async function searchTmdb(query) {
    return post(ROUTES.searchTmdb, { query });
  }

  /**
   * Récupère la watchlist de l'utilisateur
   * @param {string} userId - UID de l'utilisateur
   * @returns {Promise<Array>} - Liste des films en watchlist
   */
  async function getWatchlist(userId) {
    return post(ROUTES.getWatchlist, { user: userId });
  }

  /**
   * Ajoute un film à la watchlist
   * @param {string} userId - UID de l'utilisateur
   * @param {string} movie - ID film
   * @returns {Promise<*>}
   */
  async function addToWatchlist(userId, movie) {
    return post(ROUTES.addToWatchlist, { user: userId, movie });
  }

  /**
   * Supprime un film de la watchlist
   * @param {string} userId - UID de l'utilisateur
   * @param {string} movie - ID film
   * @returns {Promise<*>}
   */
  async function removeFromWatchlist(userId, movie) {
    return post(ROUTES.removeFromWatchlist, { user: userId, movie });
  }

  return { searchTmdb, getWatchlist, addToWatchlist, removeFromWatchlist };
})();
