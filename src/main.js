const OPEN_LIBRARY_SEARCH = 'https://openlibrary.org/search.json';
const GHIBLI_API = 'https://ghibliapi.vercel.app/films';
const FAVORITES_KEY = 'bookMovie.favorites';
const SITE_STATE_KEY = 'bookMovie.siteState';

const pairings = [
  {
    id: 1,
    book: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    year: 1937,
    movie: 'The Lord of the Rings',
    director: 'Peter Jackson',
    releaseYear: 2001,
    genres: ['fantasy', 'adventure'],
    rating: 8.8,
    coverUrl: 'https://covers.openlibrary.org/b/id/6979861-L.jpg',
    description: 'A hobbit leaves home for the first time and discovers a world of danger and wonder.',
    pageCount: 310,
    editionCount: 51,
    runtime: '178 min',
    producer: 'Peter Jackson',
    source: 'Static pairing'
  },
  {
    id: 2,
    book: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    movie: 'Pride & Prejudice',
    director: 'Joe Wright',
    releaseYear: 2005,
    genres: ['romance', 'drama'],
    rating: 7.8,
    coverUrl: 'https://covers.openlibrary.org/b/id/8231851-L.jpg',
    description: 'A sharp comedy of manners about love, family, and the limits placed on women.',
    pageCount: 432,
    editionCount: 33,
    runtime: '129 min',
    producer: 'Debra Hayward',
    source: 'Static pairing'
  },
  {
    id: 3,
    book: 'Dune',
    author: 'Frank Herbert',
    year: 1965,
    movie: 'Dune',
    director: 'Denis Villeneuve',
    releaseYear: 2021,
    genres: ['sci-fi', 'adventure'],
    rating: 8.1,
    coverUrl: 'https://covers.openlibrary.org/b/id/8306661-L.jpg',
    description: 'A young nobleman must travel to a desert planet to protect the most valuable resource in the universe.',
    pageCount: 412,
    editionCount: 29,
    runtime: '155 min',
    producer: 'Mary Parent',
    source: 'Static pairing'
  },
  {
    id: 4,
    book: 'The Matrix',
    author: 'William Gibson',
    year: 1984,
    movie: 'The Matrix',
    director: 'The Wachowskis',
    releaseYear: 1999,
    genres: ['sci-fi', 'action'],
    rating: 8.7,
    coverUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=60',
    description: 'A hacker discovers the reality he knows is a simulation controlled by machines.',
    pageCount: 256,
    editionCount: 18,
    runtime: '136 min',
    producer: 'Joel Silver',
    source: 'Static pairing'
  }
];

let currentMode = 'book';
let currentView = 'home';
let currentResults = [...pairings];

function getSiteState() {
  return JSON.parse(localStorage.getItem(SITE_STATE_KEY) || '{}');
}

function saveSiteState() {
  const state = {
    theme: document.body.dataset.theme || 'light',
    lastSearch: document.getElementById('searchInput').value.trim(),
    currentMode,
    currentView,
    user: localStorage.getItem('user') || '',
    loginTime: localStorage.getItem('loginTime') || ''
  };
  localStorage.setItem(SITE_STATE_KEY, JSON.stringify(state));
}

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
}

function setFavorites(list) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  saveSiteState();
}

function updateStatus(message) {
  const status = document.getElementById('savedStatus');
  if (status) status.textContent = message;
}

async function fetchBooks(query) {
  const response = await fetch(`${OPEN_LIBRARY_SEARCH}?title=${encodeURIComponent(query)}&limit=10`);
  const data = await response.json();

  return data.docs.slice(0, 6).map((item, index) => ({
    id: Date.now() + index,
    book: item.title || 'Unknown title',
    author: item.author_name ? item.author_name[0] : 'Unknown',
    year: item.first_publish_year || 'N/A',
    movie: 'Search related movie...',
    director: 'Unknown',
    releaseYear: 'N/A',
    genres: item.subject ? item.subject.slice(0, 4) : ['Literature'],
    rating: item.edition_count ? (item.edition_count / 10).toFixed(1) : 'N/A',
    coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-L.jpg` : '',
    description: item.first_sentence ? (Array.isArray(item.first_sentence) ? item.first_sentence[0] : item.first_sentence) : item.subtitle || 'A compelling story from Open Library.',
    pageCount: item.number_of_pages_median || 'N/A',
    editionCount: item.edition_count || 'N/A',
    runtime: 'N/A',
    producer: 'Open Library',
    source: 'Open Library'
  }));
}

async function fetchMovie(query) {
  const response = await fetch(GHIBLI_API);
  const films = await response.json();
  const normalized = query.trim().toLowerCase();

  return films
    .filter(film => film.title.toLowerCase().includes(normalized) || film.description.toLowerCase().includes(normalized))
    .slice(0, 6)
    .map((film, index) => ({
      id: Date.now() + index,
      book: 'Search related book...',
      author: 'Unknown',
      year: 'N/A',
      movie: film.title,
      director: film.director,
      releaseYear: film.release_date,
      genres: ['Animation', 'Adventure', 'Family'],
      rating: film.rt_score || 'N/A',
      coverUrl: film.movie_banner || film.image || '',
      description: film.description,
      pageCount: 'N/A',
      editionCount: 'N/A',
      runtime: `${film.running_time} min`,
      producer: film.producer,
      source: 'Studio Ghibli API'
    }));
}

function getTrailerUrl(movie) {
  const trailerSources = {
    'The Lord of the Rings': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'Pride & Prejudice': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'Dune': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    'The Matrix': 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    'Search related movie...': 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  };
  return trailerSources[movie] || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
}

function displayPairings(list = pairings, mode = 'book') {
  currentMode = mode;
  currentResults = list;
  const container = document.getElementById('pairingsContainer');
  if (!container) return;
  container.innerHTML = '';

  if (!list.length) {
    container.innerHTML = '<div class="empty-state">No matching pairings found. Try another search or filter.</div>';
    updateStatus('No results found.');
    return;
  }

  list.forEach(pairing => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <div class="card-cover">
            <img src="${pairing.coverUrl || 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=60'}" alt="Cover for ${pairing.book}" />
          </div>
          <div class="card-main">
            <h3>${pairing.book}</h3>
            <p class="subtitle">${pairing.author} · ${pairing.year}</p>
            <p class="book-description">${pairing.description || 'A data-rich recommendation for your next watch.'}</p>
            <p class="meta small">Genres: ${pairing.genres.join(', ')}</p>
            <p class="meta small">Pages: ${pairing.pageCount} · Editions: ${pairing.editionCount}</p>
            <p class="subtitle">🎬 ${pairing.movie} (${pairing.releaseYear})</p>
          </div>
        </div>
        <div class="card-back">
          <p><strong>Director:</strong> ${pairing.director}</p>
          <p><strong>Producer:</strong> ${pairing.producer || 'Unknown'}</p>
          <p><strong>Runtime:</strong> ${pairing.runtime}</p>
          <p><strong>Rating:</strong> ${pairing.rating}</p>
          <p class="meta small">Source: ${pairing.source || 'Static pairing'}</p>
        </div>
      </div>
    `;

    const actionRow = document.createElement('div');
    actionRow.className = 'card-actions';

    const compareButton = document.createElement('button');
    compareButton.type = 'button';
    compareButton.className = 'secondary';
    compareButton.textContent = 'Compare';
    compareButton.addEventListener('click', () => comparePairing(pairing, mode));

    const playButton = document.createElement('button');
    playButton.type = 'button';
    playButton.textContent = 'Play trailer';
    playButton.addEventListener('click', () => playTrailer(pairing));

    const favoriteButton = document.createElement('button');
    favoriteButton.type = 'button';
    favoriteButton.className = 'tertiary';
    favoriteButton.textContent = 'Favorite';
    favoriteButton.addEventListener('click', () => addFavorite(pairing));

    actionRow.append(compareButton, playButton, favoriteButton);
    card.appendChild(actionRow);
    container.appendChild(card);
  });

  updateStatus(`Displaying ${list.length} ${mode === 'book' ? 'book → movie' : 'movie → book'} pairing${list.length === 1 ? '' : 's'}.`);
}

function comparePairing(pairing, mode) {
  const detail = document.getElementById('compareDetail');
  if (!detail) return;
  const direction = mode === 'movie' ? 'Movie → Book' : 'Book → Movie';
  const details = mode === 'movie'
    ? `Director: ${pairing.director} · Runtime: ${pairing.runtime}`
    : `Genres: ${pairing.genres.join(', ')} · Pages: ${pairing.pageCount}`;

  detail.innerHTML = `
    <div class="compare-card">
      <p><strong>Mode:</strong> ${direction}</p>
      <p><strong>Selected:</strong> ${mode === 'movie' ? pairing.movie : pairing.book}</p>
      <p><strong>Recommendation:</strong> ${mode === 'movie' ? pairing.book : pairing.movie}</p>
      <p><strong>Details:</strong> ${details}</p>
    </div>
  `;
  updateStatus(`Compared pairing: ${pairing.book} → ${pairing.movie}`);
}

function playTrailer(pairing) {
  const player = document.getElementById('previewPlayer');
  if (!player) return;
  const sourceUrl = getTrailerUrl(pairing.movie);

  player.pause();
  player.innerHTML = '';
  const source = document.createElement('source');
  source.src = sourceUrl;
  source.type = 'video/mp4';
  player.appendChild(source);
  player.load();
  player.muted = false;
  player.currentTime = 0;
  player.play().then(() => {
    document.getElementById('playerLabel').textContent = `Trailer queued for ${pairing.movie}.`;
  }).catch(async () => {
    player.muted = true;
    try {
      await player.play();
      document.getElementById('playerLabel').textContent = `Trailer is playing muted for ${pairing.movie}.`;
    } catch {
      document.getElementById('playerLabel').textContent = `Trailer ready for ${pairing.movie}. Press play.`;
    }
  });
}

function goHome() {
  currentView = 'home';
  document.getElementById('favoritesSection').classList.add('hidden');
  document.getElementById('profileSection').classList.add('hidden');
  document.getElementById('compareDetail').innerHTML = '';
  displayPairings(pairings, currentMode);
  saveSiteState();
}

function showFavorites() {
  currentView = 'favorites';
  document.getElementById('profileSection').classList.add('hidden');
  document.getElementById('favoritesSection').classList.remove('hidden');
  renderFavoritesList('favoritesList');
  saveSiteState();
}

function showProfile() {
  currentView = 'profile';
  document.getElementById('favoritesSection').classList.add('hidden');
  document.getElementById('profileSection').classList.remove('hidden');
  document.getElementById('profileName').textContent = localStorage.getItem('user') || 'Not logged in';
  renderFavoritesList('profileFavoritesList');
  saveSiteState();
}

function showLogin() {
  document.getElementById('loginModal').classList.remove('hidden');
}

function closeLogin() {
  document.getElementById('loginModal').classList.add('hidden');
}

function addFavorite(pairing) {
  const favorites = getFavorites();
  const exists = favorites.some(item => item.book === pairing.book && item.movie === pairing.movie);
  if (exists) {
    updateStatus(`Already in favorites: ${pairing.book} → ${pairing.movie}`);
    return;
  }

  favorites.push({
    id: pairing.id,
    book: pairing.book,
    author: pairing.author,
    year: pairing.year,
    movie: pairing.movie,
    director: pairing.director,
    releaseYear: pairing.releaseYear,
    genres: pairing.genres,
    rating: pairing.rating,
    coverUrl: pairing.coverUrl,
    description: pairing.description,
    runtime: pairing.runtime,
    producer: pairing.producer,
    source: pairing.source,
    savedAt: new Date().toISOString()
  });

  setFavorites(favorites);
  renderFavoritesList('favoritesList');
  renderFavoritesList('profileFavoritesList');
  updateStatus(`Saved favorite: ${pairing.book} → ${pairing.movie}`);
}

function renderFavoritesList(listId) {
  const favorites = getFavorites();
  const list = document.getElementById(listId);
  if (!list) return;
  list.innerHTML = '';

  if (!favorites.length) {
    list.innerHTML = '<li class="empty-state">No favorites saved yet. Tap the heart icon on any card to preserve a pairing.</li>';
  }

  favorites.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'favorite-item';
    li.innerHTML = `
      <span>${item.book} → ${item.movie} (${item.releaseYear})</span>
      <button class="tertiary tiny" type="button">Remove</button>
    `;
    li.querySelector('button').addEventListener('click', () => removeFavorite(index));
    list.appendChild(li);
  });

  const count = document.getElementById('favoritesCount');
  if (count) count.textContent = `${favorites.length} saved`;
}

function removeFavorite(index) {
  const favorites = getFavorites();
  if (index < 0 || index >= favorites.length) return;
  favorites.splice(index, 1);
  setFavorites(favorites);
  renderFavoritesList('favoritesList');
  renderFavoritesList('profileFavoritesList');
  updateStatus('Favorite removed.');
}

function applyFilters() {
  const selectedGenres = Array.from(document.getElementById('genreSelect').selectedOptions).map(opt => opt.value);
  const filtered = currentResults.filter(pairing => selectedGenres.every(genre => pairing.genres.includes(genre)));
  displayPairings(filtered, currentMode);
}

async function search(type = 'book') {
  currentMode = type;
  const input = document.getElementById('searchInput').value.trim();
  if (!input) {
    displayPairings(pairings, currentMode);
    return;
  }

  updateStatus(`Searching ${type === 'book' ? 'books' : 'movies'} for "${input}"...`);
  saveSiteState();

  let results = [];
  if (type === 'book') {
    results = await fetchBooks(input);
  } else {
    results = await fetchMovie(input);
  }

  displayPairings(results, currentMode);
}

function toggleTheme() {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = nextTheme;
  localStorage.setItem('theme', nextTheme);
  saveSiteState();
  updateStatus(`Theme set to ${nextTheme}.`);
}

function init() {
  const state = getSiteState();
  if (state.theme) document.body.dataset.theme = state.theme;
  if (state.lastSearch) document.getElementById('searchInput').value = state.lastSearch;
  if (state.currentMode) currentMode = state.currentMode;
  if (state.currentView) currentView = state.currentView;

  document.getElementById('genreSelect').addEventListener('change', applyFilters);
  document.getElementById('searchForm').addEventListener('submit', e => {
    e.preventDefault();
    search(currentMode);
  });
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      search(currentMode);
    }
  });

  document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const user = document.getElementById('username').value.trim();
    if (!user) return;
    localStorage.setItem('user', user);
    localStorage.setItem('loginTime', new Date().toISOString());
    saveSiteState();
    closeLogin();
    showProfile();
    updateStatus(`Welcome, ${user}!`);
    document.getElementById('statusUser').textContent = user;
  });

  document.getElementById('loginModal').addEventListener('click', e => {
    if (e.target.id === 'loginModal') closeLogin();
  });

  document.getElementById('statusUser').textContent = localStorage.getItem('user') || 'Guest';

  if (state.currentView === 'favorites') {
    showFavorites();
  } else if (state.currentView === 'profile') {
    showProfile();
  } else if (state.lastSearch) {
    search(currentMode);
  } else {
    displayPairings(pairings, currentMode);
  }
}

window.addEventListener('DOMContentLoaded', init);
