// loader.js
import { initializeGallery } from './dom_pinterest.js';
import { setupMediaClickListener } from './events_pinterest.js';
import { restoreScrollPositionAfterImagesLoad } from './utils_pinterest.js';

export async function loadPage(data, page) {
    const loading = document.getElementById('loading');
    const gallery = document.getElementById('gallery');
    if (!gallery) {
        console.error('Gallery element not found');
        return;
    }
    const initialScrollPosition = window.scrollY;

    if (loading) {
        loading.style.display = 'block';
    }
    gallery.style.display = 'none';

    await initializeGallery(data, page); // Call initializeGallery to handle all steps

    $(gallery).imagesLoaded({ background: true }, async function () {
        window.scrollTo(0, initialScrollPosition); // Restore scroll position after first images load

        if (loading) {
            loading.style.display = 'none'; // Hide loading animation
        }
        gallery.style.display = 'block'; // Show gallery

        await initializeGallery(data, page); // Call initializeGallery to handle remaining steps

        setupMediaClickListener(data); // Setup click listener for media

        // Restore scroll position after all images are loaded
        restoreScrollPositionAfterImagesLoad();
    });
}
