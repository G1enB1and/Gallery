// events.js
import { nextImage, prevImage, togglePlayPause } from './media.js';

// Function to handle keypress
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