// Define data globally
let data = [];
let intervalId = null;

console.log('Script loaded');

// Function to parse query parameters
function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to display the image
function displayImage() {
    const imageUrl = getQueryParam('image');
    const image = document.getElementById('displayedImage');
    if (!imageUrl && data.length > 0) {
        // If no query parameter is provided, set the image URL to the first image in the data array
        const firstImageUrl = data[0];
        image.src = decodeURIComponent(firstImageUrl); // Decode the URL
        console.log(`Displaying first image: ${firstImageUrl}`);
        // Update the URL with the first image
        history.replaceState(null, '', `?image=${encodeURIComponent(firstImageUrl)}`);
    } else if (imageUrl) {
        // If a query parameter is provided, display the corresponding image
        image.src = decodeURIComponent(imageUrl); // Decode the URL
        console.log(`Displaying image from URL: ${imageUrl}`);
    } else {
        console.error('Image URL not found in query parameters.');
    }
}

// Function to navigate to the next image
function nextImage() {
    const currentImageUrl = getCurrentImageUrl();
    if (!currentImageUrl) {
        console.error('Image URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentImageUrl));
    const nextIndex = (currentIndex + 1) % data.length; // Ensure looping back to the first image
    const nextImageUrl = data[nextIndex];
    if (nextImageUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(nextImageUrl)}`;
        console.log(`Navigating to next image: ${nextImageUrl}`);
    } else {
        console.error('Next image URL not found.');
    }
}

// Function to navigate to the previous image
function prevImage() {
    const currentImageUrl = getCurrentImageUrl();
    if (!currentImageUrl) {
        console.error('Image URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentImageUrl));
    const prevIndex = (currentIndex - 1 + data.length) % data.length; // Ensure looping back to the last image
    const prevImageUrl = data[prevIndex];
    if (prevImageUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(prevImageUrl)}`;
        console.log(`Navigating to previous image: ${prevImageUrl}`);
    } else {
        console.error('Previous image URL not found.');
    }
}

// Function to get the current image URL from the query parameters
function getCurrentImageUrl() {
    const params = new URLSearchParams(window.location.search);
    const currentImageUrl = params.get('image');
    console.log(`Current image URL: ${currentImageUrl}`);
    return currentImageUrl;
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

// Function to initialize the page
function initializePage() {
    console.log('Initializing page');
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
}

// Call the initializePage function when the page loads
document.addEventListener('DOMContentLoaded', initializePage);
