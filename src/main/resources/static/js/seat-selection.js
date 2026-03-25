document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '/login.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('username');
            window.location.href = '/login.html';
        });
    }

    const urlParams = new URLSearchParams(window.location.search);
    const showtimeId = urlParams.get('showtimeId');

    if (!showtimeId) {
        window.location.href = '/index.html';
        return;
    }

    // State
    let seatsData = [];
    let selectedSeats = new Map(); // seatId -> seatData

    // DOM Elements
    const loadingIndicator = document.getElementById('loadingIndicator');
    const contentArea = document.getElementById('contentArea');
    const errorState = document.getElementById('errorState');
    const seatGrid = document.getElementById('seatGrid');
    const bookingBar = document.getElementById('bookingBar');
    const totalAmountEl = document.getElementById('totalAmount');
    const selectedSeatsLabel = document.getElementById('selectedSeatsLabel');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const alertBox = document.getElementById('alertBox');

    function showAlert(message, isError) {
        alertBox.textContent = message;
        alertBox.className = `alert ${isError ? 'error' : 'success'}`;
        setTimeout(() => alertBox.classList.add('hidden'), 3000);
    }

    // Fetch Seats
    fetch(`/api/booking/showtime/${showtimeId}/seats`)
        .then(res => {
            if (!res.ok) throw new Error('Failed to fetch seats');
            return res.json();
        })
        .then(seats => {
            seatsData = seats;
            loadingIndicator.classList.add('hidden');
            contentArea.classList.remove('hidden');
            bookingBar.classList.remove('hidden');
            renderSeatMap();
        })
        .catch(err => {
            console.error(err);
            loadingIndicator.classList.add('hidden');
            errorState.classList.remove('hidden');
        });

    function renderSeatMap() {
        seatGrid.innerHTML = '';
        
        // Group seats by row (e.g. "A1" -> Row "A")
        const rows = new Map();
        seatsData.forEach(seat => {
            const rowLtr = seat.seatNumber.charAt(0);
            if (!rows.has(rowLtr)) rows.set(rowLtr, []);
            rows.get(rowLtr).push(seat);
        });

        // Sort rows A-Z
        const sortedRowLetters = Array.from(rows.keys()).sort();

        sortedRowLetters.forEach(rowLtr => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'seat-row';

            const rowLabel = document.createElement('div');
            rowLabel.className = 'row-label';
            rowLabel.textContent = rowLtr;
            rowDiv.appendChild(rowLabel);

            // Sort seats numerically 1-20
            const rowSeats = rows.get(rowLtr).sort((a, b) => {
                const numA = parseInt(a.seatNumber.substring(1));
                const numB = parseInt(b.seatNumber.substring(1));
                return numA - numB;
            });

            rowSeats.forEach((seat, index) => {
                const seatDiv = document.createElement('div');
                seatDiv.textContent = seat.seatNumber;

                if (seat.booked) {
                    seatDiv.className = 'seat booked';
                    seatDiv.textContent = 'X';
                } else {
                    seatDiv.className = 'seat available';
                    seatDiv.title = `${seat.seatNumber} - ₹${seat.price}`;
                    
                    seatDiv.onclick = () => toggleSeat(seat, seatDiv);
                }

                rowDiv.appendChild(seatDiv);

                // Add aisle gap after seat 5 and 15
                if (index === 4 || index === 14) {
                    const gap = document.createElement('div');
                    gap.style.width = '20px'; // Aisle
                    rowDiv.appendChild(gap);
                }
            });

            seatGrid.appendChild(rowDiv);
        });
    }

    function toggleSeat(seat, seatElement) {
        if (selectedSeats.has(seat.id)) {
            selectedSeats.delete(seat.id);
            seatElement.classList.remove('selected');
        } else {
            // Limit to 10 seats
            if (selectedSeats.size >= 10) {
                showAlert('You can only select up to 10 seats.', true);
                return;
            }
            selectedSeats.set(seat.id, seat);
            seatElement.classList.add('selected');
        }
        updateBookingSummary();
    }

    function updateBookingSummary() {
        if (selectedSeats.size === 0) {
            totalAmountEl.textContent = '₹0';
            selectedSeatsLabel.textContent = 'No seats selected';
            checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        let seatNames = [];
        selectedSeats.forEach(seat => {
            total += seat.price;
            seatNames.push(seat.seatNumber);
        });

        totalAmountEl.textContent = `₹${total}`;
        selectedSeatsLabel.textContent = `${seatNames.join(', ')} (${selectedSeats.size} ticket${selectedSeats.size > 1 ? 's' : ''})`;
        checkoutBtn.disabled = false;
    }

    // Checkout
    checkoutBtn.addEventListener('click', async () => {
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processing...';

        const seatIds = Array.from(selectedSeats.keys());
        
        try {
            const response = await fetch('/api/booking/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    showtimeId: showtimeId,
                    seatIds: seatIds,
                    username: username
                })
            });

            const data = await response.json();

            if (response.ok) {
                const options = {
                    "key": data.razorpayKeyId,
                    "amount": data.totalAmount * 100,
                    "currency": "INR",
                    "name": "Cenifex",
                    "description": "Movie Ticket Booking",
                    "order_id": data.razorpayOrderId,
                    "handler": async function (paymentResponse){
                        try {
                            const verifyRes = await fetch('/api/booking/verify-payment', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    razorpayOrderId: paymentResponse.razorpay_order_id,
                                    razorpayPaymentId: paymentResponse.razorpay_payment_id,
                                    razorpaySignature: paymentResponse.razorpay_signature
                                })
                            });
                            
                            if (verifyRes.ok) {
                                showAlert('Payment successful! Tickets booked.', false);
                                setTimeout(() => {
                                    window.location.href = '/index.html';
                                }, 2000);
                            } else {
                                const verifyData = await verifyRes.json();
                                showAlert(verifyData.message || 'Payment verification failed!', true);
                                checkoutBtn.disabled = false;
                                checkoutBtn.textContent = 'Pay Now';
                            }
                        } catch (e) {
                            console.error(e);
                            showAlert('Network error during payment verification', true);
                            checkoutBtn.disabled = false;
                            checkoutBtn.textContent = 'Pay Now';
                        }
                    },
                    "prefill": {
                        "name": username,
                        "email": username + "@example.com",
                        "contact": "9999999999"
                    },
                    "theme": {
                        "color": "#3b82f6"
                    }
                };
                
                const rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (paymentResponse){
                    showAlert("Payment failed: " + paymentResponse.error.description, true);
                    checkoutBtn.disabled = false;
                    checkoutBtn.textContent = 'Pay Now';
                });
                rzp1.open();
            } else {
                showAlert(data.error || 'Failed to book tickets. Seats might be unavailable.', true);
                checkoutBtn.disabled = false;
                checkoutBtn.textContent = 'Pay Now';
                // Reload seats in case someone else booked them
                fetch(`/api/booking/showtime/${showtimeId}/seats`)
                    .then(res => res.json())
                    .then(seats => {
                        seatsData = seats;
                        selectedSeats.clear();
                        updateBookingSummary();
                        renderSeatMap();
                    });
            }
        } catch (err) {
            console.error(err);
            showAlert('Network error. Please try again.', true);
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Pay Now';
        }
    });

});
