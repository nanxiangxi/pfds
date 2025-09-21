/**
 * 搜索模块
 * 实现搜索功能，包括模态框和搜索逻辑
 */

// 模块导出
const searchModule = {
    init: function() {
        // console.log('[搜索模块] 开始初始化');
        
        // 保持向后兼容性
        window.pfdsOpenSearchModal = function() {
            // console.log('[搜索模块] 打开搜索模态框');
            const modal = document.getElementById('pfds-searchModal');
            
            // 关闭移动端侧边栏
            const sidebar = document.querySelector('.pfds-sidebar');
            const hamburger = document.querySelector('.pfds-hamburger');
            const overlay = document.getElementById('pfds-mobileOverlay');
            
            if (sidebar && sidebar.classList.contains('show')) {
                // console.log('[搜索模块] 关闭移动端侧边栏');
                sidebar.classList.remove('show');
                if (hamburger) {
                    hamburger.classList.remove('active');
                }
                if (overlay) {
                    overlay.style.display = 'none';
                }
            }
            
            if (modal) {
                modal.style.display = 'flex';
                // console.log('[搜索模块] 搜索模态框显示');
                
                // 聚焦到搜索输入框
                setTimeout(() => {
                    const searchInput = document.getElementById('pfdsGlobalSearch');
                    if (searchInput) {
                        searchInput.focus();
                        searchInput.select();
                        // console.log('[搜索模块] 已聚焦到现有搜索输入框');
                    } else {
                        // console.warn('[搜索模块] 搜索输入框未找到，尝试创建');
                        // 如果模态框中的搜索输入框不存在，则创建它
                        const globalSearch = window.PFDSModules?.get('智能搜索')?.PFDSGlobalSearch?.getInstance();
                        if (globalSearch && typeof globalSearch.createSearchContainer === 'function') {
                            // console.log('[搜索模块] 创建搜索容器');
                            globalSearch.createSearchContainer();
                            
                            // 再次尝试聚焦
                            setTimeout(() => {
                                const newSearchInput = document.getElementById('pfdsGlobalSearch');
                                if (newSearchInput) {
                                    newSearchInput.focus();
                                    newSearchInput.select();
                                    // console.log('[搜索模块] 已聚焦到新创建的搜索输入框');
                                } else {
                                    // console.error('[搜索模块] 无法聚焦到搜索输入框，元素仍不存在');
                                }
                            }, 100);
                        } else {
                            // console.error('[搜索模块] 无法创建搜索容器：全局搜索实例或方法不存在');
                        }
                    }
                }, 100);
            } else {
                // console.error('[搜索模块] 未找到搜索模态框元素');
            }
        };
        
        // 点击头部搜索区域打开模态框
        function bindSearchEvents() {
            // console.log('[搜索模块] 开始绑定搜索事件');
            
            const headerSearch = document.getElementById('pfds-headerSearch');
            if (headerSearch) {
                // console.log('[搜索模块] 找到头部搜索按钮');
                // 先移除可能已存在的事件监听器，防止重复绑定
                headerSearch.removeEventListener('click', window.pfdsOpenSearchModal);
                headerSearch.addEventListener('click', window.pfdsOpenSearchModal);
                // console.log('[搜索模块] 头部搜索按钮事件绑定完成');
            } else {
                // console.warn('[搜索模块] 未找到头部搜索按钮');
            }
            
            // 点击移动端侧边栏搜索区域打开模态框
            const mobileSearch = document.getElementById('pfds-mobileSearch');
            if (mobileSearch) {
                // console.log('[搜索模块] 找到移动端搜索按钮');
                // 先移除可能已存在的事件监听器，防止重复绑定
                mobileSearch.removeEventListener('click', window.pfdsOpenSearchModal);
                mobileSearch.addEventListener('click', window.pfdsOpenSearchModal);
                // console.log('[搜索模块] 移动端搜索按钮事件绑定完成');
            } else {
                // console.warn('[搜索模块] 未找到移动端搜索按钮');
            }
        }
        
        // 页面加载完成后绑定搜索事件
        if (document.readyState === 'loading') {
            // console.log('[搜索模块] 页面仍在加载，等待DOM内容加载完成');
            document.addEventListener('DOMContentLoaded', () => {
                // console.log('[搜索模块] DOM内容已加载，开始绑定搜索事件');
                bindSearchEvents();
            });
        } else {
            // DOM已经加载完成
            // console.log('[搜索模块] DOM已加载完成，立即绑定搜索事件');
            bindSearchEvents();
        }
        
        // 监听键盘事件，Ctrl+K 打开搜索
        document.addEventListener('keydown', function(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                // console.log('[搜索模块] 检测到Ctrl+K快捷键');
                e.preventDefault();
                window.pfdsOpenSearchModal();
            }
        });
        // console.log('[搜索模块] 已绑定Ctrl+K快捷键');
        
        // 监听页面切换事件，更新搜索范围选项
        document.addEventListener('pfdsPageChanged', () => {
            // console.log('[搜索模块] 检测到页面切换事件');
            // 延迟执行以确保页面切换完成
            setTimeout(() => {
                // console.log('[搜索模块] 页面切换完成，尝试更新搜索范围选项');
                const globalSearch = window.PFDSModules?.get('智能搜索')?.PFDSGlobalSearch?.getInstance();
                if (globalSearch && typeof globalSearch.updateScopeOptions === 'function') {
                    globalSearch.updateScopeOptions();
                    // console.log('[搜索模块] 搜索范围选项已更新');
                } else {
                    // console.warn('[搜索模块] 无法更新搜索范围选项：全局搜索实例或方法不存在');
                }
            }, 100);
        });
        // console.log('[搜索模块] 已绑定页面切换事件监听器');
        
        // console.log('[搜索模块] 初始化完成');
    }
};

return searchModule;