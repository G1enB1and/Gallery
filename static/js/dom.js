// dom.js
import { setData, displayMedia, nextImage, prevImage, togglePlayPause } from './media.js';

export function initializePage() {
    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            setData(images);
            setupGallery(images);
            setupEventListeners();
            displayMedia();
        })
        .catch(error => console.error('Error fetching images:', error));
}

function setupGallery(images) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear previous images

    images.forEach((src, index) => {
        const img = document.createElement('img');
        img.src = src;
        img.className = 'gallery-image';
        img.style.maxWidth = '300px';
        img.style.height = 'auto';
        img.dataset.index = index;
        img.addEventListener('click', () => {
            window.location.href = `index.html?image=${encodeURIComponent(src)}`;
        });
        gallery.appendChild(img);
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
