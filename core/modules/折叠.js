// 折叠模块
const collapseModule = {
    init: function() {
        // 定义折叠块切换函数并确保它被挂载到window对象上
        this.defineToggleFunction();
        
        // 页面加载完成后初始化所有折叠块
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this.initCollapseBlocks.bind(this));
        } else {
            this.initCollapseBlocks();
        }
    },
    
    /**
     * 定义折叠块切换函数
     */
    defineToggleFunction: function() {
        // 折叠块切换功能
        window.toggleCollapseBlock = function(id) {
            const content = document.getElementById(id);
            const header = content ? content.previousElementSibling : null;
            const toggle = header ? header.querySelector('.pmd-collapse-toggle i') : null;
            
            if (content && toggle) {
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    // 修改图标旋转方向为向下
                    toggle.style.transform = 'rotate(90deg)';
                } else {
                    content.style.display = 'none';
                    // 恢复原始状态
                    toggle.style.transform = 'rotate(0deg)';
                }
            }
        };
    },
    
    /**
     * 初始化折叠块状态
     */
    initCollapseBlocks: function() {
        // 确保所有折叠块初始状态为关闭
        const collapseBlocks = document.querySelectorAll('.pmd-collapse-content');
        collapseBlocks.forEach(block => {
            block.style.display = 'none';
        });
        
        // 设置图标初始状态
        const collapseToggles = document.querySelectorAll('.pmd-collapse-toggle i');
        collapseToggles.forEach(toggle => {
            toggle.style.transition = 'transform 0.3s ease';
        });
    }
};

return collapseModule;