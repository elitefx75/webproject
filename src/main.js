// Non-trivial JSON dataset with 8+ attributes
const pairings = [
  {
    id: 1,
    book: "The Hobbit",
    author: "J.R.R. Tolkien",
    year: 1937,
    movie: "The Lord of the Rings",
    director: "Peter Jackson",
    releaseYear: 2001,
    genres: ["fantasy", "adventure"],
    rating: 8.8
  },
  {
    id: 2,
    book: "Pride and Prejudice",
    author: "Jane Austen",
    year: 1813,
    movie: "Pride & Prejudice",
    director: "Joe Wright",
    releaseYear: 2005,
    genres: ["romance", "drama"],
    rating: 7.8
  }
];

// API integrations
async function fetchBooks(query) {
  const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(query)}`);
  const data = await response.json();
  return data.docs.slice(0, 3).map(b => ({
    book: b.title,
    author: b.author_name ? b.author_name[0] : "Unknown",
    year: b.first_publish_year || "N/A",
    movie: "Search related movie...",
    director: "Unknown",
    releaseYear: "N/A",
    genres: ["Unknown"],
    rating: "N/A"
  }));
}

async function fetchMovie(query) {
  const apiKey = "YOUR_OMDB_API_KEY"; // replace with your OMDb key
  const response = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(query)}&apikey=${apiKey}`);
  const data = await response.json();
  if (data.Response === "True") {
    return {
      book: "Search related book...",
      author: "Unknown",
      year: "N/A",
      movie: data.Title,
      director: data.Director,
      releaseYear: data.Year,
      genres: data.Genre.split(", "),
      rating: data.imdbRating
    };
  }
  return null;
}

// Display logic
function displayPairings(list = pairings) {
  const container = document.getElementById('pairingsContainer');
  container.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-front">
          <h3>${p.book} (${p.year})</h3>
          <p>Author: ${p.author}</p>
          <p>🎬 ${p.movie} (${p.releaseYear})</p>
        </div>
        <div class="card-back">
          <p>Director: ${p.director}</p>
          <p>Genres: ${p.genres.join(", ")}</p>
          <p>⭐ Rating: ${p.rating}</p>
          <button onclick="addFavorite('${p.book}', '${p.movie}')">❤️ Favorite</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Navigation
function goHome() { displayPairings(pairings); }
function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  displayPairings(favorites);
}
function showProfile() {
  const user = localStorage.getItem("user");
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  document.getElementById("profileName").textContent = user ? `Logged in as: ${user}` : "Not logged in";
  const list = document.getElementById("favoritesList");
  list.innerHTML = '';
  favorites.forEach(f => {
    const li = document.createElement("li");
    li.textContent = `${f.book} → ${f.movie}`;
    list.appendChild(li);
  });
  document.getElementById("profileSection").style.display = "block";
}
function showLogin() {
  document.getElementById("loginModal").style.display = "flex";
}

// Events
document.getElementById("genreSelect").addEventListener("change", applyFilters);
document.getElementById("searchForm").addEventListener("submit", e => {
  e.preventDefault();
  search("book");
});
document.getElementById("searchInput").addEventListener("keydown", e => {
  if (e.key === "Enter") search("book");
});

// Search
async function search(type) {
  const input = document.getElementById('searchInput').value.trim();
  localStorage.setItem("lastSearch", input);
  let results = [];
  if (type === 'book') {
    results = await fetchBooks(input);
  } else {
    const movie = await fetchMovie(input);
    if (movie) results = [movie];
  }
  displayPairings(results);
}

// Favorites
function addFavorite(book, movie) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.push({ book, movie });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert(`${book} → ${movie} added to favorites!`);
}

// Login
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("username").value;
  if (user) {
    localStorage.setItem("user", user);
    localStorage.setItem("loginTime", new Date().toISOString());
    alert(`Welcome, ${user}!`);
    document.getElementById("loginModal").style.display = "none";
    showProfile();
  }
});

// Theme toggle
function toggleTheme() {
  const current = localStorage.getItem("theme") || "light";
  const newTheme = current === "light" ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  document.body.dataset.theme = newTheme;
}

// Filters
function applyFilters() {
  const select = document.getElementById("genreSelect");
  const selectedGenres = Array.from(select.selectedOptions).map(opt => opt.value);
  const filtered = pairings.filter(p => selectedGenres.every(g => p.genres.includes(g)));
  displayPairings(filtered);
}

// On page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.dataset.theme = savedTheme;
  const lastSearch = localStorage.getItem("lastSearch");
  if (lastSearch) {
    document.getElementById('searchInput').value = lastSearch;
    search("book");
  } else {
    displayPairings();
  }
});