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

// Function to display the image
function displayImage() {
    const imageUrl = getQueryParam('image');
    const image = document.getElementById('displayedImage');
    image.style.display = 'none'; // Hide the image initially
    if (!imageUrl && data.length > 0) {
        // If no query parameter is provided, set the image URL to the first image in the data array
        const firstImageUrl = data[0];
        preloadAndDisplayImage(firstImageUrl, image);
        console.log(`Displaying first image: ${firstImageUrl}`);
        // Update the URL with the first image
        history.replaceState(null, '', `?image=${encodeURIComponent(firstImageUrl)}&panel=${getPanelState() ? 'open' : 'closed'}`);
    } else if (imageUrl) {
        // If a query parameter is provided, display the corresponding image
        preloadAndDisplayImage(decodeURIComponent(imageUrl), image);
        console.log(`Displaying image from URL: ${imageUrl}`);
    } else {
        console.error('Image URL not found in query parameters.');
    }
    preloadAdjacentImages(); // Preload the next and previous images
}

// Function to preload and display an image
function preloadAndDisplayImage(src, imgElement) {
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

// Function to preload the next and previous images
function preloadAdjacentImages() {
    const currentImageUrl = getCurrentImageUrl();
    if (!currentImageUrl) {
        console.error('Image URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentImageUrl));

    const nextIndex = (currentIndex + 1) % data.length; // Ensure looping back to the first image
    const prevIndex = (currentIndex - 1 + data.length) % data.length; // Ensure looping back to the last image

    preloadedNextImage.src = data[nextIndex];
    preloadedPrevImage.src = data[prevIndex];

    console.log(`Preloading next image: ${data[nextIndex]}`);
    console.log(`Preloading previous image: ${data[prevIndex]}`);
}

// Function to navigate to the next image
function nextImage() {
    const currentImageUrl = getCurrentImageUrl();
    const panelState = document.getElementById('leftPanel').style.display === 'block' ? 'open' : 'closed';
    if (!currentImageUrl) {
        console.error('Image URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentImageUrl));
    const nextIndex = (currentIndex + 1) % data.length; // Ensure looping back to the first image
    const nextImageUrl = data[nextIndex];
    if (nextImageUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(nextImageUrl)}&panel=${panelState}`;
        console.log(`Navigating to next image: ${nextImageUrl}`);
    } else {
        console.error('Next image URL not found.');
    }
}

// Function to navigate to the previous image
function prevImage() {
    const currentImageUrl = getCurrentImageUrl();
    const panelState = document.getElementById('leftPanel').style.display === 'block' ? 'open' : 'closed';
    if (!currentImageUrl) {
        console.error('Image URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentImageUrl));
    const prevIndex = (currentIndex - 1 + data.length) % data.length; // Ensure looping back to the last image
    const prevImageUrl = data[prevIndex];
    if (prevImageUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(prevImageUrl)}&panel=${panelState}`;
        console.log(`Navigating to previous image: ${prevImageUrl}`);
    } else {
        console.error('Previous image URL not found.');
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
        intervalId = setInterval(nextImage, 5000); // Change image every 5 seconds
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
            displayImage(); // Display the image after data is loaded

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
});

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
        li.textContent = node.name;
        if (node.type === 'directory') {
            li.addEventListener('click', () => {
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
                                    // Display the first image after data is loaded and update the URL
                                    const firstImageUrl = data[0];
                                    displayImageWithUrlUpdate(firstImageUrl);
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

function displayImageWithUrlUpdate(imageUrl) {
    const image = document.getElementById('displayedImage');
    image.style.display = 'none'; // Hide the image initially
    const preloader = new Image();
    preloader.onload = () => {
        image.src = imageUrl;
        image.style.display = 'block'; // Show the image after it has loaded
        // Update the URL with the new image
        history.replaceState(null, '', `?image=${encodeURIComponent(imageUrl)}`);
    };
    preloader.onerror = () => {
        console.error(`Failed to load image: ${imageUrl}`);
    };
    preloader.src = imageUrl;
}