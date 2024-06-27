// media.js (for slideshow)
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
            console.log(`Displaying image: ${src}`);
        };
        preloader.onerror = () => {
            console.error(`Failed to load image: ${src}`);
        };
        preloader.src = src;
    }

    preloadAdjacentMedia(src);
}

export function preloadAdjacentMedia(currentSrc) {
    const currentIndex = data.indexOf(decodeURIComponent(currentSrc));

    const nextIndex = (currentIndex + 1) % data.length;
    const prevIndex = (currentIndex - 1 + data.length) % data.length;

    preloadedNextImage.src = data[nextIndex];
    preloadedPrevImage.src = data[prevIndex];

    console.log(`Preloading next media: ${data[nextIndex]}`);
    console.log(`Preloading previous media: ${data[prevIndex]}`);
}

export function nextImage() {
    const currentSrc = decodeURIComponent(new URLSearchParams(window.location.search).get('image'));
    const currentIndex = data.indexOf(currentSrc);
    const nextIndex = (currentIndex + 1) % data.length;
    const nextSrc = data[nextIndex];
    window.location.href = `index.html?view=slideshow&image=${encodeURIComponent(nextSrc)}`;
}

export function prevImage() {
    const currentSrc = decodeURIComponent(new URLSearchParams(window.location.search).get('image'));
    const currentIndex = data.indexOf(currentSrc);
    const prevIndex = (currentIndex - 1 + data.length) % data.length;
    const prevSrc = data[prevIndex];
    window.location.href = `index.html?view=slideshow&image=${encodeURIComponent(prevSrc)}`;
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
