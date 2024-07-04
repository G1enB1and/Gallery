import { initializeGallery, setData, getCurrentPage, setCurrentPage } from './dom_pinterest.js';
import { initializePage } from './dom.js';
import { handleKeyPress, expandAll, collapseAll, attachSlideshowEventListeners } from './events.js';
import { getCurrentImageUrl } from './utils.js';
import { setupMediaClickListener } from './events_pinterest.js';
import { saveSessionState, restoreScrollPositionAfterImagesLoad } from './utils_pinterest.js';

let data = [];
let slideshowTimer;

document.addEventListener('DOMContentLoaded', () => {
    const view = new URLSearchParams(window.location.search).get('view');
    
    initializePage();
    loadSettings();
    setupEventListeners();

    if (view === 'gallery' || !view) {
        loadGallery();
    } else if (view === 'slideshow') {
        loadSlideshow();
    } else if (view === 'settings') {
        loadSettings();
    }
});

function loadGallery() {
    let currentPage = getCurrentPage();
    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            setData(images);
            initializeGallery(images, currentPage);
            setupMediaClickListener(data);
            restoreScrollPositionAfterImagesLoad();
        })
        .catch(error => console.error('Error fetching images:', error));
}

function loadSlideshow() {
    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            setData(images);
            const currentImageUrl = getCurrentImageUrl();
            if (currentImageUrl) {
                displayMedia(currentImageUrl);
            }
            attachSlideshowEventListeners();
            startSlideshow();
        })
        .catch(error => console.error('Error fetching images:', error));
}

function loadSettings() {
    const themeSwitcher = document.getElementById('themeSwitcher');
    const slideshowInterval = document.getElementById('slideshowInterval');
    const showHiddenFiles = document.getElementById('showHiddenFiles');
    const applyButton = document.getElementById('applySettings');

    if (themeSwitcher && slideshowInterval && showHiddenFiles && applyButton) {
        // Load saved settings
        themeSwitcher.value = localStorage.getItem('theme') || 'light';
        slideshowInterval.value = localStorage.getItem('slideshowInterval') || '3';
        showHiddenFiles.checked = localStorage.getItem('showHiddenFiles') === 'true';

        applyButton.addEventListener('click', () => {
            localStorage.setItem('theme', themeSwitcher.value);
            localStorage.setItem('slideshowInterval', slideshowInterval.value);
            localStorage.setItem('showHiddenFiles', showHiddenFiles.checked);
            applySettings();
        });
    }
}

function applySettings() {
    const theme = localStorage.getItem('theme');
    const interval = localStorage.getItem('slideshowInterval');
    const showHidden = localStorage.getItem('showHiddenFiles') === 'true';

    // Apply theme
    document.body.className = theme;

    // Apply slideshow interval
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
        startSlideshow();
    }

    // Apply show hidden files setting
    fetch('/update_hidden_files', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ showHidden }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Reload the file tree and gallery
            loadFileTree();
            loadGallery();
        }
    });
}

function setupEventListeners() {
    document.addEventListener('keydown', handleKeyPress);
    
    const expandAllButton = document.getElementById('expandAll');
    if (expandAllButton) {
        expandAllButton.addEventListener('click', expandAll);
    }

    const collapseAllButton = document.getElementById('collapseAll');
    if (collapseAllButton) {
        collapseAllButton.addEventListener('click', collapseAll);
    }

    const galleryButton = document.getElementById('gallery-button');
    if (galleryButton) {
        galleryButton.addEventListener('click', () => {
            saveSessionState(window.scrollY, getCurrentPage());
            window.location.href = 'index.html?view=gallery';
        });
    }

    const settingsIcon = document.getElementById('settings-icon');
    if (settingsIcon) {
        settingsIcon.addEventListener('click', () => {
            window.location.href = 'index.html?view=settings';
        });
    }
}

function startSlideshow() {
    const interval = localStorage.getItem('slideshowInterval') || 3;
    if (slideshowTimer) {
        clearInterval(slideshowTimer);
    }
    slideshowTimer = setInterval(() => {
        nextImage();
    }, interval * 1000);
}

function displayMedia(url) {
    const slideshowImage = document.getElementById('slideshowDisplayedImage');
    const slideshowVideo = document.getElementById('slideshowDisplayedVideo');

    if (slideshowImage && slideshowVideo) {
        if (url.endsWith('.mp4')) {
            slideshowImage.style.display = 'none';
            slideshowVideo.style.display = 'block';
            slideshowVideo.src = url;
            slideshowVideo.load();
        } else {
            slideshowVideo.style.display = 'none';
            slideshowImage.style.display = 'block';
            slideshowImage.src = url;
        }
        updateDataPanel(url);
    }
}

function updateDataPanel(imagePath) {
    fetch(`/get_image_info?path=${encodeURIComponent(imagePath)}`)
        .then(response => response.json())
        .then(data => {
            const dataPanel = document.getElementById('dataPanel');
            if (dataPanel) {
                dataPanel.innerHTML = '';
                for (const [key, value] of Object.entries(data)) {
                    const p = document.createElement('p');
                    p.textContent = `${key}: ${value}`;
                    dataPanel.appendChild(p);
                }
                
                // Add tag functionality
                const tagContainer = document.createElement('div');
                tagContainer.id = 'tagContainer';
                tagContainer.innerHTML = `
                    <h3>Tags</h3>
                    <div id="existingTags"></div>
                    <input type="text" id="newTag" placeholder="Add a new tag">
                    <button id="addTagButton">Add Tag</button>
                `;
                dataPanel.appendChild(tagContainer);

                const addTagButton = document.getElementById('addTagButton');
                const newTagInput = document.getElementById('newTag');

                if (addTagButton && newTagInput) {
                    addTagButton.addEventListener('click', () => {
                        const newTag = newTagInput.value.trim();
                        if (newTag) {
                            fetch('/add_tag', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ path: imagePath, tag: newTag }),
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    updateTags(imagePath);
                                    newTagInput.value = '';
                                }
                            });
                        }
                    });
                }

                updateTags(imagePath);
            }
        });
}

function updateTags(imagePath) {
    fetch(`/get_tags?path=${encodeURIComponent(imagePath)}`)
        .then(response => response.json())
        .then(tags => {
            const existingTags = document.getElementById('existingTags');
            if (existingTags) {
                existingTags.innerHTML = '';
                tags.forEach(tag => {
                    const span = document.createElement('span');
                    span.textContent = tag;
                    span.className = 'tag';
                    existingTags.appendChild(span);
                });
            }
        });
}

function nextImage() {
    const currentImageUrl = getCurrentImageUrl();
    const currentIndex = data.indexOf(currentImageUrl);
    const nextIndex = (currentIndex + 1) % data.length;
    const nextImageUrl = data[nextIndex];
    displayMedia(nextImageUrl);
    updateURL(nextImageUrl);
}

function prevImage() {
    const currentImageUrl = getCurrentImageUrl();
    const currentIndex = data.indexOf(currentImageUrl);
    const prevIndex = (currentIndex - 1 + data.length) % data.length;
    const prevImageUrl = data[prevIndex];
    displayMedia(prevImageUrl);
    updateURL(prevImageUrl);
}

function updateURL(imageUrl) {
    const url = new URL(window.location);
    url.searchParams.set('image', imageUrl);
    window.history.pushState({}, '', url);
}

function togglePlayPause() {
    const playIcon = document.querySelector('#playPauseButton .fa-play');
    const pauseIcon = document.querySelector('#playPauseButton .fa-pause');

    if (playIcon.style.display === 'none') {
        // Currently playing, so pause
        clearInterval(slideshowTimer);
        playIcon.style.display = 'inline';
        pauseIcon.style.display = 'none';
    } else {
        // Currently paused, so play
        startSlideshow();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    }
}

// Export functions that need to be accessible from other modules
export {
    nextImage,
    prevImage,
    togglePlayPause,
    displayMedia,
    updateDataPanel
};