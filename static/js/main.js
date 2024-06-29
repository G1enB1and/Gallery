import { initializePage, adjustMainContent } from './dom.js';
import { handleKeyPress, expandAll, collapseAll, attachSlideshowEventListeners } from './events.js'; // Ensure attachSlideshowEventListeners is imported
import { populateFileTree } from './fileTree.js';
import { initializeGallery, getCurrentPage } from './dom_pinterest.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing page.');
    initializePage();
    adjustMainContent(); // Ensure content is adjusted initially
    populateFileTree(); // Populate the file tree initially

    const expandAllButton = document.getElementById('expandAll');
    if (expandAllButton) {
        expandAllButton.addEventListener('click', expandAll);
    }

    const collapseAllButton = document.getElementById('collapseAll');
    if (collapseAllButton) {
        collapseAllButton.addEventListener('click', collapseAll);
    }

    document.addEventListener('keydown', (e) => {
        handleKeyPress(e);
    });

    // Event listener for settings icon
    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            toggleSettingsView();
        });
    }

    // Event listener for gallery button
    const galleryButton = document.getElementById('gallery-button');
    if (galleryButton) {
        galleryButton.addEventListener('click', () => {
            changeView('gallery');
        });
    }

    const view = new URLSearchParams(window.location.search).get('view');
    console.log(`Initial view: ${view}`);
    if (view === 'slideshow') {
        console.log('Initial load of slideshow view, attaching event listeners.');
        attachSlideshowEventListeners(); // Attach slideshow event listeners on initial load if view is slideshow
    }

    // Use MutationObserver to detect changes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('#nextButton')) {
                        console.log('Slideshow content loaded, attaching event listeners.');
                        attachSlideshowEventListeners();
                    }
                });
            }
        });
    });

    observer.observe(document.getElementById('mainContent'), {
        childList: true,
        subtree: true
    });
});

function changeView(view, image = null) {
    console.log(`Changing view to: ${view}`);
    let url = `index.html?view=${view}`;
    if (view === 'slideshow' && image) {
        url += `&image=${encodeURIComponent(image)}`;
    }

    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = document.getElementById('mainContent');
            const newContent = doc.querySelector('#mainContent').innerHTML;
            mainContent.innerHTML = newContent;
            console.log(`View changed to: ${view}, content updated.`);
            window.history.pushState({}, '', url);
            
            if (view === 'gallery') {
                console.log('Initializing gallery view.');
                const currentPage = getCurrentPage();
                fetch('images.json')
                    .then(response => response.json())
                    .then(images => {
                        initializeGallery(images, currentPage);
                    })
                    .catch(error => console.error('Error fetching images:', error));
            } else if (view === 'slideshow') {
                console.log('Initializing slideshow view, attaching event listeners.');
                attachSlideshowEventListeners(); // Ensure event listeners are set up for the slideshow
            }
        })
        .catch(error => console.error('Error changing view:', error));
}

function toggleSettingsView() {
    const currentView = new URLSearchParams(window.location.search).get('view') || 'gallery';
    const previousView = sessionStorage.getItem('previousView');
    const currentImage = new URLSearchParams(window.location.search).get('image');

    if (currentView === 'settings' && previousView) {
        const previousImage = sessionStorage.getItem('previousImage');
        changeView(previousView, previousImage);
        sessionStorage.removeItem('previousView');
        sessionStorage.removeItem('previousImage');
    } else {
        sessionStorage.setItem('previousView', currentView);
        if (currentView === 'slideshow' && currentImage) {
            sessionStorage.setItem('previousImage', currentImage);
        }
        changeView('settings');
    }
}
