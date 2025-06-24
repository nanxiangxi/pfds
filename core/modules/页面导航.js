export function initNavigation() {
    window.showPage = function(id) {
     //   console.log("调用 showPage:", id);

        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(id);
        if (targetPage) {
            targetPage.classList.add('active');
            updateContentNav(id);
        }

        // 👇 打印将要清理的导航项
        const navLinks = document.querySelectorAll('.pfds-nav a');
        //console.log("找到的侧边栏导航项数量:", navLinks.length);
        navLinks.forEach(navLink => {
            //console.log("移除 active from", navLink.id || navLink.innerText);
            navLink.classList.remove('active');
        });

        const currentNavLink = document.getElementById(`nav-${id}`);
        if (currentNavLink) {
            currentNavLink.classList.add('active');
            //console.log("设置 active to", currentNavLink.id || currentNavLink.innerText);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });

        const event = new CustomEvent('showPage', { detail: { pageId: id } });
        window.dispatchEvent(event);
    }

    function updateContentNav(pageId) {
        const contentNavList = document.getElementById('contentNavList');
        const currentPage = document.getElementById(pageId);
        const sections = currentPage.querySelectorAll('h2');

        contentNavList.innerHTML = '';
        sections.forEach(section => {
            const sectionId = section.id || section.innerText.replace(/\s+/g, '-').toLowerCase();
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