// slideshow.js
import { initializeSlideshow, adjustSlideshowLayout } from './dom.js';
import { handleKeyPress, expandAll, collapseAll } from './events.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeSlideshow();
    adjustSlideshowLayout();
    populateFileTree();
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
    document.addEventListener('keydown', handleKeyPress);
});
