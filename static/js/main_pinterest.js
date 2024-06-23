// main_pinterest.js
import { initializeGallery, setData, getCurrentPage } from './dom_pinterest.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentPage = getCurrentPage();
    let data = [];

    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            setData(images);
            initializeGallery(images, currentPage);
        })
        .catch(error => console.error('Error fetching images:', error));
});
