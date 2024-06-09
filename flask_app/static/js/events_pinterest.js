// events_pinterest.js
import { saveSessionState } from './utils_pinterest.js';
import { getCurrentPage } from './dom_pinterest.js';

// events_pinterest.js

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

export function handleKeyPress(event) {
    console.log(`Key pressed: ${event.code}`);
    if (event.code === 'Space') {
        togglePlayPause();
    } else if (event.code === 'ArrowRight') {
        nextImage();
    } else if (event.code === 'ArrowLeft') {
        prevImage();
    } else if (event.altKey && event.code === 'Home') {
        collapseAll();
    } else if (event.altKey && event.code === 'End') {
        expandAll();
    }
}

// Other event handlers...

export function setupMediaClickListener(data) {
    const gallery = document.getElementById('gallery');
    
    gallery.addEventListener('click', function(event) {
        if (event.target && (event.target.matches('img.lazy') || event.target.matches('video.lazy'))) {
            const index = parseInt(event.target.getAttribute('data-index'));
            const mediaUrl = data[index]; // Get the URL of the clicked media

            if (mediaUrl) {
                // Save scroll position and current page before navigating
                saveSessionState(window.scrollY, getCurrentPage());

                // Navigate to index.html with media URL as a query parameter
                window.location.href = `index.html?image=${encodeURIComponent(mediaUrl)}`;
            } else {
                console.error('Failed to load image: undefined');
            }
        }
    });
}
