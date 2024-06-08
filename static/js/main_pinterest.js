// main_pinterest.js
import { setData, renderImages, renderPagination, getCurrentPage, setCurrentPage } from './dom_pinterest.js';
import { setupMediaClickListener } from './events_pinterest.js';
import { restoreScrollPositionAfterImagesLoad } from './utils_pinterest.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentPage = getCurrentPage();
    let data = [];

    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            setData(images);
            renderImages(images, currentPage, 10); // Render the first 10 images
            renderPagination();

            // Load the rest of the images after the initial set
            setTimeout(() => {
                renderImages(images, currentPage); // Render the remaining images
            }, 100); // Adjust the timeout as necessary

            restoreScrollPositionAfterImagesLoad(); // Restore scroll position after images load
            setupMediaClickListener(data); // Setup click listener for media
        })
        .catch(error => console.error('Error fetching images:', error));
});
