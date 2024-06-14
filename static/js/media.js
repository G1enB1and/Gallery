// media.js
import { getQueryParam, getCurrentImageUrl } from './utils.js';

let data = [];
let intervalId = null;

export function setData(images) {
    data = images;
}

export function displayMedia() {
    const mediaUrl = getQueryParam('image');
    const imageContainer = document.getElementById('slideshowImageContainer');
    const imageElement = document.getElementById('slideshowDisplayedImage');
    const videoElement = document.getElementById('slideshowDisplayedVideo');

    if (!imageElement || !videoElement) {
        console.error("Image or Video element not found.");
        return;
    }

    imageElement.style.display = 'none';
    videoElement.style.display = 'none';
    videoElement.src = ''; // Clear the video source

    if (mediaUrl) {
        const src = decodeURIComponent(mediaUrl);
        if (src.endsWith('.mp4')) {
            videoElement.src = src;
            videoElement.style.display = 'block';
            videoElement.autoplay = true;
            videoElement.load();
        } else {
            imageElement.src = src;
            imageElement.style.display = 'block';
        }
    }
}

export function preloadAdjacentMedia() {
    const currentMediaUrl = getCurrentImageUrl();
    if (!currentMediaUrl) return;

    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));
    const nextIndex = (currentIndex + 1) % data.length;
    const prevIndex = (currentIndex - 1 + data.length) % data.length;

    new Image().src = data[nextIndex];
    new Image().src = data[prevIndex];
}

export function nextImage() {
    const currentMediaUrl = getCurrentImageUrl();
    if (!currentMediaUrl) return;

    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));
    const nextIndex = (currentIndex + 1) % data.length;
    const nextMediaUrl = data[nextIndex];
    window.location.href = `index.html?image=${encodeURIComponent(nextMediaUrl)}`;
}

export function prevImage() {
    const currentMediaUrl = getCurrentImageUrl();
    if (!currentMediaUrl) return;

    const currentIndex = data.indexOf(decodeURIComponent(currentMediaUrl));
    const prevIndex = (currentIndex - 1 + data.length) % data.length;
    const prevMediaUrl = data[prevIndex];
    window.location.href = `index.html?image=${encodeURIComponent(prevMediaUrl)}`;
}

export function togglePlayPause() {
    const playPauseButton = document.getElementById('playPauseButton');
    const playIcon = playPauseButton.querySelector('.fa-play');
    const pauseIcon = playPauseButton.querySelector('.fa-pause');

    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    } else {
        intervalId = setInterval(nextImage, 5000);
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    }
}

export function displayImageWithUrlUpdate(mediaUrl) {
    const imageElement = document.getElementById('slideshowDisplayedImage');
    const videoElement = document.getElementById('slideshowDisplayedVideo');

    if (!imageElement || !videoElement) {
        console.error("Image or Video element not found.");
        return;
    }

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
