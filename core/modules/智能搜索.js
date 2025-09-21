/**
 * PFDS 全局智能搜索系统
 * 纯前端，无依赖，自动索引，结构感知，范围可控，导航联动
 */

class PFDSGlobalSearch {
    constructor() {
        this.index = [];
        this.currentScope = 'global';
        this.init();
    }

    init() {
        // 构建索引
        this.buildIndex();

        // 绑定事件
        this.bindEvents();
    }

    /**
     * 创建搜索控件容器（在模态框中）
     */
    createSearchContainer() {
        // 在模态框中创建搜索控件
        const modalContent = document.querySelector('.pfds-modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="pfds-search-header">
                    <input type="text" id="pfdsGlobalSearch" placeholder="搜索文档..." class="pfds-search-input-large" />
                </div>
                <div class="pfds-search-body">
                    <div id="pfdsSearchResults" class="pfds-search-results"></div>
                </div>
                <div class="pfds-search-footer">
                    <div class="pfds-search-scope-container">
                        <select id="pfdsSearchScope" class="pfds-search-scope-select">
                            <option value="global">全局</option>
                        </select>
                    </div>
                    <div class="pfds-search-info">
                        搜索提供 PFDS
                    </div>
                </div>
            `;
            
            // 更新搜索范围选项
            this.updateScopeOptions();
        }
    }

    /**
     * 绑定搜索相关事件
     */
    bindEvents() {
        // 绑定模态框内的搜索事件
        const openModal = () => {
            const modal = document.getElementById('pfds-searchModal');
            if (modal) {
                modal.style.display = 'flex';
                this.createSearchContainer();
                
                // 聚焦到搜索输入框
                setTimeout(() => {
                    const searchInput = document.getElementById('pfdsGlobalSearch');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 100);
            }
        };

        // 点击头部搜索区域打开模态框
        const headerSearch = document.getElementById('pfds-headerSearch');
        if (headerSearch) {
            headerSearch.addEventListener('click', openModal);
        }

        // 监听键盘事件，Ctrl+K 打开搜索
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openModal();
            }
        });

        // 动态绑定搜索输入事件（当模态框打开后）
        document.addEventListener('input', (e) => {
            if (e.target && e.target.id === 'pfdsGlobalSearch') {
                this.handleSearchInput(e);
            }
        });

        // 动态绑定范围选择事件
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'pfdsSearchScope') {
                this.handleScopeChange(e);
            }
        });

        // 点击模态框外部关闭
        const modal = document.getElementById('pfds-searchModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    
                    // 关闭移动端侧边栏（如果打开）
                    const sidebar = document.querySelector('.pfds-sidebar');
                    const hamburger = document.querySelector('.pfds-hamburger');
                    const overlay = document.getElementById('pfds-mobileOverlay');
                    
                    if (sidebar && sidebar.classList.contains('show')) {
                        sidebar.classList.remove('show');
                        if (hamburger) {
                            hamburger.classList.remove('active');
                        }
                        if (overlay) {
                            overlay.style.display = 'none';
                        }
                    }
                }
            });
        }
    }

    handleSearchInput(e) {
        // 防抖处理
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            const query = e.target.value.trim();
            if (query) {
                this.performSearch(query, this.currentScope);
            } else {
                this.clearSearchResults();
            }
        }, 300);
    }

    handleScopeChange(e) {
        this.currentScope = e.target.value;
        const searchInput = document.getElementById('pfdsGlobalSearch');
        if (searchInput && searchInput.value.trim()) {
            this.performSearch(searchInput.value.trim(), this.currentScope);
        }
    }

    buildIndex() {
        this.index = []; // 清空索引
        
        document.querySelectorAll('.page-content').forEach(page => {
            const pageId = page.id;
            const navItem = document.querySelector(`.pfds-nav-item a[data-page-id="${pageId}"]`);
            if (!navItem) return;

            const navItemText = navItem.textContent.trim();
            const groupContainer = navItem.closest('.pfds-nav-group');
            const groupName = groupContainer ? groupContainer.querySelector('.pfds-nav-group-toggle').textContent.replace(/[<>]/g, '').trim() : null;
            const pageTitle = page.querySelector('h1')?.textContent.trim() || navItemText;

            // 提取页面内结构化内容（按标题层级）
            const contentTree = this.extractContentTree(page);

            this.index.push({
                pageId,
                pageTitle,
                navItemText,
                navGroupName: groupName,
                isInGroup: !!groupContainer,
                groupElement: groupContainer,
                navElement: navItem,
                pageElement: page,
                contentTree,
                navMatch: false, // 将在搜索时动态标记
                contentMatches: contentTree.length
            });
        });
    }

    extractContentTree(page) {
        const tree = [];
        let currentPath = [];

        // 按顺序遍历所有块级元素
        const elements = page.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote, td');
        elements.forEach(el => {
            const level = el.tagName.startsWith('H') ? parseInt(el.tagName[1]) : 999;
            
            // 更新标题路径
            if (level < 999) {
                currentPath = currentPath.slice(0, level - 1);
                currentPath.push(el.textContent.trim());
            }

            // 索引所有有文本的元素（包括标题）
            if (el.textContent.trim()) {
                tree.push({
                    titlePath: [...currentPath], // 深拷贝
                    text: el.textContent.trim(),
                    element: el,
                    snippet: this.getSnippet(el, 100)
                });
            }
        });

        return tree;
    }

    getSnippet(element, maxLength = 100) {
        let text = element.textContent.trim();
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    updateScopeOptions() {
        const scopeSelect = document.getElementById('pfdsSearchScope');
        if (!scopeSelect) return;

        // 清空现有选项
        scopeSelect.innerHTML = '';

        // 添加全局选项
        const globalOption = document.createElement('option');
        globalOption.value = 'global';
        globalOption.textContent = '全局';
        scopeSelect.appendChild(globalOption);

        // 获取当前激活的页面
        const activePage = document.querySelector('.page-content.active');
        if (!activePage) return;

        const activePageId = activePage.id;
        const activeItem = this.index.find(item => item.pageId === activePageId);
        
        // 如果当前页面属于某个分组，添加"本组"选项
        if (activeItem && activeItem.navGroupName) {
            const groupOption = document.createElement('option');
            groupOption.value = 'group';
            groupOption.textContent = '本组';
            scopeSelect.appendChild(groupOption);
        }

        // 添加"本页"选项
        const currentPageOption = document.createElement('option');
        currentPageOption.value = 'current';
        currentPageOption.textContent = '本页';
        scopeSelect.appendChild(currentPageOption);

        // 设置当前范围
        scopeSelect.value = this.currentScope;
    }

    performSearch(query, scope) {
        if (!query) return;

        let allResults = [];

        // 1. 搜索导航项匹配（高优先级）
        const navMatches = this.index.filter(item => 
            item.navItemText.toLowerCase().includes(query.toLowerCase()) ||
            (item.navGroupName && item.navGroupName.toLowerCase().includes(query.toLowerCase()))
        ).map(item => ({
            ...item,
            type: 'nav',
            matchText: item.navItemText,
            score: 100 // 高权重
        }));

        // 2. 搜索内容匹配
        const contentMatches = this.index.flatMap(item => {
            const pageMatches = item.contentTree.filter(ct => 
                ct.text.toLowerCase().includes(query.toLowerCase())
            ).map(ct => ({
                ...item,
                type: 'content',
                matchText: ct.text,
                snippet: ct.snippet,
                element: ct.element,
                titlePath: ct.titlePath,
                score: ct.titlePath.length === 1 ? 50 : 30 // h1权重高
            }));
            // 移除限制，显示所有匹配结果
            return pageMatches;
        });

        allResults = [...navMatches, ...contentMatches];

        // 3. 按范围过滤
        switch (scope) {
            case 'group':
                const activePageId = document.querySelector('.page-content.active')?.id;
                const activeGroup = this.index.find(i => i.pageId === activePageId)?.navGroupName;
                if (activeGroup) {
                    allResults = allResults.filter(r => r.navGroupName === activeGroup);
                }
                break;
            case 'current':
                const currentPageId = document.querySelector('.page-content.active')?.id;
                allResults = allResults.filter(r => r.pageId === currentPageId);
                break;
        }

        // 4. 按得分排序
        allResults.sort((a, b) => b.score - a.score);

        // 5. 去重（同一页面只保留最高分一条 + 内容聚合）
        const seenPages = new Set();
        const finalResults = [];
        allResults.forEach(result => {
            if (result.type === 'nav') {
                finalResults.push(result);
            } else {
                if (!seenPages.has(result.pageId)) {
                    seenPages.add(result.pageId);
                    // 聚合该页所有匹配
                    const pageMatches = allResults.filter(r => r.pageId === result.pageId && r.type === 'content');
                    result.aggregated = pageMatches;
                    finalResults.push(result);
                }
            }
        });

        // 6. 渲染
        this.renderResults(finalResults, query);
    }

    renderResults(results, query) {
        const container = document.getElementById('pfdsSearchResults');
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div class="pfds-search-empty">未找到匹配结果</div>';
            container.classList.add('active');
            return;
        }

        // 分组渲染
        let hasNav = results.some(r => r.type === 'nav');
        let hasContent = results.some(r => r.type === 'content');

        if (hasNav) {
            const sec = document.createElement('div');
            sec.className = 'pfds-search-section';
            sec.textContent = '导航匹配';
            container.appendChild(sec);

            results.filter(r => r.type === 'nav').forEach(result => {
                const item = this.createResultItem(result, query);
                container.appendChild(item);
            });
        }

        if (hasContent) {
            const sec = document.createElement('div');
            sec.className = 'pfds-search-section';
            sec.textContent = '内容匹配';
            container.appendChild(sec);

            results.filter(r => r.type === 'content').forEach(result => {
                if (result.aggregated) {
                    // 聚合展示
                    const mainItem = this.createResultItem(result, query);
                    container.appendChild(mainItem);

                    // 展开子项（可选：点击展开）
                    const subList = document.createElement('div');
                    subList.style.paddingLeft = '20px';
                    subList.style.fontSize = '13px';
                    result.aggregated.slice(1).forEach(sub => {
                        const subItem = this.createResultItem(sub, query, true);
                        subList.appendChild(subItem);
                    });
                    if (result.aggregated.length > 1) {
                        const toggle = document.createElement('div');
                        toggle.className = 'pfds-search-toggle';
                        toggle.textContent = `+${result.aggregated.length - 1} 处匹配`;
                        toggle.onclick = (e) => {
                            e.stopPropagation();
                            if (subList.style.display === 'none') {
                                subList.style.display = 'block';
                                toggle.textContent = '收起';
                            } else {
                                subList.style.display = 'none';
                                toggle.textContent = `+${result.aggregated.length - 1} 处匹配`;
                            }
                        };
                        mainItem.appendChild(toggle);
                    }
                    mainItem.appendChild(subList);
                    subList.style.display = 'none';
                } else {
                    const item = this.createResultItem(result, query);
                    container.appendChild(item);
                }
            });
        }

        container.classList.add('active');
    }

    createResultItem(result, query, isSubItem = false) {
        const item = document.createElement('div');
        item.className = isSubItem ? 'pfds-search-subitem' : 'pfds-search-item';
        
        // 高亮匹配文本
        const highlightText = (text) => {
            if (!query) return text;
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\$]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<em>$1</em>');
        };

        let titlePath = '';
        if (result.titlePath && result.titlePath.length > 0) {
            titlePath = result.titlePath.join(' > ');
        } else if (result.navGroupName) {
            titlePath = `${result.navGroupName} > ${result.navItemText}`;
        } else {
            titlePath = result.pageTitle || result.navItemText;
        }

        const pathDiv = document.createElement('div');
        pathDiv.className = 'pfds-search-path';
        pathDiv.innerHTML = highlightText(titlePath);

        let contentDiv;
        if (result.snippet) {
            contentDiv = document.createElement('div');
            contentDiv.className = 'pfds-search-content';
            contentDiv.innerHTML = highlightText(result.snippet);
        }

        item.appendChild(pathDiv);
        if (contentDiv) item.appendChild(contentDiv);

        // 点击事件
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 关闭搜索模态框
            const modal = document.getElementById('pfds-searchModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // 切换页面
            if (typeof window.pfdsShowPage === 'function') {
                window.pfdsShowPage(result.pageId);
            }
            
            // 滚动到元素
            if (result.element) {
                setTimeout(() => {
                    result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 高亮元素
                    result.element.classList.add('pfds-highlight');
                    setTimeout(() => {
                        result.element.classList.remove('pfds-highlight');
                    }, 3000);
                }, 300);
            }
        });

        return item;
    }

    clearSearchResults() {
        const container = document.getElementById('pfdsSearchResults');
        if (container) {
            container.innerHTML = '';
            container.classList.remove('active');
        }
    }

    // 公共方法，供外部调用
    static getInstance() {
        if (!PFDSGlobalSearch.instance) {
            PFDSGlobalSearch.instance = new PFDSGlobalSearch();
        }
        return PFDSGlobalSearch.instance;
    }
}

// 智能搜索模块
const smartSearchModule = {
    init: function() {
        // console.log('[智能搜索] 初始化开始');
        
        // 定义初始化函数
        function initSmartSearch() {
            // console.log('[智能搜索] initSmartSearch函数被调用');
            
            // 获取搜索输入框
            const searchInput = document.getElementById('pfds-searchInput');
            if (!searchInput) {
                // console.warn('[智能搜索] 缺少搜索输入框元素');
                return;
            }
            
            // console.log('[智能搜索] 搜索输入框已找到');
            
            // 绑定输入事件
            searchInput.addEventListener('input', function() {
                // console.log('[智能搜索] 搜索输入变化');
                handleSearchInput(this.value);
            });
            
            // console.log('[智能搜索] 事件监听器绑定完成');
        }
        
        // 处理搜索输入
        function handleSearchInput(query) {
            // console.log('[智能搜索] handleSearchInput函数被调用，查询:', query);
            
            // 清空现有搜索结果
            clearSearchResults();
            
            // 如果查询为空，直接返回
            if (!query.trim()) {
                return;
            }
            
            // 执行智能搜索
            performSmartSearch(query);
        }
        
        // 清空搜索结果
        function clearSearchResults() {
            // console.log('[智能搜索] clearSearchResults函数被调用');
            const searchResults = document.getElementById('pfds-searchResults');
            if (searchResults) {
                searchResults.innerHTML = '';
            }
        }
        
        // 执行智能搜索
        function performSmartSearch(query) {
            // console.log('[智能搜索] performSmartSearch函数被调用，查询:', query);
            
            // 这里应该实现实际的智能搜索逻辑
            // 目前我们只是模拟搜索结果
            simulateSmartSearch(query);
        }
        
        // 模拟智能搜索（实际项目中应替换为真实搜索逻辑）
        function simulateSmartSearch(query) {
            // console.log('[智能搜索] simulateSmartSearch函数被调用，查询:', query);
            
            // 模拟搜索延迟
            setTimeout(() => {
                const searchResults = document.getElementById('pfds-searchResults');
                if (!searchResults) return;
                
                // 模拟搜索结果
                const mockResults = [
                    { title: '智能搜索结果1', content: '这是与"' + query + '"相关的智能搜索结果1' },
                    { title: '智能搜索结果2', content: '这是与"' + query + '"相关的智能搜索结果2' },
                    { title: '智能搜索结果3', content: '这是与"' + query + '"相关的智能搜索结果3' }
                ];
                
                // 生成搜索结果HTML
                let resultsHTML = '';
                mockResults.forEach(result => {
                    resultsHTML += `
                        <div class="pfds-search-result-item">
                            <h3 class="pfds-search-result-title">${result.title}</h3>
                            <p class="pfds-search-result-content">${result.content}</p>
                        </div>
                    `;
                });
                
                searchResults.innerHTML = resultsHTML;
                // console.log('[智能搜索] 搜索结果已更新');
            }, 300); // 模拟网络延迟
        }
        
        // 页面加载完成后初始化智能搜索
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSmartSearch);
        } else {
            // 如果文档已经加载完成，则立即执行初始化
            initSmartSearch();
        }
        
        // console.log('[智能搜索] 模块初始化完成');
    }
};

// 模块导出
const searchModule = {
    PFDSGlobalSearch,
    init: function() {
        // 初始化全局搜索实例
        PFDSGlobalSearch.getInstance();
    }
};

return searchModule;