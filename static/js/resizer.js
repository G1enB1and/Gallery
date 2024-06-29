document.addEventListener('DOMContentLoaded', () => {
    const leftPanel = document.getElementById('leftPanel');
    const dataPanel = document.getElementById('dataPanel');
    const mainContent = document.getElementById('mainContent');
    const resizerFiletree = document.getElementById('resizer-filetree');
    const resizerDatapanel = document.getElementById('resizer-datapanel');

    let isResizing = false;
    let lastDownX = 0;

    resizerFiletree.addEventListener('mousedown', (e) => {
        isResizing = true;
        lastDownX = e.clientX;
        document.addEventListener('mousemove', resizeFiletree);
        document.addEventListener('mouseup', stopResize);
    });

    resizerDatapanel.addEventListener('mousedown', (e) => {
        isResizing = true;
        lastDownX = e.clientX;
        document.addEventListener('mousemove', resizeDatapanel);
        document.addEventListener('mouseup', stopResize);
    });

    function resizeFiletree(e) {
        if (!isResizing) return;
        const offsetRight = document.body.offsetWidth - (e.clientX - lastDownX);
        leftPanel.style.width = `${e.clientX}px`;
        mainContent.style.width = `calc(100% - ${leftPanel.offsetWidth}px - ${dataPanel.offsetWidth}px)`;
    }

    function resizeDatapanel(e) {
        if (!isResizing) return;
        const offsetLeft = e.clientX - lastDownX;
        dataPanel.style.width = `${document.body.offsetWidth - e.clientX}px`;
        mainContent.style.width = `calc(100% - ${leftPanel.offsetWidth}px - ${dataPanel.offsetWidth}px)`;
    }

    function stopResize(e) {
        isResizing = false;
        document.removeEventListener('mousemove', resizeFiletree);
        document.removeEventListener('mousemove', resizeDatapanel);
        document.removeEventListener('mouseup', stopResize);
    }
});
