
// === highlight.js ===
function initHighlight() {
    import('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js')
        .then(() => {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });
}


// === modal.js ===
function initModal() {
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


// === navigation.js ===
function initNavigation() {
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


// === scroll.js ===
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function initScroll() {
    window.scrollToSection = scrollToSection;
}


// === search.js ===
let originalContent = {};

function initSearch() {
    collectContentData();

    window.openSearchModal = () => {
        const query = document.getElementById('searchInput').value.trim().toLowerCase();
        const modalContent = document.getElementById('modalContent');

        if (!query) {
            alert('请输入关键词进行搜索');
            return;
        }

        const results = [];
        const seenSections = new Set();

        Object.keys(originalContent).forEach(id => {
            originalContent[id].sections.forEach(section => {
                const titleMatch = section.title.toLowerCase().includes(query);
                const contentMatch = section.content.toLowerCase().includes(query);

                if ((titleMatch || contentMatch) && !seenSections.has(section.id)) {
                    seenSections.add(section.id);
                    results.push({
                        id: section.id,
                        pageId: section.pageId,
                        title: highlightText(section.title, query),
                        summary: highlightText(truncateText(section.content, 50), query)
                    });
                }
            });
        });

        modalContent.innerHTML = '';
        if (results.length > 0) {
            const cardsHTML = results.map(result => `
                <div class="search-card" onclick="handleSearchResult('${result.pageId}', '${result.id}')">
                    <h4>${result.title}</h4>
                    <p>${result.summary}</p>
                </div>
            `).join('');
            modalContent.innerHTML = `<h3>找到 ${results.length} 个结果:</h3>` + cardsHTML;
        } else {
            modalContent.innerHTML = '<p>没有找到相关结果。</p>';
        }

        document.getElementById('searchModal').style.display = 'flex';
    };

    window.handleSearchResult = (pageId, sectionId) => {
        closeSearchModal();
        showPage(pageId);

        setTimeout(() => {
            scrollToSection(sectionId);
        }, 300);
    };
}

function collectContentData() {
    document.querySelectorAll('.page-content').forEach(page => {
        const sections = page.querySelectorAll('h2');
        const sectionData = [];

        sections.forEach(section => {
            const contentElements = [];
            let nextElement = section.nextElementSibling;

            while (nextElement && nextElement.tagName !== 'H2') {
                if (nextElement.tagName.match(/P|PRE|OL|UL/)) {
                    contentElements.push(nextElement.innerText.trim());
                }
                nextElement = nextElement.nextElementSibling;
            }

            sectionData.push({
                id: section.id || section.innerText.replace(/\s+/g, '-'),
                title: section.innerText,
                content: contentElements.join('\n'),
                pageId: page.id
            });
        });

        originalContent[page.id] = {
            sections: sectionData
        };
    });
}

function highlightText(text, query) {
    return text.replace(new RegExp(`(${query})`, 'gi'), '<span class="highlight">$1</span>');
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}


// 初始化模块
initHighlight();
initModal();
initNavigation();
initScroll();
initSearch();
