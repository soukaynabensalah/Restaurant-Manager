document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    if (getCookie('token')) {
        window.location.href = '/dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLoginBtn = document.getElementById('showLogin');
    const showRegisterBtn = document.getElementById('showRegister');

    // Toggle Forms
    showLoginBtn.addEventListener('click', () => {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        showLoginBtn.classList.add('active');
        showRegisterBtn.classList.remove('active');
    });

    showRegisterBtn.addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        showLoginBtn.classList.remove('active');
        showRegisterBtn.classList.add('active');
    });

    // Handle Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing in...';
        submitBtn.disabled = true;

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const response = await result.json();

            if (result.ok && response.success) {
                setCookie('token', response.token, 7); // 7 days
                showToast('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard.html';
                }, 1000);
            } else {
                showToast(response.message || 'Login failed', 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error(error);
            showToast('Server error', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    // Handle Register
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Creating account...';
        submitBtn.disabled = true;

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const result = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const response = await result.json();

            if (result.ok && response.success) {
                showToast('Account created! You can now login.', 'success');
                // Switch to login tab
                showLoginBtn.click();
                // Pre-fill email
                loginForm.querySelector('input[name="email"]').value = data.email;
            } else {
                showToast(response.message || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Server error', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
});
