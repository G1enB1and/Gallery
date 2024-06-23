// events_pinterest.js
import { saveSessionState } from './utils_pinterest.js';
import { getCurrentPage } from './dom_pinterest.js';

export function setupMediaClickListener(data) {
    const gallery = document.getElementById('gallery');
    
    gallery.addEventListener('click', function(event) {
        if (event.target && (event.target.matches('img.lazy') || event.target.matches('video.lazy'))) {
            const index = parseInt(event.target.getAttribute('data-index'));
            const mediaUrl = data[index]; // Get the URL of the clicked media

            if (mediaUrl) {
                // Save scroll position and current page before navigating
                saveSessionState(window.scrollY, getCurrentPage());

                // Navigate to index.html with media URL as a query parameter
                window.location.href = `index.html?image=${encodeURIComponent(mediaUrl)}`;
            } else {
                console.error('Failed to load image: undefined');
            }
        }
    });
} 
