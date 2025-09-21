// CSS自动加载模块
const cssAutoLoadModule = {
    init: function() {
       // console.log('[CSS自动加载] 模块初始化开始');
        let currentCssLink = null;

        function loadPageCss(pageId) {
           // console.log('[CSS自动加载] 开始加载页面CSS，页面ID:', pageId);
            
            // 检查页面是否需要动态加载CSS
            const pageElement = document.getElementById(pageId);
            if (!pageElement) {
               // console.log('[CSS自动加载] 未找到页面元素:', pageId);
                return;
            }
            
            const needsCSS = pageElement.getAttribute('data-css') === 'true';
            //console.log('[CSS自动加载] 页面data-css属性值:', pageElement.getAttribute('data-css'));
            
            if (!needsCSS) {
               // console.log('[CSS自动加载] 页面不需要动态加载CSS');
                // 移除现有的CSS链接（如果有的话）
                if (currentCssLink) {
                   // console.log('[CSS自动加载] 移除旧的CSS链接');
                    currentCssLink.remove();
                    currentCssLink = null;
                }
                return;
            }
            
            // 移除旧的 CSS 文件
            if (currentCssLink) {
              //  console.log('[CSS自动加载] 移除旧的CSS链接');
                currentCssLink.remove();
                currentCssLink = null;
            }

            // 构造新的 CSS 路径
            const cssPath = `assets/css/css-${pageId}.css`;
           // console.log('[CSS自动加载] CSS路径:', cssPath);

            // 创建 link 标签
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssPath;
            link.type = 'text/css'; // 明确指定MIME类型

            // 错误处理：CSS 加载失败时不报错
            link.onerror = function(e) {
                console.warn(`[CSS自动加载] CSS文件未找到或加载失败: ${cssPath}`, e);
                // 从DOM中移除link标签
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            };

            // 成功加载回调
            link.onload = function() {
              //  console.log(`[CSS自动加载] 成功加载CSS: ${cssPath}`);
            };

            // 保存引用以便下次移除
            currentCssLink = link;

            // 插入到 head 中
            document.head.appendChild(link);
            //console.log('[CSS自动加载] 已添加CSS链接到head');
        }

        // 监听页面切换事件（假设通过 showPage 切换）
        window.addEventListener('showPage', (e) => {
            //console.log('[CSS自动加载] 接收到页面切换事件:', e.detail);
            loadPageCss(e.detail.pageId);
        });

        // 页面首次加载时也尝试加载当前 active 页面的样式
        const activePage = document.querySelector('.page-content.active');
        if (activePage && activePage.id) {
          //  console.log('[CSS自动加载] 首次加载，检测到活动页面:', activePage.id);
            loadPageCss(activePage.id);
        }
        
       // console.log('[CSS自动加载] 模块初始化完成');
    }
};

return cssAutoLoadModule;