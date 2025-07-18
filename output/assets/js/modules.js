
// === css自动加载.js ===
function initCssAutoLoad() {
    let currentCssLink = null;

    function loadPageCss(pageId) {
        // 移除旧的 CSS 文件
        if (currentCssLink) {
            currentCssLink.remove();
            currentCssLink = null;
        }

        // 构造新的 CSS 路径
        const cssPath = `assets/css/css-${pageId}.css`;

        // 创建 link 标签
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;

        // 保存引用以便下次移除
        currentCssLink = link;

        // 插入到 head 中
        document.head.appendChild(link);
    }

    // 监听页面切换事件（假设通过 showPage 切换）
    window.addEventListener('showPage', (e) => {
        loadPageCss(e.detail.pageId);
    });

    // 页面首次加载时也尝试加载当前 active 页面的样式
    const activePage = document.querySelector('.page-content.active');
    if (activePage && activePage.id) {
        loadPageCss(activePage.id);
    }
}

// === js动态加载.js ===
function initJsAutoLoad() {
    let currentScript = null;

    function loadPageScript(pageId) {
        // 移除之前加载的脚本（如果存在）
        if (currentScript) {
            currentScript.remove();
            currentScript = null;
        }

        // 构造新的 JS 路径
        const jsPath = `assets/js/script-${pageId}.js`;

        // 创建 script 标签
        const script = document.createElement('script');
        script.src = jsPath;

        // 添加自定义属性 mod="pageId"
        script.setAttribute('mod', pageId); // 使用非 data-* 属性

        // 保存引用以便后续移除
        currentScript = script;

        // 插入到 <body> 的底部
        document.body.appendChild(script);
    }

    // 监听页面切换事件（假设通过 showPage 切换）
    window.addEventListener('showPage', (e) => {
        loadPageScript(e.detail.pageId);
    });

    // 页面首次加载时也尝试加载当前 active 页面的脚本
    const activePage = document.querySelector('.page-content.active');
    if (activePage && activePage.id) {
        loadPageScript(activePage.id);
    }
}

// === js隔离.js ===
function initJsIsolation() {
    function createSandboxDocument(targetId) {
        return {
            getElementById: function (id) {
                if (id === targetId) {
                    return {
                        get textContent() {
                            const el = document.getElementById(id);
                            return el ? el.textContent : '';
                        },
                        set textContent(val) {
                            const el = document.getElementById(id);
                            if (el) el.textContent = val;
                        }
                    };
                }
                return null;
            }
        };
    }

    function executeIsolatedScript(scriptElement) {
        const targetId = scriptElement.getAttribute('mod');
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.warn(`目标元素 #${targetId} 不存在，脚本暂不执行`);
            return false;
        }

        if (scriptElement.dataset.executed) return true;
        scriptElement.dataset.executed = 'true';

        const src = scriptElement.getAttribute('src');
        if (!src) {
            console.warn('该脚本未指定 src 属性，跳过执行');
            return false;
        }

        const finalUrl = new URL(src, location.href).href;

        if (scriptElement._fetchPromise) {
            return scriptElement._fetchPromise;
        }

        const fetchPromise = fetch(finalUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.text();
            })
            .then(code => {
                try {
                    const sandboxDoc = createSandboxDocument(targetId);
                    const func = new Function('document', 'console', code);
                    func(sandboxDoc, {
                        log: (...args) => console.log('[sandbox]', ...args),
                        warn: (...args) => console.warn('[sandbox]', ...args),
                        error: (...args) => console.error('[sandbox]', ...args)
                    });
                } catch (e) {
                    console.error(`执行脚本 #${targetId} 出错：`, e);
                }
            })
            .catch(e => {
                console.error(`加载脚本 ${finalUrl} 出错：`, e);
            });

        scriptElement._fetchPromise = fetchPromise;
        return fetchPromise;
    }

    function initIsolatedScripts() {
        document.querySelectorAll('script[mod][src]').forEach(script => {
            executeIsolatedScript(script);
        });
    }

    const observer = new MutationObserver(mutations => {
        initIsolatedScripts();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('DOMContentLoaded', initIsolatedScripts);
}

// === 代码高亮.js ===
function initHighlight() {
    import('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js')
        .then(() => {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        });
}


// === 平滑滚动.js ===
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


// === 搜索.js ===
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

                    // 如果标题是“未知标题”，但元素没有 id，则跳过此结果
                    if (!closestHeading && !item.element.id) {
                        return;
                    }

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
    const processedElements = new Set(); // 已采集的元素
    const processedTextKeys = new Set();  // 已采集的文本 key（用于去重）

    function generateUniqueKey(text, parentPath) {
        return `${parentPath}:${text.slice(0, 20)}...`;
    }

    function getParentPath(node) {
        let path = '';
        while (node && node !== document.body) {
            path += node.tagName || 'unknown';
            node = node.parentNode;
        }
        return path;
    }

    function walk(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            // 检查当前节点或祖先是否是 .no-search（不可搜索区域）
            let current = node;
            while (current && current !== document.body) {
                if (current.classList?.contains('no-search') || current.hasAttribute('data-no-search')) {
                    return; // 跳过整个子树
                }
                current = current.parentElement;
            }

            // 忽略脚本、样式、注释等内容
            if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) return;

            // 如果是 inline 元素但包含文本内容，则直接采集
            if (node.childNodes.length === 1 && node.firstChild.nodeType === Node.TEXT_NODE) {
                const text = node.innerText.trim();
                if (text && !processedElements.has(node)) {
                    processedElements.add(node);
                    const pageId = findPageId(node);
                    originalContent.push({
                        text,
                        element: node,
                        pageId
                    });
                }
            }

            // 继续遍历子节点
            for (let child of node.childNodes) {
                walk(child);
            }
        } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (!text) return;

            const parentEl = node.parentElement;
            const parentPath = getParentPath(node.parentNode);
            const uniqueKey = generateUniqueKey(text, parentPath);

            if (processedTextKeys.has(uniqueKey)) return;
            processedTextKeys.add(uniqueKey);

            let targetElement = parentEl || {
                tagName: 'VIRTUAL',
                toString: () => '[Virtual Text]',
                scrollIntoView: () => {},
                style: {}
            };

            const pageId = findPageId(parentEl || document.body);

            originalContent.push({
                text,
                element: targetElement,
                pageId
            });
        }
    }

    walk(document.body); // 从 body 开始深度遍历
}

function findPageId(element) {
    let el = element;
    while (el && !el.classList?.contains('page-content')) {
        el = el.parentElement;
    }
    return el?.id || 'unknown';
}

function findClosestHeading(el) {
    let current = el;
    const maxSteps = 50; // 防止死循环
    let steps = 0;

    // 先向上找 heading
    while (current && steps < maxSteps) {
        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(current.tagName)) {
            return current;
        }
        current = current.previousElementSibling || current.parentElement;
        steps++;
    }

    // 再次从当前元素向上查找
    current = el.parentElement;
    steps = 0;
    while (current && steps < maxSteps) {
        if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(current.tagName)) {
            return current;
        }
        current = current.parentElement;
        steps++;
    }

    return null;
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
    // 如果是虚拟元素，不执行高亮
    if (el.tagName === 'VIRTUAL') return;

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

// === 搜索模态框.js ===
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


// === 页面导航.js ===
function initNavigation() {
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

// 初始化模块
initHighlight();
initModal();
initNavigation();
initScroll();
initSearch();
initJsAutoLoad();
initJsIsolation();
initCssAutoLoad();
