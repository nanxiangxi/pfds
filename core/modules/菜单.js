// 汉堡菜单功能
export function initHamburgerMenu() {
    document.addEventListener('DOMContentLoaded', function () {
        const hamburger = document.querySelector('.hamburger');
        const nav = document.querySelector('.pfds-nav');
        const overlay = document.getElementById('mobileOverlay');
        const container = document.querySelector('.pfds-container');

        if (!hamburger || !nav || !overlay || !container) {
            console.error("缺少必要元素");
            return;
        }

        hamburger.addEventListener('click', function () {
            this.classList.toggle('active');
            nav.classList.toggle('show');
            container.classList.toggle('show-nav');
            overlay.style.display = nav.classList.contains('show') ? 'block' : 'none';
        });

        overlay.addEventListener('click', function () {
            hamburger.classList.remove('active');
            nav.classList.remove('show');
            container.classList.remove('show-nav');
            this.style.display = 'none';
        });
    });
}
// 锚点平滑滚动功能
export function initPageAnchors() {
    document.addEventListener("DOMContentLoaded", function () {
        document.querySelectorAll('.page-anchor').forEach(link => {
            link.addEventListener('click', function (e) {
                const targetId = this.getAttribute('data-target-id');
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    });
}
