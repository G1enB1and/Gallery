// main.js
import { initializePage, adjustMainContent } from './dom.js';
import { handleKeyPress, expandAll, collapseAll } from './events.js';
import { populateFileTree } from './fileTree.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    adjustMainContent(); // Ensure content is adjusted initially
    populateFileTree(); // Populate the file tree initially
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);

    document.addEventListener('keydown', (e) => {
        if (e.altKey && e.code === 'Home') {
            collapseAll();
        }
        if (e.altKey && e.code === 'End') {
            expandAll();
        }
    });
});