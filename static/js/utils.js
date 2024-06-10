// utils.js

// Function to parse query parameters
export function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Function to get the current image URL from the query parameters
export function getCurrentImageUrl() {
    const params = new URLSearchParams(window.location.search);
    const currentImageUrl = params.get('image');
    console.log(`Current image URL: ${currentImageUrl}`);
    return currentImageUrl;
}
