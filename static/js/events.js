import { nextImage, prevImage, togglePlayPause } from './media.js';

let isTyping = false;

export function handleKeyPress(event) {
    // Check if the event target is an input or textarea
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        isTyping = true;
        return; // Exit the function early if the user is typing
    }

    // Check if we're in a typing state
    if (isTyping) {
        return; // Exit the function early if we're in a typing state
    }

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

// Function to handle focus on input fields
function handleInputFocus() {
    isTyping = true;
}

// Function to handle blur (losing focus) on input fields
function handleInputBlur() {
    isTyping = false;
}

// Add event listeners for focus and blur on input fields
export function attachInputEventListeners() {
    const inputFields = document.querySelectorAll('input[type="text"], textarea');
    inputFields.forEach(input => {
        input.addEventListener('focus', handleInputFocus);
        input.addEventListener('blur', handleInputBlur);
    });
}

// Add event listeners for slideshow controls on initial load and URL change
document.addEventListener('DOMContentLoaded', () => {
    const view = new URLSearchParams(window.location.search).get('view');
    console.log('Document loaded, attaching slideshow event listeners.');
    if (view === 'slideshow') {
        attachSlideshowEventListeners();
    }
    attachInputEventListeners();

    // Add global keydown event listener
    document.addEventListener('keydown', handleKeyPress);
});

// Listen for dynamic content changes
document.addEventListener('viewChanged', (event) => {
    if (event.detail.view === 'slideshow') {
        attachSlideshowEventListeners();
    }
    attachInputEventListeners();
});

// Export the isTyping variable and its setter
export function setIsTyping(value) {
    isTyping = value;
}

export { isTyping };