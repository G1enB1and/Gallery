// main_pinterest.js
import { setData, getCurrentPage } from './dom_pinterest.js';
import { loadPage } from './loader.js';

document.addEventListener('DOMContentLoaded', () => {
    let currentPage = getCurrentPage();
    let data = [];

    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            setData(images);
            loadPage(data, currentPage);
        })
        .catch(error => console.error('Error fetching images:', error));
});
