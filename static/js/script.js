// Define data globally
let data = [];
let intervalId = null;
let preloadedNextImage = new Image();
let preloadedPrevImage = new Image();

console.log('Script loaded');

// Function to parse query parameters
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to get the current image URL from the query parameters
function getCurrentImageUrl() {
    const params = new URLSearchParams(window.location.search);
    const currentImageUrl = params.get('image');
    console.log(`Current image URL: ${currentImageUrl}`);
    return currentImageUrl;
}

// Function to get the current panel state from the query parameters
function getPanelState() {
    const params = new URLSearchParams(window.location.search);
    return params.get('panel') === 'open';
}

// Function to display the media (image or video)
function displayMedia() {
    const mediaUrl = getQueryParam('image');
    const imageContainer = document.getElementById('imageContainer');
    const imageElement = document.getElementById('displayedImage');
    const videoElement = document.getElementById('displayedVideo');

    imageElement.style.display = 'none';
    videoElement.style.display = 'none';
    videoElement.src = ''; // Clear the video source

    if (!mediaUrl && data.length > 0) {
        // If no query parameter is provided, set the media URL to the first item in the data array
        const firstMediaUrl = data[0];
        preloadAndDisplayMedia(firstMediaUrl, imageElement, videoElement);
        console.log(`Displaying first media: ${firstMediaUrl}`);
        // Update the URL with the first media
        history.replaceState(null, '', `?image=${encodeURIComponent(firstMediaUrl)}&panel=${getPanelState() ? 'open' : 'closed'}`);
    } else if (mediaUrl) {
        // If a query parameter is provided, display the corresponding media
        preloadAndDisplayMedia(decodeURIComponent(mediaUrl), imageElement, videoElement);
        console.log(`Displaying media from URL: ${mediaUrl}`);
    } else {
        console.error('Media URL not found in query parameters.');
    }
    preloadAdjacentMedia(); // Preload the next and previous media
}

// Function to preload and display media (image or video)
function preloadAndDisplayMedia(src, imgElement, vidElement) {
    const isVideo = src.endsWith('.mp4');
    if (isVideo) {
        vidElement.src = src;
        vidElement.style.display = 'block'; // Show the video after it has loaded
        vidElement.autoplay = true; // Ensure the video auto-plays
        vidElement.load(); // Load the video
        imgElement.style.display = 'none'; // Hide the image element
    } else {
        vidElement.style.display = 'none'; // Hide the video element
        const preloader = new Image();
        preloader.onload = () => {
            imgElement.src = src;
            imgElement.style.display = 'block'; // Show the image after it has loaded
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${src}`);
        };
        preloader.src = src;
    }
}

// Function to preload the next and previous media
function preloadAdjacentMedia() {
    const currentMediaUrl = getCurrentImageUrl();
    if (!currentMediaUrl) {
        console.error('Media URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));

    const nextIndex = (currentIndex + 1) % data.length; // Ensure looping back to the first media
    const prevIndex = (currentIndex - 1 + data.length) % data.length; // Ensure looping back to the last media

    preloadedNextImage.src = data[nextIndex];
    preloadedPrevImage.src = data[prevIndex];

    console.log(`Preloading next media: ${data[nextIndex]}`);
    console.log(`Preloading previous media: ${data[prevIndex]}`);
}

// Function to navigate to the next media
function nextImage() {
    const currentMediaUrl = getCurrentImageUrl();
    const panelState = document.getElementById('leftPanel').style.display === 'block' ? 'open' : 'closed';
    if (!currentMediaUrl) {
        console.error('Media URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));
    const nextIndex = (currentIndex + 1) % data.length; // Ensure looping back to the first media
    const nextMediaUrl = data[nextIndex];
    if (nextMediaUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(nextMediaUrl)}&panel=${panelState}`;
        console.log(`Navigating to next media: ${nextMediaUrl}`);
    } else {
        console.error('Next media URL not found.');
    }
}

// Function to navigate to the previous media
function prevImage() {
    const currentMediaUrl = getCurrentImageUrl();
    const panelState = document.getElementById('leftPanel').style.display === 'block' ? 'open' : 'closed';
    if (!currentMediaUrl) {
        console.error('Media URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));
    const prevIndex = (currentIndex - 1 + data.length) % data.length; // Ensure looping back to the last media
    const prevMediaUrl = data[prevIndex];
    if (prevMediaUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(prevMediaUrl)}&panel=${panelState}`;
        console.log(`Navigating to previous media: ${prevMediaUrl}`);
    } else {
        console.error('Previous media URL not found.');
    }
}

// Function to toggle play/pause
function togglePlayPause() {
    const playPauseButton = document.getElementById('playPauseButton');
    const playIcon = playPauseButton.querySelector('.fa-play');
    const pauseIcon = playPauseButton.querySelector('.fa-pause');
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        sessionStorage.setItem('isPlaying', 'false'); // Store state
        console.log('Paused');
    } else {
        intervalId = setInterval(nextImage, 5000); // Change media every 5 seconds
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        sessionStorage.setItem('isPlaying', 'true'); // Store state
        console.log('Playing');
    }
}

// Function to handle keypress
function handleKeyPress(event) {
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

// Show/hide play/pause button on hover
const hoverArea = document.getElementById('hoverArea');
hoverArea.addEventListener('mouseenter', function() {
    document.getElementById('playPauseButton').style.opacity = 1;
});
hoverArea.addEventListener('mouseleave', function() {
    document.getElementById('playPauseButton').style.opacity = 0;
});
document.getElementById('playPauseButton').addEventListener('mouseenter', function() {
    this.style.opacity = 1;
});
document.getElementById('playPauseButton').addEventListener('mouseleave', function() {
    this.style.opacity = 0;
});

// Save the state of the panel to session storage
function savePanelState() {
    const leftPanel = document.getElementById('leftPanel');
    const isPanelOpen = leftPanel.style.display === 'block';
    sessionStorage.setItem('isPanelOpen', isPanelOpen);
}

// Restore the state of the panel from session storage
function restorePanelState() {
    const leftPanel = document.getElementById('leftPanel');
    const fileTreeToggleClosed = document.getElementById('fileTreeToggleClosed');
    const logoClosed = document.getElementById('logoClosed');
    const isPanelOpen = getPanelState();
    leftPanel.style.display = isPanelOpen ? 'block' : 'none';
    fileTreeToggleClosed.style.display = isPanelOpen ? 'none' : 'flex';
    logoClosed.style.display = isPanelOpen ? 'none' : 'block';
    leftPanel.style.width = '270px'; // Set default width to 270px
    adjustMainContent();
}

// Function to adjust the main content area based on the left panel state
function adjustMainContent() {
    const leftPanel = document.getElementById('leftPanel');
    const leftPanelWidth = leftPanel.style.display === 'none' ? '0px' : leftPanel.offsetWidth + 'px';

    const prevButton = document.getElementById('prevButton');
    prevButton.style.left = leftPanel.style.display === 'none' ? '20px' : `calc(${leftPanelWidth} + 20px)`;

    const galleryButton = document.querySelector('.gallery');
    galleryButton.style.right = '50px';

    const mainContent = document.getElementById('mainContent');
    mainContent.style.width = leftPanel.style.display === 'none' ? '100%' : `calc(100% - ${leftPanelWidth})`;

    const hoverArea = document.getElementById('hoverArea');
    hoverArea.style.left = '50%';
    hoverArea.style.transform = 'translateX(-50%)';

    const playPauseButton = document.getElementById('playPauseButton');
    playPauseButton.style.left = '50%';
    playPauseButton.style.transform = 'translateX(-50%)';

    const imageContainer = document.getElementById('imageContainer');
    imageContainer.style.maxWidth = mainContent.style.width;
    imageContainer.style.transition = 'none';
}

// Function to initialize the page
function initializePage() {
    console.log('Initializing page');

    // Restore panel state as soon as possible to avoid flicker
    restorePanelState();
    adjustMainContent();

    // Fetch images.json to populate the data variable
    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            console.log(`Data loaded: ${JSON.stringify(data)}`);
            displayMedia(); // Display the media after data is loaded

            // Event listener for the "Next" button
            const nextButton = document.getElementById('nextButton');
            nextButton.removeEventListener('click', nextImage);
            nextButton.addEventListener('click', nextImage);
            console.log('Next button initialized');

            // Event listener for the "Previous" button
            const prevButton = document.getElementById('prevButton');
            prevButton.removeEventListener('click', prevImage);
            prevButton.addEventListener('click', prevImage);
            console.log('Previous button initialized');

            // Event listener for the "Play/Pause" button
            const playPauseButton = document.getElementById('playPauseButton');
            playPauseButton.removeEventListener('click', togglePlayPause);
            playPauseButton.addEventListener('click', togglePlayPause);
            console.log('Play/Pause button initialized');

            // Restore play/pause state
            const isPlaying = sessionStorage.getItem('isPlaying');
            if (isPlaying === 'true') {
                intervalId = setInterval(nextImage, 5000);
                playPauseButton.querySelector('.fa-play').style.display = 'none';
                playPauseButton.querySelector('.fa-pause').style.display = 'block';
                console.log('Resumed playing');
            } else {
                playPauseButton.querySelector('.fa-play').style.display = 'block';
                playPauseButton.querySelector('.fa-pause').style.display = 'none';
                console.log('Paused state');
            }

            // Add keypress event listener
            document.addEventListener('keydown', handleKeyPress);
            console.log('Keypress event listener added');
        })
        .catch(error => console.error('Error fetching images:', error));

    const fileTreeToggleOpened = document.getElementById('fileTreeToggleOpened');
    const fileTreeToggleClosed = document.getElementById('fileTreeToggleClosed');
    const logoClosed = document.getElementById('logoClosed');
    const leftPanel = document.getElementById('leftPanel');
    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;

    function toggleLeftPanel() {
        if (leftPanel.style.display === 'none' || leftPanel.style.display === '') {
            leftPanel.style.display = 'block';
            fileTreeToggleClosed.style.display = 'none';
            logoClosed.style.display = 'none';
        } else {
            leftPanel.style.display = 'none';
            fileTreeToggleClosed.style.display = 'flex';
            logoClosed.style.display = 'block';
        }
        adjustMainContent();
        savePanelState(); // Save panel state after toggling
    }

    fileTreeToggleOpened.addEventListener('click', toggleLeftPanel);
    fileTreeToggleClosed.addEventListener('click', toggleLeftPanel);

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', resizePanel);
        document.addEventListener('mouseup', stopResizing);
    });

    function resizePanel(e) {
        if (!isResizing) return;
        const newWidth = Math.min(e.clientX, window.innerWidth * 0.24); // Limit the maximum width to 24%
        if (newWidth < window.innerWidth * 0.1 || newWidth > window.innerWidth * 0.24) return;
        leftPanel.style.width = `${newWidth}px`;
        adjustMainContent();
    }

    function stopResizing() {
        isResizing = false;
        document.removeEventListener('mousemove', resizePanel);
        document.removeEventListener('mouseup', stopResizing);
    }

    adjustMainContent();
}

// Call the initializePage function when the page loads
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    adjustMainContent(); // Ensure content is adjusted initially
    populateFileTree(); // Populate the file tree initially
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'Home') {
            collapseAll();
        }
        if (e.altKey && e.code === 'End') {
            expandAll();
        }
    });
});

function expandAll() {
    const toggleIcons = document.querySelectorAll('#fileTree .toggle-icon');
    toggleIcons.forEach(icon => {
        const subList = icon.parentElement.querySelector('ul');
        if (subList) {
            subList.style.display = 'block';
            icon.innerHTML = '&#9660;'; // Down pointing triangle
        }
    });
}

function collapseAll() {
    const toggleIcons = document.querySelectorAll('#fileTree .toggle-icon');
    toggleIcons.forEach(icon => {
        const subList = icon.parentElement.querySelector('ul');
        if (subList) {
            subList.style.display = 'none';
            icon.innerHTML = '&#9654;'; // Right pointing triangle
        }
    });
}

// Function to populate the file tree
function populateFileTree() {
    const fileTreeContainer = document.getElementById('fileTree');
    fetch('/file-tree')
        .then(response => response.json())
        .then(data => {
            buildFileTree(fileTreeContainer, data);
        })
        .catch(error => console.error('Error fetching file tree:', error));
}

function buildFileTree(container, nodes) {
    container.innerHTML = ''; // Clear the current file tree
    nodes.forEach(node => {
        const li = document.createElement('li');
        const icon = document.createElement('i');
        icon.className = 'fas fa-folder'; // Font Awesome folder icon
        li.appendChild(icon);
        li.appendChild(document.createTextNode(` ${node.name}`));

        if (node.type === 'directory') {
            if (node.children && node.children.length > 0) {
                const toggleIcon = document.createElement('span');
                toggleIcon.className = 'toggle-icon';
                toggleIcon.innerHTML = '&#9654;'; // Right pointing triangle
                li.insertBefore(toggleIcon, li.firstChild);

                const subList = document.createElement('ul');
                subList.style.display = 'none'; // Initially hide subfolders
                buildFileTree(subList, node.children);
                li.appendChild(subList);

                toggleIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (subList.style.display === 'none') {
                        subList.style.display = 'block';
                        toggleIcon.innerHTML = '&#9660;'; // Down pointing triangle
                    } else {
                        subList.style.display = 'none';
                        toggleIcon.innerHTML = '&#9654;'; // Right pointing triangle
                    }
                });
            }

            li.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up to parent elements
                fetch('/update-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ directory: node.path })
                })
                .then(response => response.text())
                .then(message => {
                    console.log(message);
                    // Introduce a longer delay to ensure images.json is updated
                    setTimeout(() => {
                        fetch('images.json')
                            .then(response => response.json())
                            .then(images => {
                                data = images;
                                console.log(`Data loaded: ${JSON.stringify(data)}`);
                                if (data.length > 0) {
                                    // Display the first media after data is loaded and update the URL
                                    const firstMediaUrl = data[0];
                                    displayImageWithUrlUpdate(firstMediaUrl);
                                } else {
                                    console.error('No media found in the selected directory.');
                                }
                            })
                            .catch(error => console.error('Error fetching images:', error));
                    }, 300); // Delay of 3 seconds to ensure images.json is updated
                })
                .catch(error => console.error('Error updating images:', error));
            });
        }
        container.appendChild(li);
    });
}

function displayImageWithUrlUpdate(mediaUrl) {
    const imageElement = document.getElementById('displayedImage');
    const videoElement = document.getElementById('displayedVideo');
    imageElement.style.display = 'none';
    videoElement.style.display = 'none';

    const isVideo = mediaUrl.endsWith('.mp4');
    if (isVideo) {
        videoElement.src = mediaUrl;
        videoElement.style.display = 'block';
        videoElement.load();
    } else {
        const preloader = new Image();
        preloader.onload = () => {
            imageElement.src = mediaUrl;
            imageElement.style.display = 'block';
            // Update the URL with the new media
            history.replaceState(null, '', `?image=${encodeURIComponent(mediaUrl)}`);
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${mediaUrl}`);
        };
        preloader.src = mediaUrl;
    }
}
