import { saveSessionState } from './utils_pinterest.js';
import { loadPage } from './loader.js';

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

// Function to fetch image dimensions
async function fetchImageDimensions(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ url, width: img.width, height: img.height });
        img.onerror = (error) => reject(new Error(`Failed to load image dimensions for ${url}: ${error.message}`));
        img.src = url;
    });
}

// Function to fetch video dimensions
async function fetchVideoDimensions(url) {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            console.log(`Video dimensions for ${url}: ${video.videoWidth}x${video.videoHeight}`);
            resolve({ url, width: video.videoWidth, height: video.videoHeight });
        };
        video.onerror = (error) => reject(new Error(`Failed to load video dimensions for ${url}: ${error.message}`));
        video.src = url;
    });
}

// Function to create placeholders
function createPlaceholder({ width, height }) {
    const placeholder = document.createElement('div');
    placeholder.className = 'gallery-item placeholder';
    placeholder.style.paddingBottom = `${(height / width) * 100}%`;
    console.log(`Placeholder created with dimensions: ${width}x${height}`);
    return placeholder;
}

// Function to create image element
function createImageElement(url, index) {
    const img = document.createElement('img');
    img.className = 'lazy gallery-image';
    img.dataset.src = url;
    img.dataset.index = index;

    // Add event listener for when the image is loaded
    img.addEventListener('load', () => {
        const placeholder = img.closest('.placeholder');
        if (placeholder) {
            img.style.display = 'block'; // Show the image
            placeholder.style.paddingBottom = '0'; // Remove padding from placeholder
            placeholder.classList.remove('placeholder'); // Remove the placeholder class
            console.log(`Image loaded: ${img.src}`);
        }
    });

    // Add click event listener to switch to slideshow view
    img.addEventListener('click', () => {
        changeView('slideshow', url);
    });

    return img;
}

// Function to create video element
function createVideoElement(url, index) {
    const video = document.createElement('video');
    video.className = 'lazy gallery-video';
    video.dataset.src = url;
    video.dataset.index = index;
    video.controls = true;
    video.style.maxWidth = '100%';
    video.style.maxHeight = '100%';
    video.style.width = 'auto';
    video.style.height = 'auto';
    video.style.objectFit = 'contain'; // Ensure the video fits within the container

    // Add event listener for when the video is loaded
    video.addEventListener('loadeddata', () => {
        const placeholder = video.closest('.placeholder');
        if (placeholder) {
            video.style.display = 'block'; // Show the video
            placeholder.style.paddingBottom = '0'; // Remove padding from placeholder
            placeholder.classList.remove('placeholder'); // Remove the placeholder class
            console.log(`Video loaded: ${video.src}`);
        }
    });

    // Add click event listener to switch to slideshow view
    video.addEventListener('click', () => {
        changeView('slideshow', url);
    });

    return video;
}

// Function to render images for a specific page
async function renderImages(images, page, loadCount = imagesPerPage) {
    const gallery = document.getElementById('gallery');
    if (!gallery) {
        console.error('Gallery element not found');
        return;
    }
    gallery.innerHTML = ''; // Clear previous images
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = startIndex + loadCount;
    const pageImages = images.slice(startIndex, endIndex);

    try {
        const imagePromises = pageImages.map(async (url) => {
            if (url.endsWith('.mp4')) {
                return await fetchVideoDimensions(url);
            } else {
                return await fetchImageDimensions(url);
            }
        });
        const imagesWithDimensions = await Promise.all(imagePromises);

        imagesWithDimensions.forEach(({ url, width, height }, index) => {
            const placeholder = createPlaceholder({ width, height });
            let mediaElement;
            if (url.endsWith('.mp4')) {
                mediaElement = createVideoElement(url, startIndex + index);
            } else {
                mediaElement = createImageElement(url, startIndex + index);
            }

            placeholder.appendChild(mediaElement);
            gallery.appendChild(placeholder);
            console.log(`Placeholder created for media: ${url}`);
        });

        // Initialize lazy loading
        new LazyLoad({
            elements_selector: ".lazy",
            callback_load: (media) => {
                console.log(`LazyLoad callback: ${media.dataset.src}`);
            }
        });

        // Recalculate layout after images are loaded
        $(gallery).imagesLoaded(() => {
            gallery.style.opacity = 1;
            console.log('Images loaded and layout recalculated.');
        });
    } catch (error) {
        console.error('Error rendering images:', error);
    }
}

// Function to render pagination controls
function renderPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) {
        console.error('Pagination element not found');
        return;
    }
    const totalPages = Math.ceil(data.length / imagesPerPage);
    pagination.innerHTML = '';
    pagination.setAttribute('data-pagination', '');

    // Previous page button
    const prevButton = document.createElement('a');
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.classList.add('prev');
    prevButton.href = '#';
    prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            saveSessionState(window.scrollY, currentPage);
            loadPage(data, currentPage); // Call loadPage to trigger loading animation
        }
    });
    pagination.appendChild(prevButton);

    // Page number buttons
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
            saveSessionState(window.scrollY, currentPage);
            loadPage(data, currentPage); // Call loadPage to trigger loading animation
        });
        li.appendChild(a);
        return li;
    };

    // Logic for displaying pagination buttons
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

    // Next page button
    const nextButton = document.createElement('a');
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.classList.add('next');
    nextButton.href = '#';
    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            saveSessionState(window.scrollY, currentPage);
            loadPage(data, currentPage); // Call loadPage to trigger loading animation
        }
    });
    pagination.appendChild(nextButton);
}

// New function to initialize the gallery
export async function initializeGallery(images, page) {
    setData(images);
    try {
        await renderImages(images, page);
        renderPagination();
    } catch (error) {
        console.error('Error initializing gallery:', error);
    }
}

// Function to change view and update the URL
function changeView(view, image = null) {
    let url = `index.html?view=${view}`;
    if (image) {
        url += `&image=${encodeURIComponent(image)}`;
    }
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = document.getElementById('mainContent');
            const newContent = doc.querySelector('#mainContent').innerHTML;
            mainContent.innerHTML = newContent;
            window.history.pushState({}, '', url);

            if (view === 'gallery') {
                const currentPage = getCurrentPage();
                fetch('images.json')
                    .then(response => response.json())
                    .then(images => {
                        initializeGallery(images, currentPage);
                    })
                    .catch(error => console.error('Error fetching images:', error));
            } else if (view === 'slideshow' && image) {
                const slideshowImage = document.getElementById('slideshowDisplayedImage');
                const slideshowVideo = document.getElementById('slideshowDisplayedVideo');
                if (slideshowImage && slideshowVideo) {
                    if (image.endsWith('.mp4')) {
                        slideshowImage.style.display = 'none';
                        slideshowVideo.style.display = 'block';
                        slideshowVideo.src = image;
                        slideshowVideo.load();
                    } else {
                        slideshowVideo.style.display = 'none';
                        slideshowImage.style.display = 'block';
                        slideshowImage.src = image;
                    }
                }
            }
        })
        .catch(error => console.error('Error changing view:', error));
}

// Ensure functions are only called when the appropriate view is active
document.addEventListener('DOMContentLoaded', () => {
    const view = new URLSearchParams(window.location.search).get('view');
    if (view === 'gallery') {
        const currentPage = getCurrentPage();
        fetch('images.json')
            .then(response => response.json())
            .then(images => {
                initializeGallery(images, currentPage);
            })
            .catch(error => console.error('Error fetching images:', error));
    } else if (view === 'slideshow') {
        const image = new URLSearchParams(window.location.search).get('image');
        if (image) {
            const slideshowImage = document.getElementById('slideshowDisplayedImage');
            const slideshowVideo = document.getElementById('slideshowDisplayedVideo');
            if (slideshowImage && slideshowVideo) {
                if (image.endsWith('.mp4')) {
                    slideshowImage.style.display = 'none';
                    slideshowVideo.style.display = 'block';
                    slideshowVideo.src = image;
                    slideshowVideo.load();
                } else {
                    slideshowVideo.style.display = 'none';
                    slideshowImage.style.display = 'block';
                    slideshowImage.src = image;
                }
            }
        }
    }
});
