// 菜单模块
const menuModule = {
    init: function() {
        //console.log('[菜单模块] 模块初始化开始');
        
        function initMenu() {
            //console.log('[菜单模块] 初始化函数开始执行');
            const hamburger = document.querySelector('.pfds-hamburger');
            const nav = document.querySelector('.pfds-nav');
            const overlay = document.getElementById('pfds-mobileOverlay');
            const sidebar = document.querySelector('.pfds-sidebar');
            
           // console.log('[菜单模块] 查找元素结果:', {hamburger: !!hamburger, nav: !!nav, overlay: !!overlay, sidebar: !!sidebar});

            // 检查必需的元素是否存在并在缺失时提示并终止初始化
            if (!hamburger) {
               // console.warn("[菜单模块] 缺少汉堡菜单元素: .pfds-hamburger");
                return;
            }
           // console.log('[菜单模块] 找到汉堡菜单元素');
            
            if (!nav) {
                //console.warn("[菜单模块] 缺少导航元素: .pfds-nav");
                return;
            }
           // console.log('[菜单模块] 找到导航元素');
            
            if (!overlay) {
               // console.warn("[菜单模块] 缺少遮罩层元素: #pfds-mobileOverlay");
                return;
            }
           // console.log('[菜单模块] 找到遮罩层元素');
            
            if (!sidebar) {
              //  console.warn("[菜单模块] 缺少侧边栏元素: .pfds-sidebar");
                return;
            }
           // console.log('[菜单模块] 找到侧边栏元素');

            // 移除可能已存在的事件监听器，防止重复绑定
            hamburger.removeEventListener('click', handleHamburgerClick);
            overlay.removeEventListener('click', handleOverlayClick);
            
            // 定义事件处理函数
            function handleHamburgerClick() {
                //console.log('[菜单模块] 汉堡菜单被点击');
                //console.log('[菜单模块] 点击前状态 - 汉堡菜单active类:', hamburger.classList.contains('active'));
                //console.log('[菜单模块] 点击前状态 - 侧边栏show类:', sidebar.classList.contains('show'));
                
                hamburger.classList.toggle('active');
                sidebar.classList.toggle('show');
                
                //console.log('[菜单模块] 点击后状态 - 汉堡菜单active类:', hamburger.classList.contains('active'));
                //console.log('[菜单模块] 点击后状态 - 侧边栏show类:', sidebar.classList.contains('show'));
                
                overlay.style.display = sidebar.classList.contains('show') ? 'block' : 'none';
                //console.log('[菜单模块] 遮罩层显示状态:', overlay.style.display);
            }
            
            function handleOverlayClick() {
                //console.log('[菜单模块] 遮罩层被点击');
                hamburger.classList.remove('active');
                sidebar.classList.remove('show');
                overlay.style.display = 'none';
               // console.log('[菜单模块] 侧边栏和汉堡菜单已隐藏');
            }

            // 添加事件监听器
            hamburger.addEventListener('click', handleHamburgerClick);
            overlay.addEventListener('click', handleOverlayClick);
            
            //console.log('[菜单模块] 事件监听器已绑定');
        }

        // 页面加载完成后初始化菜单
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMenu);
        } else {
            // DOM已经加载完成
            initMenu();
        }
    }
};

return menuModule;