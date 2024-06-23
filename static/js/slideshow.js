// slideshow.js
import { displayMedia, nextImage, prevImage, togglePlayPause } from './media.js';

document.addEventListener('DOMContentLoaded', () => {
    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.addEventListener('click', togglePlayPause);
    }

    const nextButton = document.getElementById('nextButton');
    if (nextButton) {
        nextButton.addEventListener('click', nextImage);
    }

    const prevButton = document.getElementById('prevButton');
    if (prevButton) {
        prevButton.addEventListener('click', prevImage);
    }

    displayMedia();
});
