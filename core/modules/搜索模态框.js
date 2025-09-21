// 搜索模态框模块
const searchModalModule = {
    init: function() {
        // console.log('[搜索模态框] 初始化开始');
        
        // 定义初始化函数
        function initSearchModal() {
            // console.log('[搜索模态框] initSearchModal函数被调用');
            
            // 获取模态框相关元素
            const modal = document.getElementById('pfds-searchModal');
            const closeBtn = document.querySelector('.pfds-search-modal-close');
            const searchInput = document.getElementById('pfds-searchInput');
            
            // 检查必要元素是否存在
            if (!modal || !closeBtn || !searchInput) {
                // console.warn('[搜索模态框] 缺少必要的模态框元素');
                return;
            }
            
            // console.log('[搜索模态框] 所有模态框元素已找到');
            
            // 绑定关闭按钮事件
            closeBtn.addEventListener('click', function() {
                // console.log('[搜索模态框] 点击关闭按钮');
                closeModal();
            });
            
            // 绑定模态框背景点击事件
            modal.addEventListener('click', function(e) {
                // console.log('[搜索模态框] 点击模态框背景');
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // 绑定键盘事件
            document.addEventListener('keydown', function(e) {
                // ESC键关闭模态框
                if (e.key === 'Escape' && modal.style.display === 'block') {
                    // console.log('[搜索模态框] 按下ESC键');
                    closeModal();
                }
            });
            
            // console.log('[搜索模态框] 事件监听器绑定完成');
        }
        
        // 打开模态框
        function openModal() {
            // console.log('[搜索模态框] openModal函数被调用');
            const modal = document.getElementById('pfds-searchModal');
            const searchInput = document.getElementById('pfds-searchInput');
            
            if (modal && searchInput) {
                modal.style.display = 'block';
                searchInput.focus();
                // console.log('[搜索模态框] 模态框已打开');
            }
        }
        
        // 关闭模态框
        function closeModal() {
            // console.log('[搜索模态框] closeModal函数被调用');
            const modal = document.getElementById('pfds-searchModal');
            const searchInput = document.getElementById('pfds-searchInput');
            const searchResults = document.getElementById('pfds-searchResults');
            
            if (modal && searchInput && searchResults) {
                modal.style.display = 'none';
                searchInput.value = '';
                searchResults.innerHTML = '';
                // console.log('[搜索模态框] 模态框已关闭');
            }
        }
        
        // 页面加载完成后初始化模态框
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSearchModal);
        } else {
            // 如果文档已经加载完成，则立即执行初始化
            initSearchModal();
        }
        
        // console.log('[搜索模态框] 模块初始化完成');
    }
};