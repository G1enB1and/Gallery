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
            renderImages(images, currentPage); // Render the first page of images
            renderPagination();
            restoreScrollPositionAfterImagesLoad(); // Restore scroll position after images load
            setupMediaClickListener(data); // Setup click listener for media
        })
        .catch(error => console.error('Error fetching images:', error));
});