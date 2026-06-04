// ============================================================
// APP — y'a rien à regarder.exe
// ============================================================

(function () {
  // ── State ──────────────────────────────────────────────────
  let watchlist = [];   // films dans la watchlist (tableau d'objets)
  let searchResults = []; // résultats de la dernière recherche

  // ── DOM refs ───────────────────────────────────────────────
  const $bootScreen    = document.getElementById("bootScreen");
  const $app           = document.getElementById("app");
  const $userName      = document.getElementById("userName");
  const $userUid       = document.getElementById("userUid");
  const $statusDot     = document.getElementById("statusDot");
  const $statusText    = document.getElementById("statusText");
  const $searchInput   = document.getElementById("searchInput");
  const $searchBtn     = document.getElementById("searchBtn");
  const $resultsList   = document.getElementById("resultsList");
  const $resultsEmpty  = document.getElementById("resultsEmpty");
  const $watchlistList = document.getElementById("watchlistList");
  const $watchlistEmpty= document.getElementById("watchlistEmpty");
  const $watchlistCount= document.getElementById("watchlistCount");
  const $toastContainer= document.getElementById("toastContainer");

  // ── Boot ───────────────────────────────────────────────────
  function boot() {
    // Affichage utilisateur
    $userName.textContent = CURRENT_USER.displayName.toUpperCase();
    $userUid.textContent  = CURRENT_USER.uid;

    // Skip boot on click or after 4s
    const dismiss = () => showApp();
    $bootScreen.addEventListener("click", dismiss);
    $bootScreen.addEventListener("keydown", dismiss);
    setTimeout(dismiss, 4200);
  }

  function showApp() {
    if ($app.style.display !== "none") return;
    $bootScreen.style.transition = "opacity 0.5s";
    $bootScreen.style.opacity = "0";
    setTimeout(() => {
      $bootScreen.style.display = "none";
      $app.style.display = "flex";
      loadWatchlist();
    }, 500);
  }

  // ── Status indicator ───────────────────────────────────────
  function setStatus(state, text) {
    $statusDot.className  = `status-dot ${state}`;
    $statusText.textContent = text.toUpperCase();
  }

  // ── Watchlist ──────────────────────────────────────────────
  async function loadWatchlist() {
    setStatus("loading", "LOADING...");
    try {
      const data = await api.getWatchlist(CURRENT_USER.uid);
      // Normalize: l'API peut retourner {movies:[...]}, [...], etc.
      watchlist = normalizeMovieList(data);
      renderWatchlist();
      setStatus("success", "READY");
      // Re-render search results pour mettre à jour les boutons add/remove
      if (searchResults.length > 0) renderSearchResults();
    } catch (err) {
      setStatus("error", "ERROR");
      toast(`Erreur watchlist: ${err.message}`, "error");
      console.error("[watchlist]", err);
    }
  }

  function renderWatchlist() {
    $watchlistCount.textContent = watchlist.length;
    if (watchlist.length === 0) {
      $watchlistEmpty.style.display = "flex";
      $watchlistList.innerHTML = "";
      return;
    }
    $watchlistEmpty.style.display = "none";
    $watchlistList.innerHTML = "";
    watchlist.forEach((movie, i) => {
      const card = buildWatchlistCard(movie, i);
      $watchlistList.appendChild(card);
    });
  }

  function buildWatchlistCard(movie, index) {
    const card = document.createElement("div");
    card.className = "wl-card";
    card.style.animationDelay = `${index * 0.04}s`;

    const id = getMovieId(movie);
    const title = movie.title || movie.name || "Sans titre";
    const year  = movie.year || movie.release_date?.slice(0, 4) || "";
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
      : null;

    if (poster) {
      const img = document.createElement("img");
      img.className = "wl-poster";
      img.src = poster;
      img.alt = title;
      img.onerror = () => img.replaceWith(posterPlaceholder());
      card.appendChild(img);
    } else {
      card.appendChild(posterPlaceholder());
    }

    const titleStatic = document.createElement("div");
    titleStatic.className = "wl-title-static";
    titleStatic.textContent = title;
    card.appendChild(titleStatic);

    const overlay = document.createElement("div");
    overlay.className = "wl-overlay";
    overlay.innerHTML = `
      <div class="wl-title">${escHtml(title)}</div>
      ${year ? `<div class="wl-year">${year}</div>` : ""}
      <button class="wl-remove-btn" data-id="${escHtml(String(id))}">✕ RETIRER</button>
    `;
    overlay.querySelector(".wl-remove-btn").addEventListener("click", () => handleRemove(movie));
    card.appendChild(overlay);

    return card;
  }

  // ── Search ─────────────────────────────────────────────────
  async function handleSearch() {
    const query = $searchInput.value.trim();
    if (!query) return;

    setStatus("loading", "SEARCHING...");
    $searchBtn.classList.add("loading");
    $searchBtn.querySelector(".search-btn-text").textContent = "RUN";

    try {
      const data = await api.searchTmdb(query);
      searchResults = normalizeMovieList(data);
      renderSearchResults();
      setStatus("success", "READY");
      toast(`${searchResults.length} résultat(s) trouvé(s)`, "info");
    } catch (err) {
      setStatus("error", "ERROR");
      toast(`Erreur recherche: ${err.message}`, "error");
      console.error("[search]", err);
    } finally {
      $searchBtn.classList.remove("loading");
    }
  }

  function renderSearchResults() {
    $resultsList.innerHTML = "";
    if (searchResults.length === 0) {
      $resultsEmpty.style.display = "flex";
      $resultsEmpty.querySelector(".empty-text").textContent = "AUCUN RÉSULTAT";
      return;
    }
    $resultsEmpty.style.display = "none";
    searchResults.forEach((movie, i) => {
      const card = buildResultCard(movie, i);
      $resultsList.appendChild(card);
    });
  }

  function buildResultCard(movie, index) {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.style.animationDelay = `${index * 0.04}s`;

    const id = getMovieId(movie);
    const title = movie.title || movie.name || "Sans titre";
    const year  = movie.year || movie.release_date?.slice(0, 4) || "";
    const type  = movie.media_type === "tv" ? "SÉRIE" : "FILM";
    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
      : null;

    if (poster) {
      const img = document.createElement("img");
      img.className = "movie-poster";
      img.src = poster;
      img.alt = title;
      img.onerror = () => img.replaceWith(miniPlaceholder());
      card.appendChild(img);
    } else {
      card.appendChild(miniPlaceholder());
    }

    const info = document.createElement("div");
    info.className = "movie-info";
    info.innerHTML = `
      <div class="movie-title">${escHtml(title)}</div>
      <div class="movie-meta">${year ? year + " · " : ""}${type}</div>
    `;
    card.appendChild(info);

    const inWL = isInWatchlist(id);

    // Indicateur watchlist
    if (inWL) {
      const dot = document.createElement("div");
      dot.className = "in-watchlist-indicator";
      card.appendChild(dot);
    }

    const btn = document.createElement("button");
    if (inWL) {
      btn.className = "card-btn remove";
      btn.textContent = "✕ RETIRER";
      btn.addEventListener("click", () => handleRemove(movie, card, btn));
    } else {
      btn.className = "card-btn add";
      btn.textContent = "+ AJOUTER";
      btn.addEventListener("click", () => handleAdd(movie, card, btn));
    }
    card.appendChild(btn);

    return card;
  }

  // ── Watchlist actions ──────────────────────────────────────
  async function handleAdd(movie, card, btn) {
    btn.disabled = true;
    btn.textContent = "...";
    setStatus("loading", "ADDING...");
    try {
      await api.addToWatchlist(CURRENT_USER.uid, getMovieId(movie));
      // Optimistic update
      if (!isInWatchlist(getMovieId(movie))) watchlist.push(movie);
      renderWatchlist();
      renderSearchResults(); // refresh buttons
      setStatus("success", "READY");
      toast(`"${movie.title || movie.name}" ajouté à la watchlist`, "success");
    } catch (err) {
      setStatus("error", "ERROR");
      toast(`Erreur: ${err.message}`, "error");
      btn.disabled = false;
      btn.className = "card-btn add";
      btn.textContent = "+ AJOUTER";
    }
  }

  async function handleRemove(movie, card, btn) {
    setStatus("loading", "REMOVING...");
    if (btn) { btn.disabled = true; btn.textContent = "..."; }
    try {
      await api.removeFromWatchlist(CURRENT_USER.uid, getMovieId(movie));
      // Optimistic update
      const id = getMovieId(movie);
      watchlist = watchlist.filter(m => getMovieId(m) !== id);
      renderWatchlist();
      renderSearchResults();
      setStatus("success", "READY");
      toast(`"${movie.title || movie.name}" retiré de la watchlist`, "info");
    } catch (err) {
      setStatus("error", "ERROR");
      toast(`Erreur: ${err.message}`, "error");
      if (btn) { btn.disabled = false; }
    }
  }

  // ── Helpers ────────────────────────────────────────────────
  function normalizeMovieList(data) {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && Array.isArray(data.movies)) return data.movies;
    if (data && Array.isArray(data.watchlist)) return data.watchlist;
    return [];
  }

  function getMovieId(movie) {
    return movie.id + "";
  }

  function isInWatchlist(id) {
    return watchlist.some(m => getMovieId(m) === id);
  }

  function posterPlaceholder() {
    const div = document.createElement("div");
    div.className = "wl-poster-placeholder";
    div.textContent = "▓";
    return div;
  }

  function miniPlaceholder() {
    const div = document.createElement("div");
    div.className = "movie-poster-placeholder";
    div.textContent = "▓";
    return div;
  }

  function escHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }

  // ── Toast ──────────────────────────────────────────────────
  function toast(message, type = "info") {
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    el.textContent = message;
    $toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add("fade-out");
      setTimeout(() => el.remove(), 300);
    }, 3500);
  }

  // ── Event listeners ────────────────────────────────────────
  $searchBtn.addEventListener("click", handleSearch);
  $searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") handleSearch();
  });

  // ── Init ───────────────────────────────────────────────────
  boot();
})();
