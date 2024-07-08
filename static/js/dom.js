import { initializeGallery } from './dom_pinterest.js';
import { displayMedia, nextImage, prevImage, togglePlayPause, setData } from './media.js';

export function initializePage() {
    const view = new URLSearchParams(window.location.search).get('view');
    const image = new URLSearchParams(window.location.search).get('image');

    if (view === 'slideshow' && image) {
        fetch('images.json')
            .then(response => response.json())
            .then(images => {
                setData(images); // Ensure data is set
                displayMedia(image);
                setupEventListeners();
            })
            .catch(error => console.error('Error fetching images:', error));
    } else {
        fetch('images.json')
            .then(response => response.json())
            .then(images => {
                setData(images); // Ensure data is set
                initializeGallery(images); // Call the new initializeGallery function
                setupEventListeners();
            })
            .catch(error => console.error('Error fetching images:', error));
    }
}

function setupEventListeners() {
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            console.log('Next button clicked');
            nextImage();
        });
    }

    const prevButton = document.getElementById('prevButton');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            console.log('Previous button clicked');
            prevImage();
        });
    }

    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', () => {
            console.log('Play/Pause button clicked');
            togglePlayPause();
        });
    }
}

export function adjustMainContent() {
    const leftPanel = document.getElementById('leftPanel');
    const leftPanelWidth = leftPanel.style.display === 'none' ? '0px' : leftPanel.offsetWidth + 'px';

    const prevButton = document.getElementById('prevButton');
    if (prevButton) {
        prevButton.style.left = leftPanel.style.display === 'none' ? '20px' : `calc(${leftPanelWidth} + 20px)`;
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