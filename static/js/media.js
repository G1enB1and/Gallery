// media.js
import { getQueryParam, getCurrentImageUrl } from './utils.js';

let data = [];
let intervalId = null;
let preloadedNextImage = new Image();
let preloadedPrevImage = new Image();

export function getIntervalId() {
    return intervalId;
}

export function setIntervalId(id) {
    intervalId = id;
}

// Function to display the media (image or video)
export function displayMedia() {
    const mediaUrl = getQueryParam('image');
    const imageContainer = document.getElementById('imageContainer');
    const imageElement = document.getElementById('displayedImage');
    const videoElement = document.getElementById('displayedVideo');

    imageElement.style.display = 'none';
    videoElement.style.display = 'none';
    videoElement.src = ''; // Clear the video source

    if (!mediaUrl && data.length > 0) {
        const firstMediaUrl = data[0];
        preloadAndDisplayMedia(firstMediaUrl, imageElement, videoElement);
        console.log(`Displaying first media: ${firstMediaUrl}`);
        history.replaceState(null, '', `?image=${encodeURIComponent(firstMediaUrl)}&panel=${getPanelState() ? 'open' : 'closed'}`);
    } else if (mediaUrl) {
        preloadAndDisplayMedia(decodeURIComponent(mediaUrl), imageElement, videoElement);
        console.log(`Displaying media from URL: ${mediaUrl}`);
    } else {
        console.error('Media URL not found in query parameters.');
    }
    preloadAdjacentMedia();
}

export function preloadAndDisplayMedia(src, imgElement, vidElement) {
    const isVideo = src.endsWith('.mp4');
    if (isVideo) {
        vidElement.src = src;
        vidElement.style.display = 'block';
        vidElement.autoplay = true;
        vidElement.load();
        imgElement.style.display = 'none';
    } else {
        vidElement.style.display = 'none';
        const preloader = new Image();
        preloader.onload = () => {
            imgElement.src = src;
            imgElement.style.display = 'block';
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${src}`);
        };
        preloader.src = src;
    }
}

export function preloadAdjacentMedia() {
    const currentMediaUrl = getCurrentImageUrl();
    if (!currentMediaUrl) {
        console.error('Media URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));

    const nextIndex = (currentIndex + 1) % data.length;
    const prevIndex = (currentIndex - 1 + data.length) % data.length;

    preloadedNextImage.src = data[nextIndex];
    preloadedPrevImage.src = data[prevIndex];

    console.log(`Preloading next media: ${data[nextIndex]}`);
    console.log(`Preloading previous media: ${data[prevIndex]}`);
}

export function nextImage() {
    const currentMediaUrl = getCurrentImageUrl();
    const panelState = document.getElementById('leftPanel').style.display === 'block' ? 'open' : 'closed';
    if (!currentMediaUrl) {
        console.error('Media URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));
    const nextIndex = (currentIndex + 1) % data.length;
    const nextMediaUrl = data[nextIndex];
    if (nextMediaUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(nextMediaUrl)}&panel=${panelState}`;
        console.log(`Navigating to next media: ${nextMediaUrl}`);
    } else {
        console.error('Next media URL not found.');
    }
}

export function prevImage() {
    const currentMediaUrl = getCurrentImageUrl();
    const panelState = document.getElementById('leftPanel').style.display === 'block' ? 'open' : 'closed';
    if (!currentMediaUrl) {
        console.error('Media URL not found.');
        return;
    }
    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));
    const prevIndex = (currentIndex - 1 + data.length) % data.length;
    const prevMediaUrl = data[prevIndex];
    if (prevMediaUrl) {
        window.location.href = `index.html?image=${encodeURIComponent(prevMediaUrl)}&panel=${panelState}`;
        console.log(`Navigating to previous media: ${prevMediaUrl}`);
    } else {
        console.error('Previous media URL not found.');
    }
}

export function togglePlayPause() {
    const playPauseButton = document.getElementById('playPauseButton');
    const playIcon = playPauseButton.querySelector('.fa-play');
    const pauseIcon = playPauseButton.querySelector('.fa-pause');
    if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        sessionStorage.setItem('isPlaying', 'false');
        console.log('Paused');
    } else {
        setIntervalId(setInterval(nextImage, 5000));
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        sessionStorage.setItem('isPlaying', 'true');
        console.log('Playing');
    }
}

export function setData(images) {
    data = images;
}

export function displayImageWithUrlUpdate(mediaUrl) {
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
            history.replaceState(null, '', `?image=${encodeURIComponent(mediaUrl)}`);
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${mediaUrl}`);
        };
        preloader.src = mediaUrl;
    }
}