// JS动态加载模块 - 浏览器环境版本
const jsDynamicLoadModule = {
    init: function() {
       // console.log('[JS动态加载] 模块初始化开始');
        let currentScript = null;

        function loadPageScript(pageId) {
           // console.log('[JS动态加载] 开始加载页面脚本，页面ID:', pageId);
            
            // 检查页面是否需要动态加载JS
            const pageElement = document.getElementById(pageId);
            if (!pageElement) {
               // console.log('[JS动态加载] 未找到页面元素:', pageId);
                return;
            }
            
            const needsJS = pageElement.getAttribute('data-js') === 'true';
           // console.log('[JS动态加载] 页面data-js属性值:', pageElement.getAttribute('data-js'));
            
            if (!needsJS) {
              //  console.log('[JS动态加载] 页面不需要动态加载JS');
                // 移除之前加载的脚本（如果存在）
                if (currentScript) {
                  //  console.log('[JS动态加载] 移除旧的脚本链接');
                    currentScript.remove();
                    currentScript = null;
                }
                return;
            }
            
            // 移除之前加载的脚本（如果存在）
            if (currentScript) {
               // console.log('[JS动态加载] 移除旧的脚本链接');
                currentScript.remove();
                currentScript = null;
            }

            // 构造新的 JS 路径
            const jsPath = `assets/js/script-${pageId}.js`;
           // console.log('[JS动态加载] JS路径:', jsPath);

            // 创建 script 标签
            const script = document.createElement('script');
            script.src = jsPath;
            script.type = 'text/javascript';
            script.defer = true; // 延迟执行

            // 错误处理
            script.onerror = function(e) {
                console.warn(`[JS动态加载] 脚本加载失败: ${jsPath}`, e);
                // 从DOM中移除script标签
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };

            // 成功加载回调
            script.onload = function() {
             //   console.log(`[JS动态加载] 成功加载脚本: ${jsPath}`);
            };

            // 保存引用以便后续移除
            currentScript = script;

            // 插入到 head 中
            document.head.appendChild(script);
           // console.log('[JS动态加载] 已添加脚本链接到head');
        }

        // 监听页面切换事件（假设通过 showPage 切换）
        window.addEventListener('showPage', (e) => {
           // console.log('[JS动态加载] 接收到页面切换事件:', e.detail);
            loadPageScript(e.detail.pageId);
        });

        // 页面首次加载时也尝试加载当前 active 页面的脚本
        const activePage = document.querySelector('.page-content.active');
        if (activePage && activePage.id) {
          //  console.log('[JS动态加载] 首次加载，检测到活动页面:', activePage.id);
            loadPageScript(activePage.id);
        }
        
      //  console.log('[JS动态加载] 模块初始化完成');
    }
};

// 导出模块供其他模块使用
export default jsDynamicLoadModule;