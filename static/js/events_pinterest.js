// events_pinterest.js
import { saveSessionState } from './utils_pinterest.js';
import { getCurrentPage } from './dom_pinterest.js';

export function setupMediaClickListener(data) {
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.addEventListener('click', function(event) {
        if (event.target && (event.target.matches('img.imageItem') || event.target.matches('video.imageItem'))) {
            const index = parseInt(event.target.getAttribute('data-index'));
            const mediaUrl = data[index]; // Get the URL of the clicked media

            // Save scroll position and current page before navigating
            saveSessionState(window.scrollY, getCurrentPage());

            // Navigate to index.html with media URL as a query parameter
            window.location.href = `index.html?image=${encodeURIComponent(mediaUrl)}`;
        }
    });
}