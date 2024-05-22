// Function to get the current page number from the query parameters
function getCurrentPage() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('page')) || 1; // Default to page 1 if no page parameter is present
}

let currentPage = getCurrentPage(); // Define currentPage globally

document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded');
    const imageGrid = document.getElementById('imageGrid');
    let data = []; // Array to store the image paths

    fetch('images.json')
        .then(response => response.json())
        .then(images => {
            data = images;
            console.log('Images fetched:', data);
            renderImages(data, currentPage); // Render the first page of images
            if (typeof renderPagination === 'function') {
                renderPagination(data); // Call renderPagination if it's defined
            }
        })
        .catch(error => console.error('Error fetching images:', error));

    // Function to render images for a specific page
    function renderImages(images, page) {
        console.log('Rendering images for page:', page);
        imageGrid.innerHTML = ''; // Clear previous images
        const imagesPerPage = 12 * 5; // 12 rows * 5 columns
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

    // Event listener for image clicks
    imageGrid.addEventListener('click', function(event) {
        if (event.target && event.target.matches('img.imageItem')) {
            const index = parseInt(event.target.getAttribute('data-index'));
            const imageUrl = data[index]; // Get the URL of the clicked image
            currentPage = getCurrentPage(); // Get the current page number from the query parameters

            // Navigate to index.html with image URL and page number as query parameters
            window.location.href = `index.html?image=${encodeURIComponent(imageUrl)}&page=${currentPage}`;
        }
    });
});
