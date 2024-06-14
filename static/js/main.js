// main.js
import { initializePage, adjustMainContent } from './dom.js';
import { populateFileTree } from './fileTree.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    adjustMainContent(); // Ensure content is adjusted initially
    populateFileTree(); // Populate the file tree initially
});
