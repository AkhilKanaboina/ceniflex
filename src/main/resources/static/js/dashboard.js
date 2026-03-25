document.addEventListener('DOMContentLoaded', () => {
    // 1. Auth Check
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
        return;
    }

    // Set Welcome Header
    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${username}`;
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('username');
            window.location.href = '/login.html';
        });
    }

    // 2. Fetch Movies
    const loadingIndicator = document.getElementById('loadingIndicator');
    const moviesGrid = document.getElementById('moviesGrid');
    const errorState = document.getElementById('errorState');

    fetch('/api/movies')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(movies => {
            loadingIndicator.classList.add('hidden');
            
            if (movies.length === 0) {
                errorState.textContent = "No movies available currently.";
                errorState.classList.remove('hidden');
                errorState.classList.remove('error');
            } else {
                renderMovies(movies);
                moviesGrid.classList.remove('hidden');
            }
        })
        .catch(error => {
            console.error('Error fetching movies:', error);
            loadingIndicator.classList.add('hidden');
            errorState.classList.remove('hidden');
        });

    // 3. Render Movies
    function renderMovies(movies) {
        moviesGrid.innerHTML = ''; // Clear container

        movies.forEach(movie => {
            // Create Card
            const card = document.createElement('div');
            card.className = 'movie-card';
            card.onclick = () => {
                window.location.href = `/movie-details.html?id=${movie.id}`;
            };

            // Poster image
            const poster = document.createElement('img');
            poster.className = 'movie-poster';
            poster.src = movie.posterUrl || 'https://via.placeholder.com/300x450?text=No+Poster';
            poster.alt = movie.title;

            // Info Container
            const info = document.createElement('div');
            info.className = 'movie-info';

            // Title
            const title = document.createElement('h4');
            title.className = 'movie-title';
            title.textContent = movie.title;

            // Meta (Language • Duration)
            const meta = document.createElement('div');
            meta.className = 'movie-meta';
            const duration = movie.durationInMinutes ? `${Math.floor(movie.durationInMinutes/60)}h ${movie.durationInMinutes%60}m` : '';
            meta.textContent = `${movie.language || 'English'} ${duration ? '• ' + duration : ''}`;

            // Genre
            const genre = document.createElement('span');
            genre.className = 'movie-genre';
            genre.textContent = movie.genre || 'Various';

            // Append elements
            info.appendChild(title);
            info.appendChild(meta);
            info.appendChild(genre);
            
            card.appendChild(poster);
            card.appendChild(info);

            moviesGrid.appendChild(card);
        });
    }
});
