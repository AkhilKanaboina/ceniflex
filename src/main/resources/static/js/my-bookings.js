document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
        return;
    }

    fetchBookings(username);
});

async function fetchBookings(username) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const bookingsList = document.getElementById('bookingsList');
    const emptyState = document.getElementById('emptyState');
    const errorState = document.getElementById('errorState');

    try {
        const response = await fetch(`/api/booking/user/${username}`);
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const bookings = await response.json();
        
        loadingIndicator.classList.add('hidden');

        if (bookings.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <div class="booking-header">
                    <h3 style="margin: 0; font-size: 1.2rem; font-weight: 600;">${booking.movieTitle}</h3>
                    <span class="status-badge status-${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <p><strong>Booking ID:</strong> #${booking.bookingId}</p>
                    <p><strong>Date & Time:</strong> ${booking.showDate} at ${booking.startTime}</p>
                    <p><strong>Theater:</strong> ${booking.theaterName} (${booking.screenName})</p>
                    <p><strong>Seats:</strong> ${booking.bookedSeats.join(', ')}</p>
                    <p style="font-size: 1.1rem; font-weight: 600; color: #1e293b; margin-top: 1rem;">
                        <strong>Total Amount:</strong> ₹${booking.totalAmount}
                    </p>
                </div>
            </div>
        `).join('');
        
        bookingsList.classList.remove('hidden');

    } catch (error) {
        console.error('Error fetching bookings:', error);
        loadingIndicator.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}
