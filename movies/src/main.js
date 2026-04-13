const pairings = [
  { book: "The Hobbit", movie: "The Lord of the Rings", genres: ["fantasy", "adventure"] },
  { book: "Pride and Prejudice", movie: "Pride & Prejudice", genres: ["romance", "drama"] },
  { book: "Harry Potter", movie: "Harry Potter Series", genres: ["fantasy", "adventure"] },
  { book: "Dune", movie: "Dune", genres: ["sci-fi", "adventure"] }
];

function search(type) {
  const input = document.getElementById('searchInput').value.toLowerCase();
  const results = pairings.filter(p =>
    type === 'book' ? p.book.toLowerCase().includes(input) : p.movie.toLowerCase().includes(input)
  );
  displayPairings(results);
}

function displayPairings(list = pairings) {
  const container = document.getElementById('pairingsContainer');
  container.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${p.book}</h3>
      <p>🎬 ${p.movie}</p>
      <button onclick="compare('${p.book}', '${p.movie}')">Compare</button>
      <button onclick="addFavorite('${p.book}', '${p.movie}')">❤️ Favorite</button>
    `;
    container.appendChild(card);
  });
}

function compare(book, movie) {
  alert(`Comparing:\n📖 Book: ${book}\n🎬 Movie: ${movie}`);
}

function addFavorite(book, movie) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites.push({ book, movie });
  localStorage.setItem("favorites", JSON.stringify(favorites));
  alert(`${book} → ${movie} added to favorites!`);
}

function showFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const container = document.getElementById('pairingsContainer');
  container.innerHTML = '';
  favorites.forEach(f => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${f.book}</h3>
      <p>🎬 ${f.movie}</p>
    `;
    container.appendChild(card);
  });
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

function login() {
  const user = document.getElementById("username").value;
  if (user) {
    localStorage.setItem("user", user);
    alert(`Welcome, ${user}!`);
    document.getElementById("loginModal").style.display = "none";
  }
}

function applyFilters() {
  const select = document.getElementById("genreSelect");
  const selectedGenres = Array.from(select.selectedOptions).map(opt => opt.value);

  const filtered = pairings.filter(p => selectedGenres.every(g => p.genres.includes(g)));
  displayPairings(filtered);
}