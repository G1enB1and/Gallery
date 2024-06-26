let data = [];
let intervalId = null;
let preloadedNextImage = new Image();
let preloadedPrevImage = new Image();
let isTogglePlayPauseRunning = false;

export function getIntervalId() {
    return intervalId;
}

export function setIntervalId(id) {
    intervalId = id;
}

export function setData(images) {
    data = images;
}

// Function to display the media (image or video) in slideshow
export function displayMedia(src) {
    const imageElement = document.getElementById('slideshowDisplayedImage');
    const videoElement = document.getElementById('slideshowDisplayedVideo');

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
    } else {
        const preloader = new Image();
        preloader.onload = () => {
            imageElement.src = src;
            imageElement.style.display = 'block';
            videoElement.style.display = 'none'; // Ensure video element is hidden
            videoElement.src = ''; // Clear the video source explicitly
            console.log(`Displaying image: ${src}`);
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${src}`);
        };
        preloader.src = src;
    }

    preloadAdjacentMedia(src);
    restorePlayPauseState();
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
