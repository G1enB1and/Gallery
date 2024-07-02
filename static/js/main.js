import { initializePage, adjustMainContent } from './dom.js';
import { handleKeyPress, expandAll, collapseAll, attachSlideshowEventListeners } from './events.js';
import { populateFileTree } from './fileTree.js';
import { initializeGallery, getCurrentPage } from './dom_pinterest.js';
import { displayMedia } from './media.js';

let loadingCount = 0;

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

    const view = new URLSearchParams(window.location.search).get('view') || 'gallery';
    console.log(`Initial view: ${view}`);
    if (view === 'slideshow') {
        console.log('Initial load of slideshow view, attaching event listeners.');
        attachSlideshowEventListeners(); // Attach slideshow event listeners on initial load if view is slideshow
        const image = new URLSearchParams(window.location.search).get('image');
        if (image) {
            displayMedia(decodeURIComponent(image)); // Ensure the image is displayed
        }
    }

    // Use MutationObserver to detect changes in the DOM
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('#nextButton')) {
                        console.log('Slideshow content loaded, attaching event listeners.');
                        attachSlideshowEventListeners();
                        const image = new URLSearchParams(window.location.search).get('image');
                        if (image) {
                            displayMedia(decodeURIComponent(image)); // Ensure the image is displayed
                        }
                    }
                });
            }
        });
    });

    observer.observe(document.getElementById('mainContent'), {
        childList: true,
        subtree: true
    });

    // Initialize theme on initial load
    initializeTheme();

    // Start fetching images on initial load
    fetchImages().then(() => {
        hideLoadingScreen();
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
                        // Update loading screen text for placeholders
                        updateLoadingText('Loading placeholders...');
                        // Simulate placeholder loading with a timeout for demonstration
                        setTimeout(() => {
                            // Update loading screen text for initial screen space images
                            updateLoadingText('Loading initial screen space images...');
                            setTimeout(() => {
                                loadingCount--;
                                checkHideLoadingScreen();
                            }, 1000); // Simulate initial screen space image loading time
                        }, 1000); // Simulate placeholder loading time
                    })
                    .catch(error => {
                        console.error('Error fetching images:', error);
                        loadingCount--;
                        checkHideLoadingScreen();
                    });
            } else if (view === 'slideshow') {
                console.log('Initializing slideshow view, attaching event listeners.');
                attachSlideshowEventListeners(); // Ensure event listeners are set up for the slideshow
                if (image) {
                    displayMedia(decodeURIComponent(image)); // Ensure the image is displayed
                    loadingCount--;
                    checkHideLoadingScreen();
                }
            }
        })
        .catch(error => {
            console.error('Error changing view:', error);
            loadingCount--;
            checkHideLoadingScreen();
        });
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
        hideLoadingScreen(); // Ensure loading screen is hidden when opening settings
    }
}

// Initialize theme switcher and handle theme changes
function initializeThemeSwitcher() {
    const themeSwitcher = document.getElementById('themeSwitcher');
    if (!themeSwitcher) return;

    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    themeSwitcher.value = currentTheme;

    themeSwitcher.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        document.body.classList.toggle('dark-mode', selectedTheme === 'dark');
        localStorage.setItem('theme', selectedTheme);
    });
}

// Initialize theme on initial load
function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
}

// Show the loading screen
export function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

// Hide the loading screen
export function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Update loading screen text
export function updateLoadingText(text) {
    const loadingSubtext = document.getElementById('loading-subtext');
    if (loadingSubtext) {
        loadingSubtext.textContent = text;
    }
}

// Fetch images and update progress bar
function fetchImages() {
    return new Promise((resolve, reject) => {
        showLoadingScreen();
        updateLoadingText('Fetching images...');

        fetch('/update-images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ directory: 'Pictures' }) // Adjust the directory as needed
        })
        .then(response => {
            const reader = response.body.getReader();
            const contentLength = +response.headers.get('Content-Length');
            let receivedLength = 0;
            let chunks = [];

            reader.read().then(function processText({ done, value }) {
                if (done) {
                    console.log('Fetch complete');
                    resolve(); // Resolve the promise when fetch is complete
                    return;
                }

                receivedLength += value.length;
                chunks.push(value);
                let progress = (receivedLength / contentLength) * 100;
                document.getElementById('progress').style.width = `${progress}%`;
                return reader.read().then(processText);
            });
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            reject(error);
        });
    });
}

// Check if the loading screen should be hidden
function checkHideLoadingScreen() {
    if (loadingCount <= 0) {
        hideLoadingScreen();
    }
}
