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
});
