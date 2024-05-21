document.addEventListener('DOMContentLoaded', function() {
    const imageGrid = document.getElementById('imageGrid');
    const pagination = document.getElementById('pagination');
    const imagesPerPage = 12 * 5; // 12 rows * 5 columns
    let currentPage = 1;
    let data = []; // Array to store the image paths

    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            renderImages(data, currentPage); // Render the first page of images
            renderPagination();
        })
        .catch(error => console.error('Error fetching images:', error));

    // Function to render images for a specific page
    function renderImages(images, page) {
        imageGrid.innerHTML = ''; // Clear previous images
        const startIndex = (page - 1) * imagesPerPage;
        const endIndex = startIndex + imagesPerPage;
        const pageImages = images.slice(startIndex, endIndex);
        pageImages.forEach((imagePath, index) => {
            const img = document.createElement('img');
            img.src = imagePath;
            img.classList.add('imageItem');
            img.classList.add('masonry-item');
            img.setAttribute('data-index', startIndex + index); // Set the data-index attribute
            imageGrid.appendChild(img);
        });
    }

    // Function to render pagination controls
function renderPagination() {
    const totalPages = Math.ceil(data.length / imagesPerPage);
    pagination.innerHTML = '';
    
    // First page button
    const firstButton = document.createElement('button');
    firstButton.textContent = 'First';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => {
        currentPage = 1;
        renderImages(data, currentPage);
        renderPagination();
    });
    pagination.appendChild(firstButton);
    
    // Previous page button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        currentPage--;
        renderImages(data, currentPage);
        renderPagination();
    });
    pagination.appendChild(prevButton);
    
    // Page number buttons
    const maxPageButtons = 7;
    const startPage = Math.max(1, Math.min(currentPage - Math.floor(maxPageButtons / 2), totalPages - maxPageButtons + 1));
    const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);
    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.classList.toggle('active', i === currentPage);
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderImages(data, currentPage);
            renderPagination();
        });
        pagination.appendChild(pageButton);
    }
    
    // Next page button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        currentPage++;
        renderImages(data, currentPage);
        renderPagination();
    });
    pagination.appendChild(nextButton);
    
    // Last page button
    const lastButton = document.createElement('button');
    lastButton.textContent = 'Last';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => {
        currentPage = totalPages;
        renderImages(data, currentPage);
        renderPagination();
    });
    pagination.appendChild(lastButton);
    
    // Center pagination
    pagination.style.textAlign = 'center';
}

    // Event listener for image clicks
    imageGrid.addEventListener('click', function(event) {
        if (event.target && event.target.matches('img.imageItem')) {
            const index = parseInt(event.target.getAttribute('data-index'));
            const imageUrl = data[index]; // Get the URL of the clicked image
            const currentPage = getCurrentPage(); // Get the current page number from the query parameters

            // Navigate to index.html with image URL and page number as query parameters
            window.location.href = `index.html?image=${encodeURIComponent(imageUrl)}&page=${currentPage}`;
        }
    });

    // Function to get the current page number from the query parameters
    function getCurrentPage() {
        const params = new URLSearchParams(window.location.search);
        return parseInt(params.get('page')) || 1; // Default to page 1 if no page parameter is present
    }
});
