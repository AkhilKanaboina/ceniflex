document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
        return;
    }

    // Logout Handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('username');
            window.location.href = '/login.html';
        });
    }

    // Get Movie ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');

    if (!movieId) {
        window.location.href = '/index.html';
        return;
    }

    const loadingIndicator = document.getElementById('loadingIndicator');
    const contentArea = document.getElementById('contentArea');
    const errorState = document.getElementById('errorState');
    const theatersList = document.getElementById('theatersList');

    // Fetch Movie Info and Showtimes simultaneously
    Promise.all([
        fetch(`/api/movies/${movieId}`).then(res => {
            if (!res.ok) throw new Error('Failed to fetch movie details');
            return res.json();
        }),
        fetch(`/api/showtimes/movie/${movieId}`).then(res => {
            if (!res.ok) throw new Error('Failed to fetch showtimes');
            return res.json();
        })
    ])
    .then(([movie, theaters]) => {
        loadingIndicator.classList.add('hidden');
        contentArea.classList.remove('hidden');

        // Render Movie Hero
        document.getElementById('movieTitle').textContent = movie.title;
        document.getElementById('movieDesc').textContent = movie.description || 'No description available.';
        document.getElementById('moviePoster').src = movie.posterUrl || 'https://via.placeholder.com/200x300?text=No+Poster';
        
        const duration = movie.durationInMinutes ? `${Math.floor(movie.durationInMinutes/60)}h ${movie.durationInMinutes%60}m` : '';
        document.getElementById('movieMeta').textContent = `${movie.genre || 'Various'} • ${movie.language || 'English'}${duration ? ' • ' + duration : ''}`;

        // Render Theaters
        if (theaters.length === 0) {
            theatersList.innerHTML = '<p style="color: #64748b; padding: 1rem 0;">No showtimes available for this movie today.</p>';
        } else {
            theaters.forEach(theater => {
                const theaterRow = document.createElement('div');
                theaterRow.className = 'theater-row';

                // Theater Details
                const name = document.createElement('div');
                name.className = 'theater-name';
                name.textContent = theater.theaterName;

                const address = document.createElement('div');
                address.className = 'theater-address';
                address.textContent = theater.address || 'Location unknown';

                // Showtimes mapping
                const showtimesContainer = document.createElement('div');
                showtimesContainer.className = 'showtimes-list';
                
                theater.showtimes.forEach(show => {
                    const btn = document.createElement('button');
                    btn.className = 'showtime-btn';
                    
                    // Format time cleanly (HH:mm)
                    const timeStr = show.startTime.substring(0, 5); 
                    btn.textContent = `${timeStr} (${show.screenName})`;
                    
                    btn.onclick = () => {
                        window.location.href = `/seat-selection.html?showtimeId=${show.id}`;
                    };
                    
                    showtimesContainer.appendChild(btn);
                });

                theaterRow.appendChild(name);
                theaterRow.appendChild(address);
                theaterRow.appendChild(showtimesContainer);

                theatersList.appendChild(theaterRow);
            });
        }
    })
    .catch(error => {
        console.error(error);
        loadingIndicator.classList.add('hidden');
        errorState.classList.remove('hidden');
    });
});
