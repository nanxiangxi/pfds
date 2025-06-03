export function initNavigation() {
    window.showPage = function(id) {
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(id);
        if (targetPage) {
            targetPage.classList.add('active');
            updateContentNav(id);
        }

        document.querySelectorAll('.nav a').forEach(navLink => {
            navLink.classList.remove('active');
        });
        document.getElementById(`nav-${id}`)?.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateContentNav(pageId) {
        const contentNavList = document.getElementById('contentNavList');
        const currentPage = document.getElementById(pageId);
        const sections = currentPage.querySelectorAll('h2');

        contentNavList.innerHTML = '';
        sections.forEach(section => {
            const sectionId = section.id || section.innerText.replace(/\s+/g, '-');
            section.id = sectionId;

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${sectionId}`;
            link.innerText = section.innerText;
            link.onclick = (e) => {
                e.preventDefault();
                scrollToSection(sectionId);
            };
            listItem.appendChild(link);
            contentNavList.appendChild(listItem);
        });
    }

    document.getElementById('nav-home')?.classList.add('active');
    updateContentNav('home');
}
