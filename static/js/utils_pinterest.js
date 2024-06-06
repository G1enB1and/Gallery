// utils_pinterest.js

// Function to save scroll position and current page to session storage
export function saveSessionState(scrollPosition, currentPage) {
    sessionStorage.setItem('scrollPosition', scrollPosition);
    sessionStorage.setItem('currentPage', currentPage);
}

// Function to restore scroll position after images load
export function restoreScrollPositionAfterImagesLoad() {
    const allMedia = document.querySelectorAll('.imageItem');
    let loadedMediaCount = 0;
    const totalMedia = allMedia.length;

    allMedia.forEach((media) => {
        if (media.complete || (media.tagName === 'VIDEO' && media.readyState === 4)) {
            loadedMediaCount++;
        } else {
            media.addEventListener('load', () => {
                loadedMediaCount++;
                if (loadedMediaCount === totalMedia) {
                    window.scrollTo(0, sessionStorage.getItem('scrollPosition') || 0);
                }
            });
            media.addEventListener('error', () => {
                loadedMediaCount++;
                if (loadedMediaCount === totalMedia) {
                    window.scrollTo(0, sessionStorage.getItem('scrollPosition') || 0);
                }
            });
        }
    });

    if (loadedMediaCount === totalMedia) {
        window.scrollTo(0, sessionStorage.getItem('scrollPosition') || 0);
    }
}