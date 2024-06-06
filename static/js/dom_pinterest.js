// dom_pinterest.js
import { saveSessionState } from './utils_pinterest.js';

let data = [];
let currentPage = parseInt(sessionStorage.getItem('currentPage')) || 1;
const imagesPerPage = 12 * 5; // 12 rows * 5 columns

export function setData(images) {
    data = images;
}

export function getCurrentPage() {
    return currentPage;
}

export function setCurrentPage(page) {
    currentPage = page;
}

// Function to render images for a specific page
export function renderImages(images, page) {
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = ''; // Clear previous images
    const startIndex = (page - 1) * imagesPerPage;
    const endIndex = startIndex + imagesPerPage;
    const pageImages = images.slice(startIndex, endIndex);
    pageImages.forEach((mediaPath, index) => {
        const mediaElement = document.createElement(mediaPath.endsWith('.mp4') ? 'video' : 'img');
        mediaElement.src = mediaPath;
        mediaElement.classList.add('imageItem');
        mediaElement.classList.add('masonry-item');
        mediaElement.setAttribute('data-index', startIndex + index); // Set the data-index attribute
        if (mediaPath.endsWith('.mp4')) {
            mediaElement.controls = true;
        }
        imageGrid.appendChild(mediaElement);
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