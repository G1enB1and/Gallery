// main_pinterest.js
import { initializeGallery, setData, getCurrentPage } from './dom_pinterest.js';

document.addEventListener('DOMContentLoaded', () => {
    const view = new URLSearchParams(window.location.search).get('view');

    if (view === 'gallery' || !view) { // Initialize the gallery only if the view is gallery or no view is specified
        let currentPage = getCurrentPage();
        //let data = [];

        fetch('images.json')
            .then(response => response.json())
            .then(images => {
                //data = images;
                //setData(images);
                initializeGallery(images, currentPage);
            })
            .catch(error => console.error('Error fetching images:', error));
    }
});
