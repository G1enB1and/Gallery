// fileTree.js
export function populateFileTree() {
    const fileTreeContainer = document.getElementById('fileTree');
    fetch('/file-tree')
        .then(response => response.json())
        .then(data => {
            buildFileTree(fileTreeContainer, data);
            restoreFileTreeState();
        })
        .catch(error => console.error('Error fetching file tree:', error));
}

export function buildFileTree(container, nodes) {
    container.innerHTML = ''; // Clear the current file tree
    nodes.forEach(node => {
        const li = document.createElement('li');
        const icon = document.createElement('i');
        icon.className = 'fas fa-folder'; // Font Awesome folder icon
        li.appendChild(icon);
        li.appendChild(document.createTextNode(` ${node.name}`));

        if (node.type === 'directory') {
            if (node.children && node.children.length > 0) {
                const toggleIcon = document.createElement('span');
                toggleIcon.className = 'toggle-icon';
                toggleIcon.innerHTML = '&#9654;'; // Right pointing triangle
                li.insertBefore(toggleIcon, li.firstChild);

                const subList = document.createElement('ul');
                subList.style.display = 'none'; // Initially hide subfolders
                buildFileTree(subList, node.children);
                li.appendChild(subList);

                toggleIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isExpanded = subList.style.display === 'block';
                    subList.style.display = isExpanded ? 'none' : 'block';
                    toggleIcon.innerHTML = isExpanded ? '&#9654;' : '&#9660;';
                    saveFileTreeState();
                });
            }

            li.addEventListener('click', (e) => {
                e.stopPropagation();
                fetch('/update-images', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ directory: node.path })
                })
                .then(response => response.text())
                .then(message => {
                    console.log(message);
                    setTimeout(() => {
                        fetch('images.json')
                            .then(response => response.json())
                            .then(images => {
                                setData(images);
                                renderImages(images, getCurrentPage());
                                renderPagination(images.length, 12 * 5, getCurrentPage());
                            })
                            .catch(error => console.error('Error fetching images:', error));
                    }, 300);
                })
                .catch(error => console.error('Error updating images:', error));
            });
        }
        container.appendChild(li);
    });

    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
}

function saveFileTreeState() {
    const state = {};
    document.querySelectorAll('#fileTree .toggle-icon').forEach((icon, index) => {
        const subList = icon.parentElement.querySelector('ul');
        if (subList) {
            state[index] = subList.style.display === 'block';
        }
    });
    sessionStorage.setItem('fileTreeState', JSON.stringify(state));
}

function restoreFileTreeState() {
    const state = JSON.parse(sessionStorage.getItem('fileTreeState'));
    if (state) {
        document.querySelectorAll('#fileTree .toggle-icon').forEach((icon, index) => {
            const subList = icon.parentElement.querySelector('ul');
            if (subList && state[index] !== undefined) {
                subList.style.display = state[index] ? 'block' : 'none';
                icon.innerHTML = state[index] ? '&#9660;' : '&#9654;';
            }
        });
    }
}

function expandAll() {
    document.querySelectorAll('#fileTree .toggle-icon').forEach(icon => {
        const subList = icon.parentElement.querySelector('ul');
        if (subList) {
            subList.style.display = 'block';
            icon.innerHTML = '&#9660;';
        }
    });
    saveFileTreeState();
}

function collapseAll() {
    document.querySelectorAll('#fileTree .toggle-icon').forEach(icon => {
        const subList = icon.parentElement.querySelector('ul');
        if (subList) {
            subList.style.display = 'none';
            icon.innerHTML = '&#9654;';
        }
    });
    saveFileTreeState();
}
