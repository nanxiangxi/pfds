let originalContent = [];

export function initSearch() {
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

                    // 如果标题是"未知标题"，但元素没有 id，则跳过此结果
                    if (!closestHeading && !item.element.id) {
                        return;
                    }

                    results.push({
                        title: closestHeading?.innerText || '未知标题',
                        summary,
                        element: item.element,
                        pageId: item.pageId,
                        pageTitle: findPageTitle(item.pageId) // 添加页面标题
                    });
                }
            }
        });

        window.resultsCache = results; // 缓存供点击跳转使用
        modalContent.innerHTML = '';

        if (results.length > 0) {
            // 按页面分组结果
            const groupedResults = groupResultsByPage(results);
            
            let groupedHTML = `<h3>找到 ${results.length} 个结果</h3>`;
            
            // 为每个页面生成结果卡片
            for (const [pageId, pageResults] of Object.entries(groupedResults)) {
                const pageTitle = pageResults[0].pageTitle || '未知页面';
                groupedHTML += `
                <div class="search-page-group">
                    <div class="search-page-title">${pageTitle}</div>
                `;
                
                pageResults.forEach((result, index) => {
                    groupedHTML += `
                    <div class="search-card" onclick="handleSearchResult('${result.pageId}', ${results.indexOf(result)})">
                        <div class="search-result-title">${result.title}</div>
                        <div class="search-result-summary">${result.summary}</div>
                    </div>
                `;
                });
                
                groupedHTML += `</div>`;
            }
            
            modalContent.innerHTML = groupedHTML;
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

// 按页面ID对搜索结果进行分组
function groupResultsByPage(results) {
    const grouped = {};
    
    results.forEach(result => {
        if (!grouped[result.pageId]) {
            grouped[result.pageId] = [];
        }
        grouped[result.pageId].push(result);
    });
    
    // 对每个分组内的结果按标题排序
    for (const pageId in grouped) {
        grouped[pageId].sort((a, b) => a.title.localeCompare(b.title));
    }
    
    return grouped;
}

// 根据页面ID查找页面标题
function findPageTitle(pageId) {
    const pageElement = document.getElementById(pageId);
    if (!pageElement) return '未知页面';
    
    // 尝试从页面的第一个标题元素获取标题
    const firstHeading = pageElement.querySelector('h1, h2, h3, h4, h5, h6');
    if (firstHeading) {
        return firstHeading.textContent.trim();
    }
    
    // 如果找不到标题元素，则尝试从导航链接获取
    const navLink = document.querySelector(`#nav-${pageId}`);
    if (navLink) {
        return navLink.textContent.trim();
    }
    
    return '未知页面';
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