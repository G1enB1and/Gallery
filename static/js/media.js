/* media.js */
import { hideLoadingScreen } from "./main.js";
import { setIsTyping } from "./events.js";

let data = [];
let intervalId = null;
let preloadedNextImage = new Image();
let preloadedPrevImage = new Image();
let isTogglePlayPauseRunning = false;
let previousImage = null;
let currentImageList = [];

function updateImageList(newList) {
    if (JSON.stringify(currentImageList) !== JSON.stringify(newList)) {
        console.warn("Image list has changed unexpectedly");
        console.log("Old list:", currentImageList);
        console.log("New list:", newList);
    }
    currentImageList = newList;
}


export function getIntervalId() {
    return intervalId;
}

export function setIntervalId(id) {
    intervalId = id;
}

export function setData(newImages) {
    console.log('setData called with:', newImages);
    if (!data.length || JSON.stringify(data) !== JSON.stringify(newImages)) {
        console.log('Updating data array');
        console.log('Old data:', data);
        data = newImages;
        console.log('New data:', data);
        document.dispatchEvent(new CustomEvent('dataLoaded'));
    } else {
        console.log('Data array unchanged, skipping update');
    }
}

// Add this function to check if the data array has changed
function hasDataChanged(newData) {
    return JSON.stringify(data) !== JSON.stringify(newData);
}

// Function to display the media (image or video) in slideshow
export function displayMedia(src) {
    const imageElement = document.getElementById('slideshowDisplayedImage');
    const videoElement = document.getElementById('slideshowDisplayedVideo');

    console.log(`Displaying media: ${src}`);
    console.log(`Last navigation direction: ${lastNavigationDirection}`);
    console.log(`Current data array:`, data);

    // Add this check
    if (lastNavigationDirection) {
        const currentIndex = data.indexOf(src);
        const expectedIndex = lastNavigationDirection === 'next' ? 
            (data.indexOf(previousImage) + 1) % data.length :
            (data.indexOf(previousImage) - 1 + data.length) % data.length;
        
        if (currentIndex !== expectedIndex) {
            console.error(`Unexpected image order. Expected index: ${expectedIndex}, Actual index: ${currentIndex}`);
        }
    }

    if (!imageElement || !videoElement) {
        console.error('Image or Video element not found.');
        return;
    }

    console.log('Hiding image and video elements initially.');
    imageElement.style.display = 'none';
    videoElement.style.display = 'none';
    videoElement.src = ''; // Clear the video source

    if (src.endsWith('.mp4')) {
        videoElement.src = src;
        videoElement.style.display = 'block';
        videoElement.autoplay = true;
        videoElement.load();
        console.log(`Displaying video: ${src}`);
        hideLoadingScreen(); // Hide loading screen after displaying media
    } else {
        const preloader = new Image();
        preloader.onload = () => {
            imageElement.src = src;
            imageElement.style.display = 'block';
            videoElement.style.display = 'none'; // Ensure video element is hidden
            videoElement.src = ''; // Clear the video source explicitly
            console.log(`Displaying image: ${src}`);
            hideLoadingScreen(); // Hide loading screen after displaying media
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            hideLoadingScreen(); // Ensure loading screen is hidden even if there is an error
        };
        preloader.src = src;
    }

    if (data.length > 0) {
        preloadAdjacentMedia(src);
    } else {
        document.addEventListener('dataLoaded', () => preloadAdjacentMedia(src), { once: true });
    }
    
    restorePlayPauseState();
    updateDataPanel(src);
    previousImage = src;
}

export function preloadAdjacentMedia(currentSrc) {
    const currentIndex = data.indexOf(decodeURIComponent(currentSrc));

    if (currentIndex === -1) {
        console.error(`Current media source not found in data: ${currentSrc}`);
        return;
    }

    const nextIndex = (currentIndex + 1) % data.length;
    const prevIndex = (currentIndex - 1 + data.length) % data.length;

    const nextSrc = data[nextIndex];
    const prevSrc = data[prevIndex];

    if (nextSrc.endsWith('.mp4')) {
        console.log(`Preloading next video: ${nextSrc}`);
    } else {
        preloadedNextImage.src = nextSrc;
        console.log(`Preloading next image: ${nextSrc}`);
    }

    if (prevSrc.endsWith('.mp4')) {
        console.log(`Preloading previous video: ${prevSrc}`);
    } else {
        preloadedPrevImage.src = prevSrc;
        console.log(`Preloading previous image: ${prevSrc}`);
    }
}

export function nextImage() {
    const currentSrc = decodeURIComponent(new URLSearchParams(window.location.search).get('image'));
    const currentIndex = data.indexOf(currentSrc);
    if (currentIndex === -1) {
        console.error(`Current media source not found in data: ${currentSrc}`);
        return;
    }
    const nextIndex = (currentIndex + 1) % data.length;
    const nextSrc = data[nextIndex];
    console.log(`Navigating to next image: ${nextSrc}`);
    console.log(`Current data array:`, data);
    lastNavigationDirection = 'next';
    window.location.href = `index.html?view=slideshow&image=${encodeURIComponent(nextSrc)}`;
}

export function prevImage() {
    const currentSrc = decodeURIComponent(new URLSearchParams(window.location.search).get('image'));
    const currentIndex = data.indexOf(currentSrc);
    if (currentIndex === -1) {
        console.error(`Current media source not found in data: ${currentSrc}`);
        return;
    }
    const prevIndex = (currentIndex - 1 + data.length) % data.length;
    const prevSrc = data[prevIndex];
    console.log(`Navigating to previous image: ${prevSrc}`);
    console.log(`Current data array:`, data);
    lastNavigationDirection = 'prev';
    window.location.href = `index.html?view=slideshow&image=${encodeURIComponent(prevSrc)}`;
}

export function togglePlayPause() {
    if (isTogglePlayPauseRunning) {
        return;
    }
    isTogglePlayPauseRunning = true;

    const playPauseButton = document.getElementById('playPauseButton');
    const playIcon = playPauseButton.querySelector('.fa-play');
    const pauseIcon = playPauseButton.querySelector('.fa-pause');
    const isPlaying = sessionStorage.getItem('isPlaying') === 'true';

    if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        sessionStorage.setItem('isPlaying', 'false');
        console.log('Paused');
    } else {
        setIntervalId(setInterval(nextImage, 3000)); // 3-second interval
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        sessionStorage.setItem('isPlaying', 'true');
        console.log('Playing');
    }

    // Reset the flag after a short delay to allow for the next toggle
    setTimeout(() => {
        isTogglePlayPauseRunning = false;
    }, 300); // Adjust the timeout as needed
}

function restorePlayPauseState() {
    const playPauseButton = document.getElementById('playPauseButton');
    const playIcon = playPauseButton.querySelector('.fa-play');
    const pauseIcon = playPauseButton.querySelector('.fa-pause');
    const isPlaying = sessionStorage.getItem('isPlaying') === 'true';

    if (isPlaying) {
        setIntervalId(setInterval(nextImage, 3000)); // 3-second interval
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        console.log('Restored to Playing state');
    } else {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        console.log('Restored to Paused state');
    }
}

export function displayImageWithUrlUpdate(mediaUrl) {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view !== 'slideshow') {
        console.log('Not in slideshow view, skipping displayImageWithUrlUpdate');
        return;
    }

    const imageElement = document.getElementById('slideshowDisplayedImage');
    const videoElement = document.getElementById('slideshowDisplayedVideo');
    if (!imageElement || !videoElement) {
        console.error('Slideshow Image or Video element not found.');
        return;
    }

    console.log('Hiding image and video elements initially for URL update.');
    imageElement.style.display = 'none';
    videoElement.style.display = 'none';
    videoElement.src = ''; // Clear the video source

    const isVideo = mediaUrl.endsWith('.mp4');
    if (isVideo) {
        videoElement.src = mediaUrl;
        videoElement.style.display = 'block';
        videoElement.load();
        console.log(`Displaying video with URL update: ${mediaUrl}`);
    } else {
        const preloader = new Image();
        preloader.onload = () => {
            imageElement.src = mediaUrl;
            imageElement.style.display = 'block';
            videoElement.style.display = 'none'; // Ensure video element is hidden
            videoElement.src = ''; // Clear the video source explicitly
            console.log(`Displaying image with URL update: ${mediaUrl}`);
            history.replaceState(null, '', `?image=${encodeURIComponent(mediaUrl)}`);
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${mediaUrl}`);
        };
        preloader.src = mediaUrl;
    }
    updateDataPanel(mediaUrl);
}

export function updateDataPanel(imagePath) {
    console.log(`Updating data panel for image: ${imagePath}`);
    
    Promise.all([
        fetch(`/get_image_info?path=${encodeURIComponent(imagePath)}`).then(response => response.json()),
        fetch(`/get_tags?path=${encodeURIComponent(imagePath)}`).then(response => response.json())
    ])
    .then(([imageInfo, tags]) => {
        console.log('Image info and tags received:', { imageInfo, tags });
        const dataPanel = document.getElementById('dataPanel');
        if (dataPanel) {
            dataPanel.innerHTML = '';
            
            // Display image info
            const keysToDisplay = {
                'File Name': 'File Name',
                'File Path': 'File Path',
                'File Type': 'File Type',
                'File Size': 'File Size',
                'Dimensions': 'Dimensions'
            };

            for (const [key, label] of Object.entries(keysToDisplay)) {
                if (imageInfo[key]) {
                    const p = document.createElement('p');
                    p.textContent = `${label}: ${imageInfo[key]}`;
                    dataPanel.appendChild(p);
                }
            }
            
            // Display tags
            const tagContainer = document.createElement('div');
            tagContainer.id = 'tagContainer';
            tagContainer.innerHTML = `
                <h3>Tags:</h3>
                <div id="existingTags"></div>
                <input type="text" id="newTag" placeholder="Add a new tag">
                <button id="addTagButton">Add Tag</button>
                <textarea id="bulkTagEdit" placeholder="Edit tags (comma-separated)"></textarea>
                <button id="applyTagsButton">Apply Changes</button>
                <button id="clearTagsButton">Clear All Tags</button>
            `;
            dataPanel.appendChild(tagContainer);

            updateTagsDisplay(tags);

            // Set up event listeners for tag operations
            setupTagEventListeners(imagePath);
        }
    })
    .catch(error => {
        console.error('Error updating data panel:', error);
        const dataPanel = document.getElementById('dataPanel');
        if (dataPanel) {
            dataPanel.innerHTML = `<p>Error loading image information: ${error.message}</p>`;
        }
    });
}

function setupTagEventListeners(imagePath) {
    const bulkTagEdit = document.getElementById('bulkTagEdit');
    const applyTagsButton = document.getElementById('applyTagsButton');
    const addTagButton = document.getElementById('addTagButton');
    const newTagInput = document.getElementById('newTag');
    const clearTagsButton = document.getElementById('clearTagsButton');

    if (bulkTagEdit && applyTagsButton && addTagButton && newTagInput && clearTagsButton) {
        bulkTagEdit.addEventListener('focus', () => setIsTyping(true));
        bulkTagEdit.addEventListener('blur', () => setIsTyping(false));
        newTagInput.addEventListener('focus', () => setIsTyping(true));
        newTagInput.addEventListener('blur', () => setIsTyping(false));

        applyTagsButton.addEventListener('click', () => {
            const tags = bulkTagEdit.value.split(',').map(tag => tag.trim()).filter(tag => tag);
            updateImageTags(imagePath, tags);
        });

        addTagButton.addEventListener('click', () => {
            const newTag = newTagInput.value.trim();
            if (newTag) {
                const currentTags = bulkTagEdit.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                updateImageTags(imagePath, [...currentTags, newTag]);
                newTagInput.value = '';
            }
        });

        clearTagsButton.addEventListener('click', () => {
            clearTags(imagePath);
        });
    }
}

// Update the existing updateTags function to use the new updateTagsDisplay function
function updateTags(imagePath) {
    console.log(`Updating tags for image: ${imagePath}`);
    fetch(`/get_tags?path=${encodeURIComponent(imagePath)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(tags => {
            console.log('Tags received:', tags);
            updateTagsDisplay(tags);
        })
        .catch(error => console.error('Error updating tags:', error));
}

function addTag(imagePath, newTag) {
    console.log(`Attempting to add tag: ${newTag}`);
    fetch('/add_tag', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: imagePath, tag: newTag }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Add tag response:', data);
        if (data.success) {
            console.log('Tag added successfully');
            document.getElementById('newTag').value = '';
            // Fetch and update tags after successful addition
            fetchAndUpdateTags(imagePath);
        } else {
            console.error('Failed to add tag:', data.message);
        }
    })
    .catch(error => {
        console.error('Error adding tag:', error);
    });
}

function updateImageTags(imagePath, tags) {
    console.log(`Updating tags for image: ${imagePath}`);
    fetch('/update_tags', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ path: imagePath, tags: tags }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Update tags response:', data);
        if (data.success) {
            console.log('Tags updated successfully');
            // Fetch and update tags after successful update
            fetchAndUpdateTags(imagePath);
        } else {
            console.error('Failed to update tags:', data.message);
        }
    })
    .catch(error => {
        console.error('Error updating tags:', error);
    });
}

function clearTags(imagePath) {
    console.log(`Clearing all tags for image: ${imagePath}`);
    // Use the updateImageTags function with an empty array to clear all tags
    updateImageTags(imagePath, []);
}

function fetchAndUpdateTags(imagePath) {
    console.log(`Fetching latest tags for image: ${imagePath}`);
    fetch(`/get_tags?path=${encodeURIComponent(imagePath)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(tags => {
            console.log('Latest tags received:', tags);
            updateTagsDisplay(tags);
        })
        .catch(error => {
            console.error('Error fetching latest tags:', error);
            updateTagsDisplay([]); // Update with empty array in case of error
        });
}

function updateTagsDisplay(tags) {
    console.log('Updating tags display with:', tags);
    const existingTags = document.getElementById('existingTags');
    const bulkTagEdit = document.getElementById('bulkTagEdit');
    if (existingTags && bulkTagEdit) {
        existingTags.innerHTML = '';
        if (Array.isArray(tags) && tags.length > 0) {
            tags.forEach((tag, index) => {
                const span = document.createElement('span');
                span.textContent = tag;
                span.className = 'tag';
                existingTags.appendChild(span);
                
                // Add comma and space after each tag except the last one
                if (index < tags.length - 1) {
                    existingTags.appendChild(document.createTextNode(', '));
                }
            });
            bulkTagEdit.value = tags.join(', ');
        } else {
            existingTags.textContent = 'No tags found.';
            bulkTagEdit.value = '';
        }
    }
}

// Clear video source and hide video element on initial page load if view is slideshow
document.addEventListener('DOMContentLoaded', () => {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view === 'slideshow') {
        const videoElement = document.getElementById('slideshowDisplayedVideo');
        if (videoElement) {
            videoElement.src = '';
            videoElement.style.display = 'none';
        } else {
            console.error('Video element not found.');
        }
    }
});

let lastNavigationDirection = null;