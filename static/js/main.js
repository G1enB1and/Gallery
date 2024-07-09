/* main.js */
import { initializePage, adjustMainContent } from './dom.js';
import { handleKeyPress, expandAll, collapseAll, attachSlideshowEventListeners } from './events.js';
import { populateFileTree } from './fileTree.js';
import { initializeGallery, getCurrentPage } from './dom_pinterest.js';
import { displayMedia, setData } from './media.js';

let loadingCount = 0;

document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing page.');
    initializePage();
    adjustMainContent();
    populateFileTree();

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

    // Event listener for Apply button in settings
    const applyButton = document.getElementById('applySettings');
    if (applyButton) {
        applyButton.addEventListener('click', () => {
            const selectedTheme = document.getElementById('themeSwitcher').value;
            const slideshowInterval = document.getElementById('slideshowInterval').value;
            const showHiddenFiles = document.getElementById('showHiddenFiles').checked;
            applySettings(selectedTheme, slideshowInterval, showHiddenFiles);
        });
    }

    const view = new URLSearchParams(window.location.search).get('view') || 'gallery';
    console.log(`Initial view: ${view}`);
    if (view === 'slideshow') {
        console.log('Initial load of slideshow view, attaching event listeners.');
        attachSlideshowEventListeners();
        const image = new URLSearchParams(window.location.search).get('image');
        if (image) {
            displayMedia(decodeURIComponent(image));
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
                            displayMedia(decodeURIComponent(image));
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

    /* only show loading screen on view change if the new view is the gallery */
    if (view === 'gallery') {
        loadingCount++;
        showLoadingScreen(); /* show loading screen when view changes */
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

            // Dispatch a custom event when the view changes
            document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view } }));

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
                                setFocusToGallery();  // Set focus after loading
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
                    displayMedia(decodeURIComponent(image)).then(() => {
                        loadingCount--;
                        checkHideLoadingScreen();
                    }); // Ensure the image is displayed
                } else {
                    loadingCount--;
                    checkHideLoadingScreen();
                }
            } else if (view === 'settings') {
                hideLoadingScreen(); // Ensure loading screen is hidden when opening settings
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
    themeSwitcher.value = currentTheme;

    themeSwitcher.addEventListener('change', (event) => {
        const selectedTheme = event.target.value;
        applyTheme(selectedTheme);
        localStorage.setItem('theme', selectedTheme);
    });
}

// Initialize theme on initial load
function initializeTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme);
}

function applyTheme(theme) {
    let link = document.querySelector('link[data-theme="theme"]');
    if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.dataset.theme = 'theme';
        document.head.appendChild(link);
    }
    link.href = theme === 'dark' ? '/static/css/dark.css' : '/static/css/light.css';

    // Update gallery button image
    const galleryImg = document.getElementById('gallery-img');
    if (galleryImg) {
        galleryImg.src = theme === 'dark' ? '/static/images/galleryDarkMode.png' : '/static/images/galleryLightMode.png';
    }
    document.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
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
        loadingCount++;
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
                    loadingCount--;
                    checkHideLoadingScreen();
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
            loadingCount--;
            checkHideLoadingScreen();
            reject(error);
        });
    });
}

// Check if the loading screen should be hidden
function checkHideLoadingScreen() { 
    /* if all loading stages are complete or if the documents readystate is complete */
    if (loadingCount <= 0 || document.readyState === "complete") {
        hideLoadingScreen();
    }
}

document.onreadystatechange = function () {
    if (document.readyState === "complete") {
        console.log("Page is fully loaded.");
        hideLoadingScreen();
    }
};

// New function to apply settings
function applySettings(theme, slideshowInterval, showHiddenFiles) {
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    localStorage.setItem('slideshowInterval', slideshowInterval);
    localStorage.setItem('showHiddenFiles', showHiddenFiles);

    // Apply slideshow interval
    if (window.slideshowTimer) {
        clearInterval(window.slideshowTimer);
        window.slideshowTimer = setInterval(() => {
            // Call your next image function here
        }, slideshowInterval * 1000);
    }

    // Apply show hidden files setting
    showLoadingScreen();
    updateLoadingText('Updating settings...');

    // Apply show hidden files setting
    fetch('/update_hidden_files', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showHidden: showHiddenFiles }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reload the file tree and gallery
            populateFileTree();

            // Reload the root folder images
            return fetch('/update-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ directory: 'Pictures', showHidden: showHiddenFiles })
            });
        }
        throw new Error('Failed to update hidden files setting');
    })
    .then(response => response.text())
    .then(() => {
        // Fetch updated images
        return fetch('images.json');
    })
    .then(response => response.json())
    .then(images => {
        setData(images);
        // Refresh the gallery with the new images
        initializeGallery(images, 1);
        hideLoadingScreen();
    })
    .catch(error => {
        console.error('Error applying settings:', error);
        hideLoadingScreen();
    });
}

// Export functions that need to be accessible from other modules
export {
    changeView,
    toggleSettingsView,
    initializeThemeSwitcher,
    initializeTheme,
    applyTheme,
    fetchImages,
    applySettings,
};