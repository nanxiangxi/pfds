// JS隔离模块 - 浏览器环境版本
const jsIsolationModule = {
    init: function() {
        //console.log('[JS隔离] 模块初始化开始');
        
        // 页面切换事件监听器
        window.addEventListener('showPage', function(e) {
           // console.log('[JS隔离] 检测到页面切换事件:', e.detail);
            initPageScripts(e.detail.pageId);
        });
        
        // DOM加载完成后初始化脚本
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                //console.log('[JS隔离] DOM加载完成，等待初始化脚本');
                initPageScripts();
            });
        } else {
          //  console.log('[JS隔离] DOM已加载，直接初始化脚本');
            initPageScripts();
        }
        
        function initPageScripts(pageId) {
           // console.log('[JS隔离] 页面切换后初始化脚本');
            
            // 如果没有提供pageId，则使用当前激活的页面
            if (!pageId) {
                const activePage = document.querySelector('.page-content.active');
                if (activePage) {
                    pageId = activePage.id;
                }
            }
            
            // 如果仍然没有pageId，则退出
            if (!pageId) {
               // console.log('[JS隔离] 未找到有效的页面ID，跳过脚本初始化');
                return;
            }
            
          //  console.log('[JS隔离] 初始化隔离脚本，页面ID:', pageId);
            
            // 检查页面是否需要JS隔离执行
            const pageElement = document.getElementById(pageId);
            if (!pageElement) {
               // console.log('[JS隔离] 未找到页面元素:', pageId);
                return;
            }
            
            const needsJS = pageElement.getAttribute('data-js') === 'true';
          //  console.log('[JS隔离] 页面data-js属性值:', pageElement.getAttribute('data-js'));
            
            if (!needsJS) {
                //console.log('[JS隔离] 页面不需要JS隔离执行');
                return;
            }
            
            // 查找页面中的所有带有mod属性的script标签
            const scripts = pageElement.querySelectorAll('script[mod]');
           // console.log('[JS隔离] 找到带mod属性的脚本数量:', scripts.length);
            
            scripts.forEach(script => {
                // 获取脚本内容
                const scriptContent = script.textContent;
                
                // 获取模块名称
                const modName = script.getAttribute('mod');
                
                // 创建新的脚本元素
                const newScript = document.createElement('script');
                newScript.textContent = scriptContent;
                
                // 如果有模块名称，则设置
                if (modName) {
                    newScript.setAttribute('mod', modName);
                }
                
                // 将新脚本添加到head中执行
                document.head.appendChild(newScript);
                
                // 执行后立即移除
                document.head.removeChild(newScript);
                
               // console.log('[JS隔离] 已执行隔离脚本，模块名:', modName);
            });
        }
        
      //  console.log('[JS隔离] 模块初始化完成');
    }
};

return jsIsolationModule;