// dom_pinterest.js
import { saveSessionState, restoreScrollPositionAfterImagesLoad } from './utils_pinterest.js';

let data = [];
let currentPage = parseInt(sessionStorage.getItem('currentPage')) || 1;
const imagesPerPage = 60;

export function setData(images) {
    data = images;
}

export function getCurrentPage() {
    return currentPage;
}

export function setCurrentPage(page) {
    currentPage = page;
}

export function renderImages(images, page) {
    const gallery = document.getElementById('gallery');
    if (!gallery) {
        console.error('Gallery element not found');
        return;
    }
    gallery.innerHTML = '';
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const pageImages = images.slice(startIndex, endIndex);
    pageImages.forEach((mediaPath, index) => {
        const mediaElement = document.createElement(mediaPath.endsWith('.mp4') ? 'video' : 'img');
        mediaElement.src = `static/${mediaPath}`; // Adjust path to ensure it starts from the root
        mediaElement.classList.add('imageItem');
        mediaElement.classList.add('masonry-item');
        mediaElement.setAttribute('data-index', startIndex + index);
        if (mediaPath.endsWith('.mp4')) {
            mediaElement.controls = true;
        }
        gallery.appendChild(mediaElement);
    });
    // Add lazy loading functionality
    const lazyLoadInstance = new LazyLoad({ elements_selector: '.imageItem' });
}

export function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(data.length / imagesPerPage);
    pagination.innerHTML = '';
    pagination.setAttribute('data-pagination', '');

    const prevButton = document.createElement('a');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.classList.add('prev');
    prevButton.href = '#';
    prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderImages(data, currentPage);
            renderPagination();
            saveSessionState(window.scrollY, currentPage);
        }
    });
    pagination.appendChild(prevButton);

    const ul = document.createElement('ul');
    pagination.appendChild(ul);

    const createPageButton = (page) => {
        const li = document.createElement('li');
        if (page === currentPage) {
            li.classList.add('current');
        }
        const a = document.createElement('a');
        a.href = `#${page}`;
        a.textContent = page;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = page;
            renderImages(data, currentPage);
            renderPagination();
            saveSessionState(window.scrollY, currentPage);
        });
        li.appendChild(a);
        return li;
    };

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            ul.appendChild(createPageButton(i));
        }
    } else {
        ul.appendChild(createPageButton(1));
        if (currentPage > 4) {
            const li = document.createElement('li');
            li.textContent = '...';
            ul.appendChild(li);
        }
        let startPage = Math.max(2, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);
        if (currentPage < 4) {
            endPage = 5;
        }
        if (currentPage > totalPages - 3) {
            startPage = totalPages - 4;
        }
        for (let i = startPage; i <= endPage; i++) {
            ul.appendChild(createPageButton(i));
        }
        if (currentPage < totalPages - 3) {
            const li = document.createElement('li');
            li.textContent = '...';
            ul.appendChild(li);
        }
        ul.appendChild(createPageButton(totalPages));
    }

    const nextButton = document.createElement('a');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.classList.add('next');
    nextButton.href = '#';
    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderImages(data, currentPage);
            renderPagination();
            saveSessionState(window.scrollY, currentPage);
        }
    });
    pagination.appendChild(nextButton);
}

export function setupMediaClickListener(data) {
    const gallery = document.getElementById('gallery');
    gallery.addEventListener('click', function(event) {
        if (event.target && (event.target.matches('img.imageItem') || event.target.matches('video.imageItem'))) {
            const index = parseInt(event.target.getAttribute('data-index'));
            const mediaUrl = data[index];

            saveSessionState(window.scrollY, getCurrentPage());

            window.location.href = `index.html?image=${encodeURIComponent(mediaUrl)}`;
        }
    });
}

export function initializeGallery() {
    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            setData(images);
            renderImages(images, getCurrentPage());
            renderPagination();
            restoreScrollPositionAfterImagesLoad();
            setupMediaClickListener(images);
        })
        .catch(error => console.error('Error fetching images:', error));
}

export function adjustGalleryLayout() {
    // Your layout adjustment logic here
}

export function populateFileTree() {
    const fileTreeContainer = document.getElementById('fileTree');
    fetch('/file-tree')
        .then(response => response.json())
        .then(data => {
            buildFileTree(fileTreeContainer, data);
        })
        .catch(error => console.error('Error fetching file tree:', error));
}

function buildFileTree(container, nodes) {
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
                fetch('/update-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ directory: node.path })
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
                                } else {
                                    console.error('No media found in the selected directory.');
                                }
                            })
                            .catch(error => console.error('Error fetching images:', error));
                    }, 300); // Delay of 3 seconds to ensure images.json is updated
                })
                .catch(error => console.error('Error updating images:', error));
            });
        }
        container.appendChild(li);
    });
}

function displayImageWithUrlUpdate(mediaUrl) {
    const imageElement = document.getElementById('displayedImage');
    const videoElement = document.getElementById('displayedVideo');
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

document.addEventListener('DOMContentLoaded', () => {
    initializeGallery();
    populateFileTree();
    adjustGalleryLayout();
});
