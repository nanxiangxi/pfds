// 页面导航模块
// 处理页面内锚点导航和页面间导航功能

const pageNavigationModule = {
    init: function() {
        // console.log('[页面导航] 模块初始化开始');
        
        // 全局存储导航组的展开状态
        const navGroupStates = new Map();
        
        // 滚动到指定锚点
        window.pfdsScrollToAnchor = function(anchor) {
            // console.log('[页面导航] pfdsScrollToAnchor 开始执行，锚点:', anchor);
            
            // 处理空锚点的情况
            if (!anchor) {
                // console.warn('[页面导航] 锚点为空，不执行滚动');
                return;
            }
            
            const target = document.getElementById(anchor);
            if (target) {
                // console.log('[页面导航] 找到目标元素:', target);
                // console.log('[页面导航] 目标元素位置:', target.getBoundingClientRect());
                
                // 获取内容主区域
                const contentMain = document.querySelector('.pfds-content-main');
                if (contentMain) {
                    // console.log('[页面导航] 找到内容主区域');
                    // 获取当前激活的页面
                    const activePage = document.querySelector('.page-content.active');
                    if (activePage) {
                        // console.log('[页面导航] 找到激活页面');
                        // 计算最大滚动位置
                        const maxScrollTop = Math.max(0, activePage.scrollHeight - contentMain.clientHeight);
                        // console.log('[页面导航] 最大滚动位置:', maxScrollTop);
                        // console.log('[页面导航] 页面总高度:', activePage.scrollHeight);
                        // console.log('[页面导航] 可视区域高度:', contentMain.clientHeight);
                        
                        // 获取目标元素相对于内容主区域的位置
                        const targetRect = target.getBoundingClientRect();
                        const contentRect = contentMain.getBoundingClientRect();
                        const targetTop = targetRect.top - contentRect.top + contentMain.scrollTop;
                        // console.log('[页面导航] 目标元素顶部位置:', targetTop);
                        
                        // 限制目标位置不超过最大滚动位置
                        const limitedTargetTop = Math.max(0, Math.min(targetTop, maxScrollTop));
                        // console.log('[页面导航] 限制后的位置:', limitedTargetTop);
                        
                        // 执行滚动
                        contentMain.scrollTo({
                            top: limitedTargetTop - 20, // 留出一些顶部空间
                            behavior: 'smooth'
                        });
                        // console.log('[页面导航] 已执行滚动到目标位置');
                    } else {
                        // console.log('[页面导航] 未找到激活页面，使用默认滚动');
                        // 即使找不到激活页面，也要限制滚动范围
                        const contentMain = document.querySelector('.pfds-content-main');
                        if (contentMain) {
                            contentMain.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }
                } else {
                    // console.log('[页面导航] 未找到内容主区域，使用默认滚动');
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                
                // 触发自定义事件，通知其他模块锚点已滚动
                const event = new CustomEvent('anchorScrolled', { detail: { anchor: anchor } });
                window.dispatchEvent(event);
                // console.log('[页面导航] 已触发anchorScrolled事件');
            } else {
                // console.warn('[页面导航] 未找到锚点元素:', anchor);
            }
        };

        // console.log('[页面导航] pfdsScrollToAnchor已挂载到window对象');

        window.pfdsShowPage = function(id) {
            // console.log('[页面导航] pfdsShowPage 开始执行，页面ID:', id);

            // 隐藏所有页面内容
            const allPages = document.querySelectorAll('.page-content');
            // console.log('[页面导航] 找到页面数量:', allPages.length);
            allPages.forEach(page => {
                page.classList.remove('active');
                // console.log('[页面导航] 隐藏页面:', page.id);
            });

            // 显示当前页面
            const targetPage = document.getElementById(id);
            // console.log('[页面导航] 目标页面元素:', targetPage);
            if (targetPage) {
                targetPage.classList.add('active');
                // console.log('[页面导航] 激活页面:', id);
            } else {
                // console.warn('[页面导航] 未找到目标页面:', id);
            }

            // 更新高亮状态
            const navLinks = document.querySelectorAll('.pfds-nav a');
            // console.log('[页面导航] 导航链接数量:', navLinks.length);
            navLinks.forEach(navLink => {
                navLink.classList.remove('pfds-active');
                // console.log('[页面导航] 移除导航链接激活状态:', navLink.id);
            });

            // 使用多种选择器尝试找到当前导航链接
            const currentNavLink = document.querySelector(`.pfds-nav a[data-page-id='${id}']`) || 
                                 document.querySelector(`.pfds-nav a[href*='${id}']`) ||
                                 document.getElementById(`pfds-nav-${id}`);
            // console.log('[页面导航] 当前导航链接元素:', currentNavLink);
            if (currentNavLink) {
                currentNavLink.classList.add('pfds-active');
                // console.log('[页面导航] 激活导航链接:', id);
            } else {
                // console.warn('[页面导航] 未找到当前导航链接:', id);
            }

            // 展开并高亮父级分组（统一处理）
            requestAnimationFrame(() => {
                setTimeout(() => {
                    expandNavGroupByPageId(id);
                }, 20);
            });

            // 滚动到页面顶部，确保不超过内容范围
            const contentMain = document.querySelector('.pfds-content-main');
            if (contentMain) {
                // console.log('[页面导航] 开始滚动到页面顶部');
                // 获取当前激活的页面
                const activePage = document.querySelector('.page-content.active');
                if (activePage) {
                    // 计算最大滚动位置
                    const maxScrollTop = Math.max(0, activePage.scrollHeight - contentMain.clientHeight);
                    // console.log('[页面导航] 最大滚动位置:', maxScrollTop);
                    contentMain.scrollTo({ top: Math.min(0, maxScrollTop), behavior: 'smooth' });
                } else {
                    contentMain.scrollTo({ top: 0, behavior: 'smooth' });
                }
                // console.log('[页面导航] 已执行滚动到页面顶部');
            }

            const event = new CustomEvent('showPage', { detail: { pageId: id } });
            window.dispatchEvent(event);
            // console.log('[页面导航] 已触发showPage事件');

            // console.log('[页面导航] 页面切换完成:', id);
        };

        /**
         * 根据页面ID展开对应的导航组并高亮
         * @param {string} pageId - 页面ID
         */
        function expandNavGroupByPageId(pageId) {
            // console.log('[页面导航] expandNavGroupByPageId 开始执行，页面ID:', pageId);
            // 使用多种选择器尝试找到当前链接
            const currentLink = document.querySelector(`.pfds-nav a[data-page-id='${pageId}']`) ||
                               document.querySelector(`.pfds-nav a[href*='${pageId}']`) ||
                               document.getElementById(`pfds-nav-${pageId}`);
            if (!currentLink) {
                // console.warn('[页面导航] 未找到当前链接');
                return;
            }

            const parentLi = currentLink.closest('li')?.parentElement?.closest('li');
            if (!parentLi) {
                // console.warn('[页面导航] 未找到父级元素');
                return;
            }

            const toggle = parentLi.querySelector('.pfds-nav-group-toggle');
            const content = parentLi.querySelector('.pfds-nav-group-content');
            const icon = toggle ? toggle.querySelector('.pfds-toggle-icon') : null;

            if (!toggle || !content) {
                // console.warn('[页面导航] 缺少必要元素');
                return;
            }

            // 展开分组
            toggle.classList.add('pfds-active');
            content.classList.add('pfds-active');
            content.style.maxHeight = content.scrollHeight + 'px';
            if (icon) {
                icon.classList.add('pfds-active');
            }
            
            // 更新全局状态
            if (toggle._pfdsGroupId) {
                navGroupStates.set(toggle._pfdsGroupId, true);
            }
            
            // console.log('[页面导航] 分组已展开');
        }

        // 定义初始化函数
        function initNavigation() {
            // console.log('[页面导航] 初始化函数开始执行');
            const toggles = document.querySelectorAll('.pfds-nav .pfds-nav-group-toggle');
            // console.log('[页面导航] 找到切换按钮数量:', toggles.length);
            
            if (toggles.length === 0) {
                // console.log('[页面导航] 未找到任何导航组切换按钮');
                return;
            }

            // 获取第一个非分组项
            function getFirstNonGroupLink() {
                console.log('[页面导航] 获取第一个非分组链接');
                const links = document.querySelectorAll('.pfds-nav > li > a[data-page-id]');
                for (let link of links) {
                    if (!link.classList.contains('pfds-nav-group-toggle')) {
                        console.log('[页面导航] 找到第一个非分组链接:', link.getAttribute('data-page-id'));
                        return link;
                    }
                }
                console.log('[页面导航] 未找到非分组链接');
                return null;
            }

            // 获取第一个分组下的第一个子项
            function getFirstGroupSubLink() {
                console.log('[页面导航] 获取第一个分组子链接');
                const firstGroup = document.querySelector('.pfds-nav .pfds-nav-group-toggle');
                if (!firstGroup) {
                    console.log('[页面导航] 未找到分组');
                    return null;
                }

                const firstSubLink = firstGroup.closest('li')?.querySelector('.pfds-nav-group-content a[data-page-id]');
                console.log('[页面导航] 第一个分组子链接:', firstSubLink ? firstSubLink.getAttribute('data-page-id') : '无');
                return firstSubLink || null;
            }

            function openDefaultPage() {
                console.log('[页面导航] 打开默认页面');
                let defaultLink = getFirstNonGroupLink();

                if (!defaultLink) {
                    defaultLink = getFirstGroupSubLink();
                }

                if (defaultLink) {
                    const pageId = defaultLink.getAttribute('data-page-id');
                    console.log('[页面导航] 默认页面ID:', pageId);

                    // 显示页面 + 高亮 + 展开
                    window.pfdsShowPage(pageId);

                    // 延迟展开父级分组
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            expandNavGroupByPageId(pageId);
                        }, 20);
                    });
                } else {
                    console.warn('[页面导航] 未找到默认页面');
                }
            }

            // 点击展开/收起分组
            toggles.forEach((toggle, index) => {
                // console.log('[页面导航] 为切换按钮添加点击事件，索引:', index);
                
                // 为每个切换按钮分配唯一标识
                const groupId = `nav-group-${index}`;
                toggle._pfdsGroupId = groupId;
                
                toggle.addEventListener('click', function (e) {
                    // console.log('[页面导航] 点击切换按钮，索引:', index, '组ID:', groupId);
                    e.preventDefault();
                    // console.log('[页面导航] 阻止默认行为');
                    
                    const parentLi = this.closest('li');
                    // console.log('[页面导航] 父级li元素:', parentLi);
                    
                    const content = parentLi.querySelector('.pfds-nav-group-content');
                    // console.log('[页面导航] 内容元素:', content);
                    
                    const icon = this.querySelector('.pfds-toggle-icon');
                    // console.log('[页面导航] 图标元素:', icon);

                    if (!content) {
                        // console.warn('[页面导航] 未找到内容元素');
                        return;
                    }

                    // 获取当前组的展开状态（默认为false，即收起状态）
                    const isExpanded = navGroupStates.get(groupId) || false;
                    // console.log('[页面导航] 当前状态 - 是否展开:', isExpanded);

                    if (isExpanded) {
                        // console.log('[页面导航] 收起分组');
                        this.classList.remove('pfds-active');
                        content.classList.remove('pfds-active');
                        content.style.maxHeight = '0';
                        if (icon) {
                            // console.log('[页面导航] 移除图标激活状态');
                            icon.classList.remove('pfds-active');
                        }
                        // 更新状态为收起
                        navGroupStates.set(groupId, false);
                    } else {
                        // console.log('[页面导航] 展开分组');
                        this.classList.add('pfds-active');
                        content.classList.add('pfds-active');
                        content.style.maxHeight = content.scrollHeight + 'px';
                        // console.log('[页面导航] 设置最大高度为:', content.scrollHeight);
                        if (icon) {
                            // console.log('[页面导航] 添加图标激活状态');
                            icon.classList.add('pfds-active');
                        }
                        // 更新状态为展开
                        navGroupStates.set(groupId, true);
                    }
                });
            });

            // 页面加载时根据当前页面 ID 展开对应分组
            const currentPageId = document.querySelector('.pfds-content-main .page-content.active')?.id;
            // console.log('[页面导航] 当前页面ID:', currentPageId);

            if (currentPageId) {
                window.pfdsShowPage(currentPageId);
            } else {
                openDefaultPage();
            }
        }

        // 页面加载完成后初始化导航
        if (document.readyState === 'loading') {
            // console.log('[页面导航] DOM正在加载中，等待DOMContentLoaded事件');
            document.addEventListener('DOMContentLoaded', initNavigation);
        } else {
            // DOM已经加载完成，直接初始化
            // console.log('[页面导航] DOM已经加载完成，直接初始化');
            initNavigation();
        }

        // 处理页面内锚点链接点击
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const anchor = link.getAttribute('href').substring(1);
                // console.log('[页面导航] 点击锚点链接:', anchor);
                
                // 只有当锚点不为空时才执行滚动
                if (anchor) {
                    const targetElement = document.getElementById(anchor);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
            
            // 处理页面链接点击（排除导航组切换按钮）
            const link2 = e.target.closest('.pfds-nav a[data-page-id]');
            if (link2 && !link2.classList.contains('pfds-nav-group-toggle')) {
                e.preventDefault();
                const pageId = link2.getAttribute('data-page-id');
                // console.log('[页面导航] 点击页面链接:', pageId);
                window.pfdsShowPage(pageId);
            }
        });

        // console.log('[页面导航] 模块初始化完成');
    }
};

return pageNavigationModule;