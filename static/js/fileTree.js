import { showLoadingScreen, hideLoadingScreen, updateLoadingText } from './main.js';
import { setData, displayImageWithUrlUpdate } from './media.js';
import { expandAll, collapseAll } from './events.js';
import { initializeGallery, getCurrentPage } from './dom_pinterest.js';

// Function to check if we're in gallery view
function isGalleryView() {
    return new URLSearchParams(window.location.search).get('view') === 'gallery';
}

// Function to populate the file tree
export function populateFileTree() {
    const fileTreeContainer = document.getElementById('fileTree');
    const showHidden = localStorage.getItem('showHiddenFiles') === 'true';

    showLoadingScreen();
    updateLoadingText('Updating file tree...');

    fetch(`/file-tree?showHidden=${showHidden}`)
        .then(response => response.json())
        .then(data => {
            buildFileTree(fileTreeContainer, data);

            // After rebuilding the file tree, reload the root folder
            return fetch('/update-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ directory: 'Pictures', showHidden: showHidden })
            });
        })
        .then(response => response.text())
        .then(() => {
            // Fetch updated images
            return fetch('images.json');
        })
        .then(response => response.json())
        .then(images => {
            setData(images);
            // Refresh the gallery with the new images only if in gallery view
            if (isGalleryView()) {
                initializeGallery(images, 1);
            }
            hideLoadingScreen();
        })
        .catch(error => {
            console.error('Error updating file tree and images:', error);
            hideLoadingScreen();
        });
}

// Function to build the file tree
export function buildFileTree(container, nodes) {
    container.innerHTML = ''; // Clear the current file tree
    nodes.forEach(node => {
        const li = document.createElement('li');
        const icon = document.createElement('i');
        icon.className = 'fas fa-folder'; // Font Awesome folder icon
        li.appendChild(icon);
        li.appendChild(document.createTextNode(` ${node.name}`));

        if (node.type === 'directory') {
            if (node.children && node.children.length > 0) {
                const toggleIcon = document.createElement('span');
                toggleIcon.className = 'toggle-icon';
                toggleIcon.innerHTML = '&#9654;'; // Right pointing triangle
                li.insertBefore(toggleIcon, li.firstChild);

                const subList = document.createElement('ul');
                subList.style.display = 'none'; // Initially hide subfolders
                buildFileTree(subList, node.children);
                li.appendChild(subList);

                toggleIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (subList.style.display === 'none') {
                        subList.style.display = 'block';
                        toggleIcon.innerHTML = '&#9660;'; // Down pointing triangle
                    } else {
                        subList.style.display = 'none';
                        toggleIcon.innerHTML = '&#9654;'; // Right pointing triangle
                    }
                });
            }

            li.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent event from bubbling up to parent elements
                showLoadingScreen();
                updateLoadingText('Fetching images...');
                const showHidden = localStorage.getItem('showHiddenFiles') === 'true';
                fetch('/update-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ directory: node.path, showHidden: showHidden })
                })
                .then(response => response.text())
                .then(message => {
                    console.log(message);
                    // Introduce a longer delay to ensure images.json is updated
                    setTimeout(() => {
                        fetch('images.json')
                            .then(response => response.json())
                            .then(images => {
                                setData(images);
                                console.log(`Data loaded: ${JSON.stringify(images)}`);
                                if (images.length > 0) {
                                    // Display the first media after data is loaded and update the URL
                                    const firstMediaUrl = images[0];
                                    displayImageWithUrlUpdate(firstMediaUrl);
                                    // Refresh the gallery with the new images if the view is gallery
                                    const view = new URLSearchParams(window.location.search).get('view');
                                    if (view === 'gallery' || !view) {
                                        const currentPage = 1; // Reset to the first page
                                        initializeGallery(images, currentPage);
                                    }
                                } else {
                                    console.error('No media found in the selected directory.');
                                }
                                updateLoadingText('Loading placeholders...');
                                // Simulate placeholder loading with a timeout for demonstration
                                setTimeout(() => {
                                    updateLoadingText('Loading initial screen space images...');
                                    setTimeout(hideLoadingScreen, 1000); // Hide after loading
                                }, 1000); // Simulate placeholder loading time
                            })
                            .catch(error => console.error('Error fetching images:', error));
                    }, 300); // Delay of 300ms to ensure images.json is updated
                })
                .catch(error => console.error('Error updating images:', error));
            });
        }
        container.appendChild(li);
    });
}

// Add event listener for the root directory link
document.addEventListener('DOMContentLoaded', () => {
    const rootDirectoryLink = document.getElementById('rootDirectoryLink');
    if (rootDirectoryLink) {
        rootDirectoryLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoadingScreen();
            updateLoadingText('Fetching images...');
            const showHidden = localStorage.getItem('showHiddenFiles') === 'true';
            fetch('/update-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ directory: 'Pictures', showHidden: showHidden })
            })
            .then(response => response.text())
            .then(message => {
                console.log(message);
                // Introduce a longer delay to ensure images.json is updated
                setTimeout(() => {
                    fetch('images.json')
                        .then(response => response.json())
                        .then(images => {
                            setData(images);
                            console.log(`Data loaded: ${JSON.stringify(images)}`);
                            if (images.length > 0) {
                                // Display the first media after data is loaded and update the URL
                                const firstMediaUrl = images[0];
                                displayImageWithUrlUpdate(firstMediaUrl);
                                // Refresh the gallery with the new images if the view is gallery
                                const view = new URLSearchParams(window.location.search).get('view');
                                if (view === 'gallery' || !view) {
                                    const currentPage = 1; // Reset to the first page
                                    initializeGallery(images, currentPage);
                                }
                            } else {
                                console.error('No media found in the selected directory.');
                            }
                            updateLoadingText('Loading placeholders...');
                            // Simulate placeholder loading with a timeout for demonstration
                            setTimeout(() => {
                                updateLoadingText('Loading initial screen space images...');
                                setTimeout(hideLoadingScreen, 1000); // Hide after loading
                            }, 1000); // Simulate placeholder loading time
                        })
                        .catch(error => console.error('Error fetching images:', error));
                }, 300); // Delay of 300ms to ensure images.json is updated
            })
            .catch(error => console.error('Error updating images:', error));
        });
    }
});