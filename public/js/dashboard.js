let currentUser = null;
let restaurants = [];
let favorites = new Set();
let currentPage = 1;
const limit = 6;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth
    const token = getCookie('token');
    if (!token) {
        window.location.href = '/login.html';
        return;
    }

    try {
        // 2. Load User Profile
        const userRes = await fetchAPI('/api/auth/me');
        if (!userRes.response.ok) throw new Error('Session invalid');
        currentUser = userRes.data.user;
        document.getElementById('welcomeMsg').textContent = `Welcome, ${currentUser.username}`;

        // 3. Load Favorites IDs
        await loadFavorites();

        // 4. Initial Load
        loadRestaurants();

        // 5. Setup Listeners
        setupEventListeners();

    } catch (error) {
        console.error(error);
        eraseCookie('token');
        window.location.href = '/login.html';
    }
});

async function loadFavorites() {
    try {
        const result = await fetchAPI('/api/favorites/my-favorites');
        if (result.response.ok) {
            favorites = new Set(result.data.data.map(f => f.id));
        }
    } catch (error) {
        console.error('Failed to load favorites', error);
    }
}

async function loadRestaurants(page = 1) {
    const search = document.getElementById('searchInput').value;
    const cuisine = document.getElementById('cuisineFilter').value;
    const status = document.getElementById('statusFilter').value;

    const queryParams = new URLSearchParams({
        page,
        limit,
        search,
        cuisine,
        status
    });

    try {
        const result = await fetchAPI(`/api/restaurants?${queryParams}`);
        if (result.response.ok) {
            restaurants = result.data.data;
            renderRestaurants(restaurants);
            renderPagination(result.data.pagination);

            // Update stats
            document.getElementById('totalRestaurants').textContent = result.data.pagination.total;
        }
    } catch (error) {
        console.error(error);
        showToast('Error loading data', 'error');
    }
}

function renderRestaurants(list) {
    const grid = document.getElementById('restaurantsGrid');
    grid.innerHTML = '';

    const cuisineLabels = {
        'marocaine': 'Moroccan',
        'italienne': 'Italian',
        'asiatique': 'Asian'
    };

    const statusLabels = {
        'partenaire': 'Partner',
        'prospect': 'Prospect',
        'inactif': 'Inactive'
    };

    list.forEach(r => {
        const isOwner = r.user_id === currentUser.id;
        const isMFav = favorites.has(r.id);

        const card = document.createElement('div');
        card.className = 'glass glass-card restaurant-card';
        card.innerHTML = `
            <div class="card-img" style="background-image: url('${r.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'}'); background-size: cover; background-position: center;"></div>
            <div class="card-body">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <h3 style="margin: 0; font-size: 1.25rem;">${r.name}</h3>
                    <button class="heart-btn ${isMFav ? 'active' : ''}" onclick="toggleFavorite(${r.id}, this)">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                
                <p style="color: rgba(255,255,255,0.7); margin: 0.5rem 0; font-size: 0.9rem;">
                    <i class="fas fa-map-marker-alt"></i> ${r.address}
                </p>

                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 1rem 0;">
                    <span class="badge" style="background: rgba(236, 72, 153, 0.2); color: #f472b6;">${cuisineLabels[r.cuisine] || r.cuisine}</span>
                    <span class="badge badge-status">${statusLabels[r.status] || r.status}</span>
                    <span class="badge" style="background: rgba(255, 255, 255, 0.1);">⭐ ${r.rating}/5</span>
                </div>

                ${isOwner ? `
                <div class="actions">
                    <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.8rem;" onclick="openEditModal(${r.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" style="padding: 0.5rem 1rem; font-size: 0.8rem;" onclick="deleteRestaurant(${r.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    container.innerHTML = '';

    if (pagination.totalPages <= 1) return;

    if (pagination.page > 1) {
        const prev = document.createElement('button');
        prev.className = 'btn btn-outline';
        prev.textContent = 'Previous';
        prev.onclick = () => loadRestaurants(pagination.page - 1);
        container.appendChild(prev);
    }

    const info = document.createElement('span');
    info.textContent = `Page ${pagination.page} of ${pagination.totalPages}`;
    container.appendChild(info);

    if (pagination.page < pagination.totalPages) {
        const next = document.createElement('button');
        next.className = 'btn btn-outline';
        next.textContent = 'Next';
        next.onclick = () => loadRestaurants(pagination.page + 1);
        container.appendChild(next);
    }
}

// Modal Logic
const modal = document.getElementById('restaurantModal');
const form = document.getElementById('restaurantForm');
const modalTitle = document.getElementById('modalTitle');

function setupEventListeners() {
    // Open Modal
    document.getElementById('addRestaurantBtn').addEventListener('click', () => {
        form.reset();
        document.getElementById('restaurantId').value = '';
        modalTitle.textContent = 'New Restaurant';
        modal.classList.add('open');
    });

    // Close Modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        modal.classList.remove('open');
    });

    // Filters (Debounce search)
    let timeout;
    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => loadRestaurants(1), 500);
    });

    ['cuisineFilter', 'statusFilter'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => loadRestaurants(1));
    });

    // Form Submit
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('restaurantId').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Clean empty fields
        for (let key in data) {
            if (data[key] === '') delete data[key];
        }

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/restaurants/${id}` : '/api/restaurants';

        try {
            const result = await fetchAPI(url, {
                method,
                body: JSON.stringify(data)
            });

            if (result.response.ok) {
                showToast(id ? 'Restaurant updated' : 'Restaurant created', 'success');
                modal.classList.remove('open');
                loadRestaurants(currentPage); // Reload
            } else {
                showToast(result.data.message || 'Error', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Server error', 'error');
        }
    });
}

// Global functions for inline onclick handlers
window.openEditModal = (id) => {
    const r = restaurants.find(x => x.id === id);
    if (!r) return;

    document.getElementById('restaurantId').value = r.id;
    document.querySelector('input[name="name"]').value = r.name;
    document.querySelector('input[name="address"]').value = r.address;
    document.querySelector('select[name="cuisine"]').value = r.cuisine;
    document.querySelector('select[name="status"]').value = r.status;
    document.querySelector('input[name="average_price"]').value = r.average_price || '';
    document.querySelector('input[name="rating"]').value = r.rating || '';
    document.querySelector('input[name="image"]').value = r.image || '';

    modalTitle.textContent = 'Edit Restaurant';
    modal.classList.add('open');
};

window.deleteRestaurant = async (id) => {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;

    try {
        const result = await fetchAPI(`/api/restaurants/${id}`, { method: 'DELETE' });
        if (result.response.ok) {
            showToast('Restaurant deleted', 'success');
            loadRestaurants(currentPage);
        } else {
            showToast(result.data.message, 'error');
        }
    } catch (error) {
        showToast('Server error', 'error');
    }
};

window.toggleFavorite = async (id, btn) => {
    const isFav = favorites.has(id);
    const method = isFav ? 'DELETE' : 'POST';

    try {
        const result = await fetchAPI(`/api/favorites/${id}`, { method });
        if (result.response.ok) {
            if (isFav) {
                favorites.delete(id);
                btn.classList.remove('active');
            } else {
                favorites.add(id);
                btn.classList.add('active');
            }
        }
    } catch (error) {
        console.error(error);
    }
};
