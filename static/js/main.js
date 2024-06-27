// main.js
import { initializePage, adjustMainContent } from './dom.js';
import { handleKeyPress, expandAll, collapseAll } from './events.js';
import { populateFileTree } from './fileTree.js';

// adding this line breaks the slideshow next button and causes double key presses,
// but removing it breaks switching from gslideshow back to gallery.
// without it: Error changing view: ReferenceError: getCurrentPage is not defined
import { initializeGallery, getCurrentPage } from './dom_pinterest.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    adjustMainContent(); // Ensure content is adjusted initially
    populateFileTree(); // Populate the file tree initially
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);

    document.addEventListener('keydown', (e) => {
        handleKeyPress(e);
    });

    // Event listener for settings icon
    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            changeView('settings');
        });
    }

    // Event listener for gallery button
    const galleryButton = document.getElementById('gallery-button');
    if (galleryButton) {
        galleryButton.addEventListener('click', () => {
            changeView('gallery');
        });
    }
});

function changeView(view) {
    fetch(`index.html?view=${view}`)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = document.getElementById('mainContent');
            const newContent = doc.querySelector('#mainContent').innerHTML;
            mainContent.innerHTML = newContent;
            window.history.pushState({}, '', `index.html?view=${view}`);
            
            if (view === 'gallery') {
                const currentPage = getCurrentPage();
                fetch('images.json')
                    .then(response => response.json())
                    .then(images => {
                        initializeGallery(images, currentPage);
                    })
                    .catch(error => console.error('Error fetching images:', error));
            } else if (view === 'slideshow') {
                setupEventListeners(); // Ensure event listeners are set up for the slideshow
            }
        })
        .catch(error => console.error('Error changing view:', error));
}
