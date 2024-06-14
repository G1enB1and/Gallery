// loader.js
import { renderImages, renderPagination, getCurrentPage, setCurrentPage } from './dom_pinterest.js';
import { setupMediaClickListener } from './events_pinterest.js';
import { restoreScrollPositionAfterImagesLoad } from './utils_pinterest.js';

export async function loadPage(data, page) {
    const loading = document.getElementById('loading');
    const gallery = document.getElementById('gallery');
    const initialScrollPosition = window.scrollY;

    loading.style.display = 'block';
    gallery.style.display = 'none';

    await renderImages(data, page, 10); // Render the first 10 images

    $(gallery).imagesLoaded({ background: true }, async function () {
        window.scrollTo(0, initialScrollPosition); // Restore scroll position after first images load

        loading.style.display = 'none'; // Hide loading animation
        gallery.style.display = 'block'; // Show gallery

        await renderImages(data, page); // Render the remaining images

        renderPagination();
        setupMediaClickListener(data); // Setup click listener for media

        // Restore scroll position after all images are loaded
        restoreScrollPositionAfterImagesLoad();
    });
}
