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
            }
        });
        pagination.appendChild(nextButton);
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
