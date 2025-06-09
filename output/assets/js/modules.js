
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
let originalContent = [];

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
        const seenElements = new Set(); // 用 element 作为 key 来去重

        originalContent.forEach(item => {
            if (item.text.toLowerCase().includes(query)) {
                if (!seenElements.has(item.element)) {
                    seenElements.add(item.element);

                    const closestHeading = findClosestHeading(item.element);
                    const summary = highlightText(truncateText(item.text, 60), query);

                    results.push({
                        title: closestHeading?.innerText || '未知标题',
                        summary,
                        element: item.element,
                        pageId: item.pageId
                    });
                }
            }
        });

        window.resultsCache = results; // 缓存供点击跳转使用
        modalContent.innerHTML = '';

        if (results.length > 0) {
            const cardsHTML = results.map((result, index) => `
                <div class="search-card" onclick="handleSearchResult('${result.pageId}', ${index})">
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

    window.handleSearchResult = (pageId, resultIndex) => {
        closeSearchModal();
        showPage(pageId);

        setTimeout(() => {
            const result = resultsCache[resultIndex];
            scrollToElement(result.element);
            highlightElement(result.element);
        }, 300);
    };
}

function collectContentData() {
    originalContent = [];
    const processedElements = new Set(); // 用于防止重复采集
    const contentTags = ['P', 'LI', 'PRE', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE']; // 可搜索内容标签

    document.body.querySelectorAll(contentTags.join(',')).forEach(el => {
        const text = el.innerText.trim();
        if (text && text.length > 0 && !processedElements.has(el)) {
            processedElements.add(el); // 标记为已处理

            const pageId = findPageId(el);
            originalContent.push({
                text,
                element: el,
                pageId
            });
        }
    });
}

function findPageId(element) {
    let el = element;
    while (el && !el.classList?.contains('page-content')) {
        el = el.parentElement;
    }
    return el?.id || 'unknown';
}

function findClosestHeading(el) {
    while (el && !['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName)) {
        el = el.previousElementSibling || el.parentElement;
    }
    return el && ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(el.tagName) ? el : null;
}

function highlightText(text, query) {
    return text.replace(new RegExp(`(${query})`, 'gi'), '<span class="highlight">$1</span>');
}

function truncateText(text, maxLength) {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function scrollToElement(el) {
    const blockEl = getBlockElement(el);
    if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function getBlockElement(el) {
    while (el && !window.getComputedStyle(el).display.startsWith('block')) {
        el = el.parentElement;
    }
    return el;
}

function highlightElement(el) {
    const blockEl = getBlockElement(el);
    if (blockEl) {
        blockEl.style.transition = 'background-color 0.5s';
        blockEl.style.backgroundColor = 'rgb(181,244,244)';
        setTimeout(() => {
            blockEl.style.backgroundColor = '';
        }, 2000);
    }
}

function closeSearchModal() {
    document.getElementById('searchModal').style.display = 'none';
}

// 初始化模块
initHighlight();
initModal();
initNavigation();
initScroll();
initSearch();
