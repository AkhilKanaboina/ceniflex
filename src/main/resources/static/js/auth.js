const API_URL = '/auth'; // using relative URL, assuming API and static files run on same server

function showAlert(message, isError) {
    const alertBox = document.getElementById('alertBox');
    if (!alertBox) return; // For dashboard where no alert box exists
    
    alertBox.textContent = message;
    alertBox.classList.remove('hidden', 'error', 'success');
    alertBox.classList.add(isError ? 'error' : 'success');
}

function setLoading(buttonId, isLoading) {
    const btn = document.getElementById(buttonId);
    if (!btn) return;

    const text = btn.querySelector('.btn-text');
    const loader = btn.querySelector('.loader');

    if (isLoading) {
        btn.disabled = true;
        text.classList.add('hidden');
        loader.classList.remove('hidden');
    } else {
        btn.disabled = false;
        text.classList.remove('hidden');
        loader.classList.add('hidden');
    }
}

// Signup Form Logic
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        setLoading('signupSubmitBtn', true);

        try {
            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Signup successful! Redirecting to login...', false);
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            } else {
                showAlert(data.error || 'Signup failed. Please try again.', true);
            }
        } catch (error) {
            showAlert('Network error occurred. Please check your connection.', true);
        } finally {
            setLoading('signupSubmitBtn', false);
        }
    });
}

// Login Form Logic
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        setLoading('loginSubmitBtn', true);

        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store username in localStorage for simple session management
                localStorage.setItem('username', data.username);
                window.location.href = '/index.html';
            } else {
                showAlert(data.error || 'Invalid credentials', true);
            }
        } catch (error) {
            showAlert('Network error occurred. Please check your connection.', true);
        } finally {
            setLoading('loginSubmitBtn', false);
        }
    });
}
