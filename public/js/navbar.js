document.addEventListener('DOMContentLoaded', () => {
    const navbarPath = window.location.pathname;
    const token = getCookie('token');

    // Create elements
    const nav = document.createElement('nav');
    nav.className = 'glass navbar';

    // Logo
    const logoLink = document.createElement('a');
    logoLink.href = '/';
    logoLink.className = 'nav-logo';
    logoLink.innerHTML = '<i class="fas fa-utensils"></i> RestoManager';

    // Links Container
    const linksDiv = document.createElement('div');
    linksDiv.className = 'nav-links';

    // Define links
    const links = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about.html' },
        { name: 'Contact', path: '/contact.html' },
        { name: 'Dashboard', path: '/dashboard.html' }
    ];

    // Build Links
    links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.path;
        a.textContent = link.name;
        // Handle root path active state correctly
        if (link.path === '/' && (navbarPath === '/' || navbarPath === '/index.html')) {
            a.className = 'nav-link active';
        } else if (link.path !== '/' && navbarPath.includes(link.path)) {
            a.className = 'nav-link active';
        } else {
            a.className = 'nav-link';
        }
        linksDiv.appendChild(a);
    });

    // Auth Buttons
    const authDiv = document.createElement('div');
    authDiv.className = 'nav-auth';

    if (token) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn btn-outline btn-sm';
        logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
        logoutBtn.onclick = () => {
            eraseCookie('token');
            window.location.href = '/login.html';
        };
        authDiv.appendChild(logoutBtn);
    } else {
        const loginBtn = document.createElement('a');
        loginBtn.href = '/login.html';
        loginBtn.className = 'btn btn-primary btn-sm';
        loginBtn.textContent = 'Login';
        authDiv.appendChild(loginBtn);
    }

    // Assemble
    nav.appendChild(logoLink);
    nav.appendChild(linksDiv);
    nav.appendChild(authDiv);

    // Insert into DOM (prepend to body or specific container)
    document.body.prepend(nav);
});
