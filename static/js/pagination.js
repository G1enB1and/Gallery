function renderPagination(data) {
    console.log('Rendering pagination');
    const pagination = document.getElementById('pagination');
    const imagesPerPage = 12 * 5; // 12 rows * 5 columns
    const totalPages = Math.ceil(data.length / imagesPerPage);

    pagination.innerHTML = '';

    // First page button
    const firstButton = document.createElement('button');
    firstButton.textContent = 'First';
    firstButton.disabled = currentPage === 1;
    firstButton.addEventListener('click', () => {
        console.log('First page button clicked');
        currentPage = 1;
        renderImages(data, currentPage);
        renderPagination(data);
    });
    pagination.appendChild(firstButton);

    // Previous page button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        console.log('Previous page button clicked');
        currentPage--;
        renderImages(data, currentPage);
        renderPagination(data);
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
            console.log('Page button clicked:', i);
            currentPage = i;
            renderImages(data, currentPage);
            renderPagination(data);
        });
        pagination.appendChild(pageButton);
    }

    // Next page button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        console.log('Next page button clicked');
        currentPage++;
        renderImages(data, currentPage);
        renderPagination(data);
    });
    pagination.appendChild(nextButton);

    // Last page button
    const lastButton = document.createElement('button');
    lastButton.textContent = 'Last';
    lastButton.disabled = currentPage === totalPages;
    lastButton.addEventListener('click', () => {
        console.log('Last page button clicked');
        currentPage = totalPages;
        renderImages(data, currentPage);
        renderPagination(data);
    });
    pagination.appendChild(lastButton);

    // Center pagination
    pagination.style.textAlign = 'center';
}
