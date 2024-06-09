// main.js
import { initializePage, adjustMainContent } from './dom.js';
import { handleKeyPress, expandAll, collapseAll } from './events.js';
import { populateFileTree } from './fileTree.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    adjustMainContent();
    populateFileTree();
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
    document.addEventListener('keydown', handleKeyPress);
});
