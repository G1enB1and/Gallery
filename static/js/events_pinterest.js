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

                // Navigate to index.html with media URL as a query parameter and set view to slideshow
                const currentUrl = new URL(window.location);
                currentUrl.searchParams.set('view', 'slideshow');
                currentUrl.searchParams.set('image', encodeURIComponent(mediaUrl));
                window.location.href = currentUrl.toString();
            } else {
                console.error('Failed to load image: undefined');
            }
        }
    });
}
