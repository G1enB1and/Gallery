/* main.js */
import { initializePage, adjustMainContent } from './dom.js';
import { handleKeyPress, expandAll, collapseAll, attachSlideshowEventListeners } from './events.js';
import { populateFileTree } from './fileTree.js';
import { initializeGallery, getCurrentPage, setFocusToGallery } from './dom_pinterest.js';
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

    // If no view is specified, set it to gallery
    if (!window.location.search.includes('view=')) {
        changeView('gallery');
    } else if (view === 'slideshow') {
        console.log('Initial load of slideshow view, attaching event listeners.');
        attachSlideshowEventListeners();
        const image = new URLSearchParams(window.location.search).get('image');
        if (image) {
            displayMedia(decodeURIComponent(image));
        }
    } else {
        changeView(view);
    }

    // Initialize theme on initial load
    initializeTheme();

    // Start fetching images on initial load
    fetchImages().then(() => {
        hideLoadingScreen();
    });

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
                    if (node.nodeType === Node.ELEMENT_NODE && node.querySelector('#settingsForm')) {
                        console.log('Settings form loaded, initializing settings.');
                        initializeSettings();
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
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = document.getElementById('mainContent');
            if (!mainContent) {
                throw new Error('Main content element not found');
            }
            const newContent = doc.querySelector('#mainContent').innerHTML;
            if (!newContent) {
                throw new Error('New content not found in fetched HTML');
            }
            mainContent.innerHTML = newContent;
            console.log(`View changed to: ${view}, content updated.`);
            window.history.pushState({}, '', url);

            // Dispatch a custom event when the view changes
            document.dispatchEvent(new CustomEvent('viewChanged', { detail: { view } }));

            if (view === 'gallery') {
                console.log('Initializing gallery view.');
                const currentPage = getCurrentPage();

                return fetch('images.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(images => {
                        initializeGallery(images, currentPage);
                        updateLoadingText('Loading placeholders...');
                        return new Promise(resolve => setTimeout(resolve, 1000));
                    })
                    .then(() => {
                        updateLoadingText('Loading initial screen space images...');
                        return new Promise(resolve => setTimeout(resolve, 1000));
                    })
                    .then(() => {
                        loadingCount--;
                        checkHideLoadingScreen();
                        setFocusToGallery();
                    });
            } else if (view === 'slideshow') {
                console.log('Initializing slideshow view, attaching event listeners.');
                attachSlideshowEventListeners(); // Ensure event listeners are set up for the slideshow
                if (image) {
                    return displayMedia(decodeURIComponent(image))
                        .then(() => {
                            loadingCount--;
                            checkHideLoadingScreen();
                        });
                }
            } else if (view === 'settings') {
                console.log('Initializing settings view.');
                initializeSettings();
                hideLoadingScreen();
            }
        })
        .catch(error => {
            console.error('Error changing view:', error);
            alert(`Failed to change view: ${error.message}`);
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
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

// Hide the loading screen
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

// Update loading screen text
function updateLoadingText(text) {
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

// New function to initialize settings
function initializeSettings() {
    console.log('Initializing settings.');
    const settingsForm = document.getElementById('settingsForm');
    if (!settingsForm) {
        console.error('Settings form not found');
        return;
    }

    // Load current settings
    const currentTheme = localStorage.getItem('theme') || 'light';
    const currentSlideshowInterval = localStorage.getItem('slideshowInterval') || '3';
    const currentShowHiddenFiles = localStorage.getItem('showHiddenFiles') === 'true';

    // Set form values
    document.getElementById('themeSwitcher').value = currentTheme;
    document.getElementById('slideshowInterval').value = currentSlideshowInterval;
    document.getElementById('showHiddenFiles').checked = currentShowHiddenFiles;

    // Attach event listener to apply button
    const applyButton = document.getElementById('applySettings');
    if (applyButton) {
        applyButton.addEventListener('click', applySettings);
    }
}

// New function to apply settings
function applySettings() {
    console.log('Applying settings');
    const theme = document.getElementById('themeSwitcher').value;
    const slideshowInterval = document.getElementById('slideshowInterval').value;
    const showHiddenFiles = document.getElementById('showHiddenFiles').checked;

    // Apply theme
    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // Save slideshow interval
    localStorage.setItem('slideshowInterval', slideshowInterval);

    // Apply show hidden files setting
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
        console.log('Settings applied successfully');
    })
    .catch(error => {
        console.error('Error applying settings:', error);
        hideLoadingScreen();
    });
}

// Listen for view changes
document.addEventListener('viewChanged', (event) => {
    if (event.detail.view === 'settings') {
        initializeSettings();
    }
});

// Export functions that need to be accessible from other modules
export {
    changeView,
    toggleSettingsView,
    initializeThemeSwitcher,
    initializeTheme,
    applyTheme,
    fetchImages,
    applySettings,
    showLoadingScreen,
    hideLoadingScreen,
    updateLoadingText,
};