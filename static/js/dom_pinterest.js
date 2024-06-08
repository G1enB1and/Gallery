// dom_pinterest.js
import { saveSessionState } from './utils_pinterest.js';

let data = [];
let currentPage = parseInt(sessionStorage.getItem('currentPage')) || 1;
const imagesPerPage = 60;
const initialLoadCount = 10; // Number of images to load initially

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
        img.onerror = reject;
        img.src = url;
    });
}

// Function to create placeholders
function createPlaceholder({ width, height }) {
    const placeholder = document.createElement('div');
    placeholder.className = 'masonry-item placeholder';
    placeholder.style.paddingBottom = `${(height / width) * 100}%`;
    return placeholder;
}

// Function to create image element
function createImageElement(url) {
    const img = document.createElement('img');
    img.className = 'lazy';
    img.dataset.src = url;

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

    return img;
}

// Function to render images for a specific page
export async function renderImages(images, page, loadCount = imagesPerPage) {
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = ''; // Clear previous images
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = startIndex + loadCount;
    const pageImages = images.slice(startIndex, endIndex);

    const imagePromises = pageImages.map(fetchImageDimensions);
    const imagesWithDimensions = await Promise.all(imagePromises);

    imagesWithDimensions.forEach(({ url, width, height }) => {
        const placeholder = createPlaceholder({ width, height });
        const img = createImageElement(url);

        placeholder.appendChild(img);
        gallery.appendChild(placeholder);
        console.log(`Placeholder created for image: ${url}`);
    });

    // Initialize lazy loading
    new LazyLoad({
        elements_selector: ".lazy",
        callback_load: (img) => {
            console.log(`LazyLoad callback: ${img.dataset.src}`);
        }
    });

    // Recalculate layout after images are loaded
    imagesLoaded(gallery, function () {
        gallery.style.opacity = 1;
        console.log('Images loaded and layout recalculated.');
    });
}

// Function to render pagination controls
export function renderPagination() {
    const pagination = document.getElementById('pagination');
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
            renderImages(data, currentPage);
            renderPagination();
            saveSessionState(window.scrollY, currentPage);
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
            renderImages(data, currentPage);
            renderPagination();
            saveSessionState(window.scrollY, currentPage);
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
            renderImages(data, currentPage);
            renderPagination();
            saveSessionState(window.scrollY, currentPage);
        }
    });
    pagination.appendChild(nextButton);
}
