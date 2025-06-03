export function initModal() {
    const modalOverlay = document.getElementById('searchModal');

    window.closeSearchModal = () => {
        modalOverlay.style.display = 'none';
    };

    document.body.addEventListener('click', (e) => {
        const closeButton = e.target.closest('.close-btn');
        const isOutsideClick = e.target === modalOverlay;

        if (closeButton || isOutsideClick) {
            closeSearchModal();
        }
    });
}
