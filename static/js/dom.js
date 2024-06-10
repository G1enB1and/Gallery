// dom.js
import { setData, displayMedia, nextImage, prevImage, togglePlayPause, getIntervalId, setIntervalId } from './media.js';
import { handleKeyPress } from './events.js';

// Function to adjust the main content area based on the left panel state
// it has to first check if the element is loaded before adjusting it because mainContent can have different pages
// and if the element is not loaded it will throw an error.
export function adjustMainContent() {
    const leftPanel = document.getElementById('leftPanel');
    const leftPanelWidth = leftPanel && leftPanel.style.display === 'none' ? '0px' : (leftPanel ? leftPanel.offsetWidth + 'px' : '0px');

    const prevButton = document.getElementById('prevButton');
    if (prevButton) {
        prevButton.style.left = leftPanel && leftPanel.style.display === 'none' ? '20px' : `calc(${leftPanelWidth} + 20px)`;
    }

    const galleryButton = document.querySelector('.gallery');
    if (galleryButton) {
        galleryButton.style.right = '50px';
    }

    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.style.width = leftPanel && leftPanel.style.display === 'none' ? '100%' : `calc(100% - ${leftPanelWidth})`;
    }

    const hoverArea = document.getElementById('hoverArea');
    if (hoverArea) {
        hoverArea.style.left = '50%';
        hoverArea.style.transform = 'translateX(-50%)';
    }

    const playPauseButton = document.getElementById('playPauseButton');
    if (playPauseButton) {
        playPauseButton.style.left = '50%';
        playPauseButton.style.transform = 'translateX(-50%)';
    }

    const imageContainer = document.getElementById('imageContainer');
    if (imageContainer && mainContent) {
        imageContainer.style.maxWidth = mainContent.style.width;
        imageContainer.style.transition = 'none';
    }
}

// Function to initialize the page
export function initializePage() {
    console.log('Initializing page');

    // adjust for leftPanel as soon as possible to avoid flicker
    adjustMainContent();

    // Fetch images.json to populate the data variable
    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            setData(images);
            console.log(`Data loaded: ${JSON.stringify(images)}`);
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
                setIntervalId(setInterval(nextImage, 5000));
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

    const leftPanel = document.getElementById('leftPanel');
    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;

    resizeHandle.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', resizePanel);
        document.addEventListener('mouseup', stopResizing);
    });

    function resizePanel(e) {
        if (!isResizing) return;
        const newWidth = Math.min(e.clientX, window.innerWidth * 0.24);
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