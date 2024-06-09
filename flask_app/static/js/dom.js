import { getQueryParam } from './utils.js';
import { setData, displayMedia, nextImage, prevImage, togglePlayPause, getIntervalId, setIntervalId } from './media.js';
import { handleKeyPress } from './events.js';

// Function to adjust the main content area based on the left panel state
export function adjustMainContent() {
    const leftPanel = document.getElementById('leftPanel');
    const prevButton = document.getElementById('prevButton');
    const galleryButton = document.querySelector('.gallery');
    const mainContent = document.getElementById('mainContent');
    const hoverArea = document.getElementById('hoverArea');
    const playPauseButton = document.getElementById('playPauseButton');
    const imageContainer = document.getElementById('imageContainer');

    if (leftPanel && prevButton && galleryButton && mainContent && hoverArea && playPauseButton && imageContainer) {
        const leftPanelWidth = leftPanel.offsetWidth + 'px';

        prevButton.style.left = `calc(${leftPanelWidth} + 20px)`;
        galleryButton.style.right = '50px';
        mainContent.style.width = `calc(100% - ${leftPanelWidth})`;
        hoverArea.style.left = '50%';
        hoverArea.style.transform = 'translateX(-50%)';
        playPauseButton.style.left = '50%';
        playPauseButton.style.transform = 'translateX(-50%)';
        imageContainer.style.maxWidth = mainContent.style.width;
        imageContainer.style.transition = 'none';
    } else {
        console.error('One or more elements are not found for adjusting main content.');
    }
}

// Function to initialize the page
export function initializePage() {
    console.log('Initializing page');

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
            if (nextButton) {
                nextButton.removeEventListener('click', nextImage);
                nextButton.addEventListener('click', nextImage);
                console.log('Next button initialized');
            }

            // Event listener for the "Previous" button
            const prevButton = document.getElementById('prevButton');
            if (prevButton) {
                prevButton.removeEventListener('click', prevImage);
                prevButton.addEventListener('click', prevImage);
                console.log('Previous button initialized');
            }

            // Event listener for the "Play/Pause" button
            const playPauseButton = document.getElementById('playPauseButton');
            if (playPauseButton) {
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
            }

            // Add keypress event listener
            document.addEventListener('keydown', handleKeyPress);
            console.log('Keypress event listener added');
        })
        .catch(error => console.error('Error fetching images:', error));

    const resizeHandle = document.querySelector('.resize-handle');
    let isResizing = false;

    if (resizeHandle) {
        resizeHandle.addEventListener('mousedown', (e) => {
            isResizing = true;
            document.addEventListener('mousemove', resizePanel);
            document.addEventListener('mouseup', stopResizing);
        });

        function resizePanel(e) {
            if (!isResizing) return;
            const newWidth = Math.min(e.clientX, window.innerWidth * 0.24);
            if (newWidth < window.innerWidth * 0.1 || newWidth > window.innerWidth * 0.24) return;
            const leftPanel = document.getElementById('leftPanel');
            if (leftPanel) {
                leftPanel.style.width = `${newWidth}px`;
                adjustMainContent();
            }
        }

        function stopResizing() {
            isResizing = false;
            document.removeEventListener('mousemove', resizePanel);
            document.removeEventListener('mouseup', stopResizing);
        }
    }

    adjustMainContent();
}

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
});
