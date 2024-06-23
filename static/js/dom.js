// dom.js
import { setData, displayMedia, nextImage, prevImage, togglePlayPause } from './media.js';

export function initializePage() {
    const view = new URLSearchParams(window.location.search).get('view');
    const image = new URLSearchParams(window.location.search).get('image');

    if (view === 'slideshow' && image) {
        displayMedia(image);
    } else {
        fetch('images.json')
            .then(response => response.json())
            .then(images => {
                setData(images);
                setupGallery(images);
                setupEventListeners();
            })
            .catch(error => console.error('Error fetching images:', error));
    }
}

function setupGallery(images) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear previous images

    images.slice(0, 120).forEach((src, index) => { // Limit to 120 images
        const div = document.createElement('div');
        div.className = 'gallery-item';
        const img = document.createElement('img');
        img.src = src;
        img.className = 'gallery-image';
        img.addEventListener('click', () => {
            window.location.href = `index.html?view=slideshow&image=${encodeURIComponent(src)}`;
        });
        div.appendChild(img);
        gallery.appendChild(div);
    });

    const msnry = new Masonry(gallery, {
        itemSelector: '.gallery-item',
        columnWidth: '.gallery-item',
        percentPosition: true
    });

    imagesLoaded(gallery, () => {
        msnry.layout();
    });
}

function setupEventListeners() {
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', nextImage);
    }

    const prevButton = document.getElementById('prevButton');
    if (prevButton) {
        prevButton.addEventListener('click', prevImage);
    }

    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', togglePlayPause);
    }
}

export function adjustMainContent() {
    const leftPanel = document.getElementById('leftPanel');
    const leftPanelWidth = leftPanel && leftPanel.style.display === 'none' ? '0px' : (leftPanel ? leftPanel.offsetWidth + 'px' : '0px');

    const prevButton = document.getElementById('prevButton');
    if (prevButton) {
        prevButton.style.left = leftPanel && leftPanel.style.display === 'none' ? '20px' : `calc(${leftPanelWidth} + 20px)`;
    }

    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.width = leftPanel && leftPanel.style.display === 'none' ? '100%' : `calc(100% - ${leftPanelWidth})`;
    }

    const hoverArea = document.getElementById('hoverArea');
    if (hoverArea) {
        hoverArea.style.left = '50%';
        hoverArea.style.transform = 'translateX(-50%)';
    }

    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.style.left = '50%';
        playPauseButton.style.transform = 'translateX(-50%)';
    }

    const imageContainer = document.getElementById('imageContainer');
    if (imageContainer && mainContent) {
        imageContainer.style.maxWidth = mainContent.style.width;
        imageContainer.style.transition = 'none';
    }
}
