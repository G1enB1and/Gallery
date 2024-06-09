// gallery.js
import { initializeGallery, adjustGalleryLayout, populateFileTree } from './dom_pinterest.js';
import { handleKeyPress, expandAll, collapseAll } from './events_pinterest.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeGallery();
    adjustGalleryLayout();
    populateFileTree();
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
    document.addEventListener('keydown', handleKeyPress);
});