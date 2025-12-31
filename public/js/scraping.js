document.addEventListener('DOMContentLoaded', () => {
    // Check auth
    if (!getCookie('token')) {
        window.location.href = '/login.html';
        return;
    }

    const form = document.getElementById('scrapingForm');
    const statusContainer = document.getElementById('statusContainer');
    const loadingState = document.getElementById('loadingState');
    const resultState = document.getElementById('resultState');
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');
    const errorText = document.getElementById('errorText');
    const sheetLink = document.getElementById('sheetLink');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI Reset
        statusContainer.style.display = 'block';
        loadingState.style.display = 'block';
        resultState.style.display = 'none';
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        form.querySelector('button').disabled = true;

        const city = document.getElementById('cityInput').value;
        const keyword = document.getElementById('keywordInput').value;

        try {
            const result = await fetchAPI('/api/scraping/trigger', {
                method: 'POST',
                body: JSON.stringify({ city, keyword })
            });

            loadingState.style.display = 'none';
            resultState.style.display = 'block';

            if (result.response.ok) {
                successMsg.style.display = 'block';
                if (result.data.sheetUrl) {
                    sheetLink.href = result.data.sheetUrl;
                    sheetLink.style.display = 'inline-block';
                } else {
                    sheetLink.style.display = 'none';
                }

                // Display scraped items
                if (result.data.items && result.data.items.length > 0) {
                    displayResults(result.data.items);
                }
            } else {
                errorMsg.style.display = 'block';
                errorText.textContent = result.data.message || 'Unknown error occurred';
            }

        } catch (error) {
            loadingState.style.display = 'none';
            resultState.style.display = 'block';
            errorMsg.style.display = 'block';
            errorText.textContent = 'Network or server error. Please try again.';
            console.error(error);
        } finally {
            form.querySelector('button').disabled = false;
        }
    });

    // Function to display results as cards
    function displayResults(items) {
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');
        const resultsCount = document.getElementById('resultsCount');

        resultsCount.textContent = `${items.length} result${items.length > 1 ? 's' : ''}`;
        resultsSection.style.display = 'block';

        resultsGrid.innerHTML = items.map(item => `
            <div class="glass glass-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <h3 style="margin: 0; color: var(--primary);">${item['Business Name'] || 'N/A'}</h3>
                    ${item.Rating ? `
                        <span class="badge" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);">
                            ⭐ ${item.Rating}
                        </span>
                    ` : ''}
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9rem; opacity: 0.9;">
                    ${item.Address ? `
                        <div><i class="fas fa-map-marker-alt" style="width: 20px; color: var(--primary);"></i> ${item.Address}</div>
                    ` : ''}
                    
                    ${item.Phone ? `
                        <div><i class="fas fa-phone" style="width: 20px; color: var(--primary);"></i> ${item.Phone}</div>
                    ` : ''}
                    
                    ${item.Category ? `
                        <div><i class="fas fa-utensils" style="width: 20px; color: var(--primary);"></i> ${item.Category}</div>
                    ` : ''}

                    ${item.Reviews ? `
                        <div><i class="fas fa-comment" style="width: 20px; color: var(--primary);"></i> ${item.Reviews} reviews</div>
                    ` : ''}
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                    ${item['Google Maps Link'] ? `
                        <a href="${item['Google Maps Link']}" target="_blank" class="btn btn-sm btn-outline">
                            <i class="fas fa-map"></i> Maps
                        </a>
                    ` : ''}
                    
                    ${item.Website ? `
                        <a href="${item.Website}" target="_blank" class="btn btn-sm btn-outline">
                            <i class="fas fa-globe"></i> Website
                        </a>
                    ` : ''}

                    ${item.Instagram ? `
                        <a href="${item.Instagram}" target="_blank" class="btn btn-sm btn-outline">
                            <i class="fab fa-instagram"></i>
                        </a>
                    ` : ''}

                    ${item.Facebook ? `
                        <a href="${item.Facebook}" target="_blank" class="btn btn-sm btn-outline">
                            <i class="fab fa-facebook"></i>
                        </a>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
});
