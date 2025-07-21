export function initNavigation() {
    window.showPage = function(id) {
        // 隐藏所有页面内容
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.remove('active');
        });

        // 显示当前页面
        const targetPage = document.getElementById(id);
        if (targetPage) {
            targetPage.classList.add('active');
            updateContentNav(id);
        }

        // 更新高亮状态
        const navLinks = document.querySelectorAll('.pfds-nav a');
        navLinks.forEach(navLink => {
            navLink.classList.remove('active');
        });

        const currentNavLink = document.getElementById(`nav-${id}`);
        if (currentNavLink) {
            currentNavLink.classList.add('active');
        }

        // 展开并高亮父级分组（统一处理）
        requestAnimationFrame(() => {
            setTimeout(() => {
                expandNavGroupByPageId(id);
                highlightParentGroup(id);
            }, 20);
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });

        const event = new CustomEvent('showPage', { detail: { pageId: id } });
        window.dispatchEvent(event);
    };

    function highlightParentGroup(pageId) {
        const link = document.querySelector(`.pfds-nav a[data-page-id='${pageId}']`);
        if (!link) return;

        // 找到最近的父级分组
        const parentLi = link.closest('li')?.parentElement?.closest('li');
        if (!parentLi) return;

        const toggle = parentLi.querySelector('.nav-group-toggle');
        if (!toggle) return;

        // 高亮父级 toggle
        toggle.classList.add('active');
        const icon = toggle.querySelector('.toggle-icon');
        if (icon) icon.classList.add('active');
    }

    function scrollToSection(id) {
        const element = document.getElementById(id);

        if (element) {
            console.log(`[scrollToSection] 滚动到元素: #${id}`, element);

            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
                inline: 'nearest'
            });
        } else {
            console.warn(`[scrollToSection] 找不到目标元素: #${id}`);
        }
    }

    function updateContentNav(pageId) {
        const contentNavList = document.getElementById('contentNavList');
        const currentPage = document.getElementById(pageId);
        if (!currentPage) return;

        const sections = currentPage.querySelectorAll('h2');

        contentNavList.innerHTML = '';
        sections.forEach(section => {
            const sectionId = section.id || section.innerText.replace(/\s+/g, '-').toLowerCase();
            section.id = sectionId;

            console.log(`[updateContentNav] 生成标题 ID: ${sectionId}`, section);

            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${sectionId}`;
            link.innerText = section.innerText;
            link.onclick = (e) => {
                e.preventDefault();
                console.log(`[侧边栏点击] 正在跳转到: ${sectionId}`);
                scrollToSection(sectionId);
            };
            listItem.appendChild(link);
            contentNavList.appendChild(listItem);
        });
    }

    function expandNavGroupByPageId(pageId) {
        const currentLink = document.querySelector(`.pfds-nav a[data-page-id='${pageId}']`);
        if (!currentLink) return;

        const parentLi = currentLink.closest('li')?.parentElement?.closest('li');
        if (!parentLi) return;

        const toggle = parentLi.querySelector('.nav-group-toggle');
        const content = parentLi.querySelector('.nav-group-content');
        const icon = parentLi.querySelector('.toggle-icon');

        if (!toggle || !content) return;

        // 已展开则不再处理
        const isExpanded = toggle.classList.contains('active') ||
            (icon && icon.classList.contains('active'));

        if (!isExpanded) {
            toggle.classList.add('active');
            content.classList.add('active');
            content.style.maxHeight = content.scrollHeight + 'px';
            if (icon) icon.classList.add('active');
        }
    }

    // 页面加载时自动初始化导航
    document.addEventListener('DOMContentLoaded', function () {
        const toggles = document.querySelectorAll('.pfds-nav .nav-group-toggle');

        // 获取第一个非分组项
        function getFirstNonGroupLink() {
            const links = document.querySelectorAll('.pfds-nav > li > a[data-page-id]');
            for (let link of links) {
                if (!link.classList.contains('nav-group-toggle')) {
                    return link;
                }
            }
            return null;
        }

        // 获取第一个分组下的第一个子项
        function getFirstGroupSubLink() {
            const firstGroup = document.querySelector('.pfds-nav .nav-group-toggle');
            if (!firstGroup) return null;

            const firstSubLink = firstGroup.closest('li')?.querySelector('.nav-group-content a[data-page-id]');
            return firstSubLink || null;
        }

        function openDefaultPage() {
            let defaultLink = getFirstNonGroupLink();

            if (!defaultLink) {
                defaultLink = getFirstGroupSubLink();
            }

            if (defaultLink) {
                const pageId = defaultLink.getAttribute('data-page-id');

                // 显示页面 + 高亮 + 展开
                showPage(pageId);

                // 延迟展开父级分组
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        expandNavGroupByPageId(pageId);
                        highlightParentGroup(pageId);
                    }, 20);
                });
            }
        }

        // 点击展开/收起分组
        toggles.forEach(toggle => {
            toggle.addEventListener('click', function (e) {
                e.preventDefault();
                const content = this.closest('li').querySelector('.nav-group-content');
                const icon = this.querySelector('.toggle-icon');

                const isExpanded = this.classList.contains('active') ||
                    (icon && icon.classList.contains('active'));

                if (isExpanded) {
                    this.classList.remove('active');
                    content.classList.remove('active');
                    content.style.maxHeight = '0';
                    if (icon) icon.classList.remove('active');
                } else {
                    this.classList.add('active');
                    content.classList.add('active');
                    content.style.maxHeight = content.scrollHeight + 'px';
                    if (icon) icon.classList.add('active');
                }
            });
        });

        // 页面加载时根据当前页面 ID 展开对应分组
        const currentPageId = document.querySelector('.pfds-content-main > div')?.id;

        if (currentPageId) {
            showPage(currentPageId);
            requestAnimationFrame(() => {
                setTimeout(() => {
                    expandNavGroupByPageId(currentPageId);
                    highlightParentGroup(currentPageId);
                }, 20);
            });
        } else {
            openDefaultPage(); // 否则显示默认页面
        }
    });

    // 手动高亮默认页面（可选）
    document.getElementById('nav-home')?.classList.add('active');
    updateContentNav('home');

    const currentPageId = document.querySelector('.pfds-content-main > div')?.id;
    if (currentPageId) {
        requestAnimationFrame(() => {
            setTimeout(() => {
                expandNavGroupByPageId(currentPageId);
                highlightParentGroup(currentPageId);
            }, 20);
        });
    }
}