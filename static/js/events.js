import { nextImage, prevImage, togglePlayPause } from './media.js';

export function handleKeyPress(event) {
    console.log(`Key pressed: ${event.code}`);
    if (event.code === 'Space') {
        event.preventDefault();
        togglePlayPause();
    } else if (event.code === 'ArrowRight') {
        event.preventDefault();
        nextImage();
    } else if (event.code === 'ArrowLeft') {
        event.preventDefault();
        prevImage();
    } else if (event.altKey && event.code === 'Home') {
        collapseAll();
    } else if (event.altKey && event.code === 'End') {
        expandAll();
    }
}

// Function to expand all file tree nodes
export function expandAll() {
    const toggleIcons = document.querySelectorAll('#fileTree .toggle-icon');
    toggleIcons.forEach(icon => {
        const subList = icon.parentElement.querySelector('ul');
        if (subList) {
            subList.style.display = 'block';
            icon.innerHTML = '&#9660;'; // Down pointing triangle
        }
    });
}

// Function to collapse all file tree nodes
export function collapseAll() {
    const toggleIcons = document.querySelectorAll('#fileTree .toggle-icon');
    toggleIcons.forEach(icon => {
        const subList = icon.parentElement.querySelector('ul');
        if (subList) {
            subList.style.display = 'none';
            icon.innerHTML = '&#9654;'; // Right pointing triangle
        }
    });
}

// Attach slideshow event listeners
export function attachSlideshowEventListeners() {
    console.log('Attaching slideshow event listeners.');
    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            console.log('Next button clicked');
            nextImage();
        });
    } else {
        console.error('Next button not found.');
    }

    const prevButton = document.getElementById('prevButton');
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            console.log('Previous button clicked');
            prevImage();
        });
    } else {
        console.error('Previous button not found.');
    }

    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', () => {
            console.log('Play/Pause button clicked');
            togglePlayPause();
        });
    } else {
        console.error('Play/Pause button not found.');
    }
}

// Add event listeners for slideshow controls on initial load and URL change
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, attaching slideshow event listeners.');
    attachSlideshowEventListeners();
    window.addEventListener('popstate', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const view = urlParams.get('view');
        if (view === 'slideshow') {
            console.log('URL changed to slideshow view, attaching event listeners.');
            attachSlideshowEventListeners();
        }
    });
});
