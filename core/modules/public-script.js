// 公共脚本模块
const publicScriptModule = {
    init: function() {
     //   console.log('[公共脚本] 模块初始化开始');
        
        // 预声明区域关闭功能
        function initPreDeclarationClose() {
           // console.log('[公共脚本] 初始化预声明关闭功能');
            const preDeclaration = document.getElementById('pfds-preDeclaration');
            const closeBtn = document.getElementById('pfds-preDeclarationClose');
            
            if (preDeclaration && closeBtn) {
               // console.log('[公共脚本] 找到预声明元素和关闭按钮');
                closeBtn.addEventListener('click', function() {
                   // console.log('[公共脚本] 点击预声明关闭按钮');
                    preDeclaration.style.display = 'none';
                });
            } else {
              //  console.log('[公共脚本] 未找到预声明元素或关闭按钮');
            }
        }
        
        // 确保在DOM加载完成后初始化预声明关闭功能
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initPreDeclarationClose);
        } else {
            // DOM已经加载完成
            initPreDeclarationClose();
        }
        
        // 初始化所有功能
       // console.log('[公共脚本] 调用initPublic函数');
        this.initPublic();
        
        // 初始化返回顶部按钮
        this.initBackToTop();
    },
    
    initPublic: function() {
        //console.log('[公共脚本] initPublic函数开始执行');
        
        // 初始化主题
        if (typeof initTheme === 'function') {
            //console.log('[公共脚本] 调用initTheme函数');
            initTheme();
        }
        
        // 初始化菜单
        if (typeof initMenu === 'function') {
            //console.log('[公共脚本] 调用initMenu函数');
            initMenu();
        }
        
        // 初始化页面导航
        if (typeof initNavigation === 'function') {
            //console.log('[公共脚本] 调用initNavigation函数');
            initNavigation();
        }
        
        // 初始化页面锚点
        if (typeof initPageAnchors === 'function') {
           // console.log('[公共脚本] 调用initPageAnchors函数');
            initPageAnchors();
        }
        
        // 初始化搜索
        if (typeof initSearch === 'function') {
          //  console.log('[公共脚本] 调用initSearch函数');
            initSearch();
        }
        
        // 初始化多语言
        if (typeof initMultilingual === 'function') {
           // console.log('[公共脚本] 调用initMultilingual函数');
            initMultilingual();
        }
        
        // 初始化侧边栏折叠功能
        if (typeof initSidebarToggle === 'function') {
           // console.log('[公共脚本] 调用initSidebarToggle函数');
            initSidebarToggle();
        }
        
        // 页面加载完成后显示内容
       // console.log('[公共脚本] 显示页面内容');
        document.body.style.display = 'flex';
    },
    
    initBackToTop: function() {
       // console.log('[公共脚本] initBackToTop函数开始执行');
        // 检查是否已存在返回顶部按钮
        if (document.querySelector('.pfds-back-to-top')) {
           // console.log('[公共脚本] 返回顶部按钮已存在');
            return; // 如果已存在，不重复创建
        }
        
        // 创建返回顶部按钮
        const backToTopButton = document.createElement('button');
        backToTopButton.className = 'pfds-back-to-top';
        
        // 创建按钮内部结构
        backToTopButton.innerHTML = `
            <div class="progress-container">
                <div class="progress-bg"></div>
                <div class="progress-ring">
                    <svg viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="18"></circle>
                    </svg>
                </div>
                <span class="progress-text">0%</span>
            </div>
        `;
        
        const contentMain = document.querySelector('.pfds-content-main');
        
        if (!contentMain) {
          //  console.warn('[公共脚本] 未找到内容主区域');
            return;
        }
        
        // 将按钮添加到内容区域中
        contentMain.appendChild(backToTopButton);
      //  console.log('[公共脚本] 返回顶部按钮已添加到内容区域');
        
        const progressText = backToTopButton.querySelector('.progress-text');
        const progressCircle = backToTopButton.querySelector('circle');
        const circumference = 2 * Math.PI * 18; // 2 * π * r
        progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        progressCircle.style.strokeDashoffset = circumference;
        
        // 监听内容区域滚动事件
        contentMain.addEventListener('scroll', function() {
           // console.log('[公共脚本] 内容区域滚动事件触发');
            // 获取当前激活的页面
            const activePage = document.querySelector('.page-content.active');
            if (!activePage) {
                //console.warn('[公共脚本] 未找到激活的页面');
                return;
            }
            
            // 计算阅读进度
            const scrollTop = contentMain.scrollTop;
            const scrollHeight = activePage.scrollHeight;
            const clientHeight = contentMain.clientHeight;
            
           // console.log('[公共脚本] 滚动信息 - scrollTop:', scrollTop, 'scrollHeight:', scrollHeight, 'clientHeight:', clientHeight);
            
            // 只有当内容高度大于可视区域高度时才处理滚动相关操作
            if (scrollHeight > clientHeight) {
                // 修正进度计算逻辑
                let progress = Math.round((scrollTop / (scrollHeight - clientHeight)) * 100);
                // 限制进度在0-100范围内
                progress = Math.max(0, Math.min(100, progress));
                
               // console.log('[公共脚本] 计算出的进度:', progress);
                
                // 更新进度文本
                if (progressText) {
                    progressText.textContent = `${progress}%`;
                }
                
                // 更新进度环
                if (progressCircle) {
                    const offset = circumference - (progress / 100) * circumference;
                    progressCircle.style.strokeDashoffset = offset;
                }
                
                // 显示/隐藏返回顶部按钮
                if (scrollTop > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            } else {
                // 内容高度不大于可视区域高度时，重置所有状态
               // console.log('[公共脚本] 内容高度不大于可视区域高度，重置滚动相关状态');
                if (progressText) {
                    progressText.textContent = '0%';
                }
                if (progressCircle) {
                    progressCircle.style.strokeDashoffset = circumference;
                }
                backToTopButton.classList.remove('visible');
            }
        });
        
        // 点击返回顶部按钮
        backToTopButton.addEventListener('click', function() {
          //  console.log('[公共脚本] 点击返回顶部按钮');
            const contentMain = document.querySelector('.pfds-content-main');
            if (contentMain) {
                contentMain.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        // 页面切换时重置进度显示
        window.addEventListener('showPage', function(e) {
           // console.log('[公共脚本] 接收到showPage事件:', e.detail);
            // 延迟执行以确保页面切换完成
            setTimeout(() => {
                if (progressText) {
                    progressText.textContent = '0%';
                }
                if (progressCircle) {
                    progressCircle.style.strokeDashoffset = circumference;
                }
                if (backToTopButton) {
                    backToTopButton.classList.remove('visible');
                }
                
                // 重置滚动位置
                const contentMain = document.querySelector('.pfds-content-main');
                if (contentMain) {
                    contentMain.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);
        });
    }
};

// 全局公共脚本
window.pfdsShowPage = function(pageId) {
   // console.log('[公共脚本] pfdsShowPage 全局函数开始执行，页面ID:', pageId);
    
    // 隐藏所有内容
    document.querySelectorAll('.page-content').forEach(page => {
        page.classList.remove('active');
    });

    // 显示目标页面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
       // console.log('[公共脚本] 显示目标页面:', pageId);
    } else {
        //console.log('[公共脚本] 未找到目标页面:', pageId);
        return;
    }

    // 更新侧边栏选中状态
    document.querySelectorAll('.pfds-nav-item a').forEach(navLink => {
        navLink.classList.remove('pfds-active');
    });
    
    const targetNavLink = document.querySelector(`.pfds-nav-item a[data-page-id="${pageId}"]`);
    if (targetNavLink) {
        targetNavLink.classList.add('pfds-active');
       // console.log('[公共脚本] 更新导航链接状态');
    }

    // 滚动到页面顶部
    const contentMain = document.querySelector('.pfds-content-main');
    if (contentMain) {
        //console.log('[公共脚本] 开始滚动到页面顶部');
        contentMain.scrollTo({ top: 0, behavior: 'smooth' });
        //console.log('[公共脚本] 已执行滚动到页面顶部');
    }
    // 触发自定义事件，通知其他模块页面已切换
    const event = new CustomEvent('showPage', { detail: { pageId: pageId } });
    window.dispatchEvent(event);
   // console.log('[公共脚本] 已触发页面切换事件:', pageId);
};

return publicScriptModule;