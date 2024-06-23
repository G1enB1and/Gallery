// utils_pinterest.js

let scrollPositionRestored = false;

export function saveSessionState(scrollPosition, currentPage) {
    sessionStorage.setItem('scrollPosition', scrollPosition);
    sessionStorage.setItem('currentPage', currentPage);
}

export function restoreScrollPositionAfterImagesLoad() {
    if (scrollPositionRestored) return;

    const scrollPosition = sessionStorage.getItem('scrollPosition') || 0;
    window.scrollTo(0, scrollPosition);
    scrollPositionRestored = true;
} 
