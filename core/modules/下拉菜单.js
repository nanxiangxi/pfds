// 下拉菜单模块
const dropdownMenuModule = {
    init: function() {
       // console.log('[下拉菜单] 模块初始化开始');
        
        // 定义初始化函数
        function initDropdowns() {
           // console.log('[下拉菜单] 初始化函数开始执行');
            // 处理头部下拉菜单
            const headerDropdowns = document.querySelectorAll('.pfds-header-dropdown');
          //  console.log('[下拉菜单] 找到下拉菜单数量:', headerDropdowns.length);
            headerDropdowns.forEach(dropdown => {
                const title = dropdown.querySelector('.pfds-header-dropdown-title');
                const content = dropdown.querySelector('.pfds-header-dropdown-content');
                
                if (title && content) {
                  //  console.log('[下拉菜单] 找到标题和内容元素');
                    // 点击标题切换显示/隐藏
                    title.addEventListener('click', function(e) {
                        e.stopPropagation();
                        e.preventDefault();
                     //   console.log('[下拉菜单] 点击标题');
                        
                        // 检查当前是否显示
                        const isVisible = content.style.display === 'block';
                       // console.log('[下拉菜单] 当前显示状态:', isVisible);
                        
                        // 首先隐藏所有下拉菜单
                        closeAllDropdowns();
                        
                        // 如果之前是隐藏的，则显示当前菜单
                        if (!isVisible) {
                            content.style.display = 'block';
                            //console.log('[下拉菜单] 显示内容');
                        }
                    });
                    
                    // 添加悬停功能
                    let closeTimeout;
                    
                    // 监听整个下拉菜单区域的鼠标移动
                    dropdown.addEventListener('mousemove', function() {
                        clearTimeout(closeTimeout);
                    });
                    
                    // 监听下拉内容区域的鼠标移动
                    content.addEventListener('mousemove', function() {
                        clearTimeout(closeTimeout);
                    });
                    
                    // 鼠标离开下拉菜单区域时延迟关闭
                    dropdown.addEventListener('mouseleave', function() {
                        closeTimeout = setTimeout(() => {
                            content.style.display = 'none';
                           // console.log('[下拉菜单] 延迟关闭内容');
                        }, 300);
                    });
                }
            });
            
            // 处理多语言切换下拉菜单
            const multilingual = document.querySelector('.pfds-multilingual');
            if (multilingual) {
               // console.log('[下拉菜单] 找到多语言切换元素');
                const toggle = multilingual.querySelector('.pfds-multilingual-toggle');
                const dropdown = multilingual.querySelector('.pfds-multilingual-dropdown');
                
                if (toggle && dropdown) {
                    //console.log('[下拉菜单] 找到切换按钮和下拉菜单');
                    let closeTimeout;  // 定义closeTimeout变量
                    
                    // 点击切换显示/隐藏
                    toggle.addEventListener('click', function(e) {
                        e.stopPropagation();
                        //console.log('[下拉菜单] 点击多语言切换按钮');
                        
                        // 注意：多语言切换功能由元素多语言模块专门处理
                        // 这里仅需要关闭其他下拉菜单，不处理多语言下拉菜单的显示/隐藏
                        const allDropdowns = document.querySelectorAll('.pfds-header-dropdown-content');
                        allDropdowns.forEach(dropdownEl => {
                            if (dropdownEl !== dropdown) {  // 不关闭多语言下拉菜单
                                dropdownEl.style.display = 'none';
                            }
                        });
                    });
                    
                    // 监听下拉内容区域的鼠标移动
                    dropdown.addEventListener('mousemove', function() {
                        clearTimeout(closeTimeout);
                    });
                    
                    // 鼠标离开多语言切换区域时延迟关闭
                    multilingual.addEventListener('mouseleave', function() {
                        closeTimeout = setTimeout(() => {
                            dropdown.style.display = 'none';
                          //  console.log('[下拉菜单] 延迟关闭多语言下拉菜单');
                        }, 500); // 延长到500ms延迟关闭，提高稳定性
                    });
                }
            }
            
            // 点击页面其他地方关闭所有下拉菜单
            document.addEventListener('click', function() {
               // console.log('[下拉菜单] 点击页面其他地方');
                closeAllDropdowns();
            });
        }
        
        // 页面加载完成后初始化下拉菜单
        if (document.readyState === 'loading') {
           // console.log('[下拉菜单] DOM正在加载中，等待DOMContentLoaded事件');
            document.addEventListener('DOMContentLoaded', initDropdowns);
        } else {
            // DOM已经加载完成，直接初始化
           // console.log('[下拉菜单] DOM已经加载完成，直接初始化');
            initDropdowns();
        }
        
        // 关闭所有下拉菜单的辅助函数
        function closeAllDropdowns() {
            //console.log('[下拉菜单] 关闭所有下拉菜单');
            const openDropdowns = document.querySelectorAll('.pfds-header-dropdown-content, .pfds-multilingual-dropdown');
            openDropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
        }
        
        // 清除定时器的辅助函数
        function clearCloseTimer(timeoutId) {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
        
       // console.log('[下拉菜单] 模块初始化完成');
    }
};

return dropdownMenuModule;