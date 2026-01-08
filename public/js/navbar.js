document.addEventListener('DOMContentLoaded', () => {
    const navbarPath = window.location.pathname;
    const token = getCookie('token');

    // Create elements
    const nav = document.createElement('nav');
    nav.className = 'navbar';

    // Logo
    const logoLink = document.createElement('a');
    logoLink.href = '/';
    logoLink.className = 'nav-logo';
    logoLink.innerHTML = ' RestoManager';

    // Links Container
    const linksDiv = document.createElement('div');
    linksDiv.className = 'nav-links';

    // Define links
    // SPA Structure: Home, About, Contact are anchors on index.html
    const links = [
        { name: 'Home', path: '/#home' },
        { name: 'About', path: '/#about' },
        { name: 'Contact', path: '/#contact' },
        { name: 'Dashboard', path: '/dashboard.html' }
    ];

    // Conditional Links
    if (token) {
        links.push({ name: 'Scraper', path: '/scraping.html' });
    } else {
        // Maybe show a "Login to see more" or just keep it simple?
        // User asked for Scraper to appear ONLY if connected.
    }

    // Build Links
    links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.path;
        a.textContent = link.name;

        // Active state logic
        // For anchors, we might want to check hash or just leave it generic
        // For separate pages like dashboard, check pathname
        if (link.path.includes('.html') && navbarPath.includes(link.path)) {
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

    // Container
    const container = document.createElement('div');
    container.className = 'container';
    container.style.display = 'flex';
    container.style.justifyContent = 'space-between';
    container.style.alignItems = 'center';
    container.style.height = '100%';

    // Hamburger Button
    const hamburger = document.createElement('button');
    hamburger.className = 'nav-toggle';
    hamburger.innerHTML = '<i class="fas fa-bars"></i>';
    hamburger.ariaLabel = 'Toggle navigation';

    // Mobile Menu Wrapper
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'nav-mobile-menu';

    // Assemble
    container.appendChild(logoLink);
    container.appendChild(hamburger);

    // Move links and auth into mobile wrapper for unified toggling
    mobileMenu.appendChild(linksDiv);
    mobileMenu.appendChild(authDiv);
    container.appendChild(mobileMenu);

    nav.appendChild(container);

    // Insert into DOM (prepend to body or specific container)
    document.body.prepend(nav);

    // Toggle Logic
    hamburger.addEventListener('click', () => {
        nav.classList.toggle('nav-open');
        const icon = hamburger.querySelector('i');
        if (nav.classList.contains('nav-open')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when link clicked
    linksDiv.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            const icon = hamburger.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });

    // Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }, { passive: true });
});
