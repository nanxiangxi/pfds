// PFDS 模块系统
(function() {
    'use strict';
    
    //console.log('[模块系统] 开始初始化');
    
    // 动态加载标记
    window.PFDS_DYNAMIC_LOAD = window.PFDS_DYNAMIC_LOAD || {};
    
    // 检查页面是否需要动态加载JS
    window.PFDS_DYNAMIC_LOAD.needsJS = function(pageId) {
        const result = this[pageId] && this[pageId].js === true;
       // console.log('[模块系统] 检查页面是否需要JS:', pageId, '结果:', result);
        return result;
    };
    
    // 检查页面是否需要动态加载CSS
    window.PFDS_DYNAMIC_LOAD.needsCSS = function(pageId) {
        const result = this[pageId] && this[pageId].css === true;
        //console.log('[模块系统] 检查页面是否需要CSS:', pageId, '结果:', result);
        return result;
    };
    
    // 模块注册表
    const modules = {};
    
    // 模块注册函数
    function registerModule(name, factory) {
       // console.log('[模块系统] 注册模块:', name);
        modules[name] = factory;
    }
    
    // 模块获取函数
    function getModule(name) {
        return modules[name];
    }
    
    // 初始化所有模块
    function initModules() {
        //console.log('[模块系统] 开始初始化所有模块');
        const initOrder = [
            'css自动加载',
            '主题切换',
            '代码高亮', 
            '代码复制',
            '元素多语言',
            '菜单',
            '下拉菜单', 
            '平滑滚动',
            '阅读进度条',
            '搜索',
            '智能搜索',
            '搜索模态框',
            '页面导航',
            'js隔离',
            'js动态加载',
            '折叠',
            'public-script'
        ];
        
        initOrder.forEach(name => {
            if (modules[name] && typeof modules[name].init === 'function') {
                try {
                   // console.log('[模块系统] 初始化模块:', name);
                    modules[name].init();
                } catch (e) {
                  //  console.error('[模块系统] 模块初始化失败:', name, e);
                }
            }
        });
        
        // console.log('[模块系统] 所有模块初始化完成');
    }

    // 模块: css自动加载
    registerModule('css自动加载', (function() {
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
    })());

    // 模块: js动态加载
    registerModule('js动态加载', (function() {
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
return jsDynamicLoadModule;
    })());

    // 模块: js隔离
    registerModule('js隔离', (function() {
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
    })());

    // 模块: 下拉菜单
    registerModule('下拉菜单', (function() {
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
    })());

    // 模块: 主题切换
    registerModule('主题切换', (function() {
        /**
 * 主题切换模块 - 支持立体感开关按钮
 */
const themeSwitchModule = {
    init: function() {
        class RockerSwitch {
            /**
             * @param {string} buttonSelector CSS选择器，用于定位主题切换按钮
             */
            constructor(buttonSelector = '#pfds-themeSwitch') {
                this._theme = "light";
                this.button = document.querySelector(buttonSelector);
                
                // 页面加载完成后初始化
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => {
                        this.initTheme();
                        this.bindEvents();
                    });
                } else {
                    this.initTheme();
                    this.bindEvents();
                }
            }
            
            /** 获取当前主题 */
            get theme() {
                return this._theme;
            }
            
            /** 设置主题 */
            set theme(value) {
                this._theme = value;
                if (this.button) {
                    this.button.setAttribute("aria-label", value === 'dark' ? "深色主题" : "浅色主题");
                    // 更新按钮的aria-labelledby属性以触发CSS状态切换
                    this.button.setAttribute("aria-labelledby", value);
                }
                // 应用主题
                this.applyTheme(value);
            }
            
            /** 初始化主题状态 */
            initTheme() {
                // 检查本地存储中是否有保存的主题设置
                const savedTheme = localStorage.getItem('pfds-theme');
                if (savedTheme) {
                    this.theme = savedTheme;
                    return;
                }
                
                // 根据系统偏好设置默认主题
                const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                this.theme = isDark ? 'dark' : 'light';
            }
            
            /** 绑定事件 */
            bindEvents() {
                if (this.button) {
                    // 使用 click 事件替代 change，更适合开关按钮交互
                    this.button.addEventListener("click", this.toggleTheme.bind(this));
                }
            }
            
            /** 应用主题到文档 */
            applyTheme(theme) {
                const isDark = theme === 'dark';
                
                // 更新body类名
                if (document.body) {
                    document.body.classList.toggle('dark-theme', isDark);
                }
                
                // 保存主题设置到本地存储
                localStorage.setItem('pfds-theme', theme);
                
               // console.log('[主题切换] 主题已切换为:', theme, ' body class:', document.body ? document.body.className : 'document.body not available');
            }
            
            /** 切换主题 */
            toggleTheme() {
                this.theme = this.theme === "dark" ? "light" : "dark";
            }
        }

        // 保持向后兼容的初始化函数
        function initRockerSwitch() {
            // 确保DOM已加载
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    new RockerSwitch('#pfds-themeSwitch');
                });
            } else {
                new RockerSwitch('#pfds-themeSwitch');
            }
        }

        // 向后兼容旧的调用方式
        function initThemeToggle() {
            initRockerSwitch();
        }

        // 初始化主题切换
        initRockerSwitch();
    }
};

return themeSwitchModule;
    })());

    // 模块: 代码复制
    registerModule('代码复制', (function() {
        // 代码复制模块
const codeCopyModule = {
    init: function() {
        window.copyCode = function(button) {
            const pre = button.closest('pre');
            const code = pre.querySelector('code').innerText;

            navigator.clipboard.writeText(code).then(() => {
                const icon = button.querySelector('i');
                const original = icon.className;
                icon.className = 'icon-check'; // 你可以定义 icon-check 显示为 ✔ 图标
                
                // 显示成功消息
                showMessage('代码复制成功！', 'success');
                
                setTimeout(() => {
                    icon.className = original;
                }, 1500);
            }).catch(err => {
                showMessage('复制失败: ' + err.message, 'error');
            });
        };

        // 创建消息提示框元素
        createMessageContainer();
    }
};

// 创建消息提示框容器
function createMessageContainer() {
    if (document.getElementById('copy-message')) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'copy-message';
    messageDiv.className = 'custom-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 6px 28px;
        border-radius: 10px;
        font-size: 16px;
        z-index: 9999;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        font-family: 'Segoe UI', sans-serif;
        border: 2px solid transparent;
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;
        opacity: 0;
        min-width: 150px;
        text-align: center;
        /* 深色主题默认样式 */
        color: #e8f5e9;
        background-color: rgba(255, 255, 255, 0.1);
    `;
    
    // 监听主题变化
    const observer = new MutationObserver(() => {
        applyThemeStyles(messageDiv);
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // 初始应用主题样式
    applyThemeStyles(messageDiv);
    
    document.body.appendChild(messageDiv);
}

// 应用主题样式
function applyThemeStyles(element) {
    if (document.body.classList.contains('light-theme')) {
        // 浅色主题样式
        element.style.color = '#212529';
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    } else {
        // 深色主题样式
        element.style.color = '#e8f5e9';
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }
}

// 显示消息提示框
function showMessage(text, type) {
    const messageDiv = document.getElementById('copy-message');
    if (!messageDiv) return;
    
    // 应用主题样式
    applyThemeStyles(messageDiv);
    
    // 设置消息文本
    messageDiv.textContent = text;
    
    // 根据类型设置边框颜色
    if (type === 'success') {
        messageDiv.style.borderColor = '#a5d6a7';
    } else {
        messageDiv.style.borderColor = '#ef9a9a';
    }
    
    // 显示消息（触发动画）
    messageDiv.style.opacity = '1';
    
    // 2秒后隐藏消息
    setTimeout(() => {
        messageDiv.style.opacity = '0';
    }, 2000);
}

return codeCopyModule;
    })());

    // 模块: 代码高亮
    registerModule('代码高亮', (function() {
        // 代码高亮模块
const codeHighlightModule = {
    init: function() {
        import('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js')
            .then(() => {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            });
    }
};

return codeHighlightModule;
    })());

    // 模块: 元素多语言
    registerModule('元素多语言', (function() {
        // 元素多语言支持模块
// 该模块处理HTML元素上的data-lang-*属性，根据当前语言显示对应内容

const elementLanguageModule = {
    init: function() {
        //console.log('[元素多语言] 模块初始化开始');

        /**
         * 根据当前语言更新所有带有data-lang属性的元素
         * @param {string} langCode - 语言代码
         */
        function updateElementLanguages(langCode) {
           // console.log('[元素多语言] updateElementLanguages函数被调用，参数:', langCode);

            // 查找所有带有data-lang-*属性的元素
            // 由于querySelector不支持属性前缀通配符，我们先获取所有元素再过滤
            const allElements = document.querySelectorAll('*');
            const elements = Array.from(allElements).filter(el => {
                return Array.from(el.attributes).some(attr => attr.name.startsWith('data-lang-'));
            });

           // console.log('[元素多语言] 找到带有多语言属性的元素数量:', elements.length);

            // 统一语言代码的大小写格式，确保匹配正确
            const normalizedLangCode = langCode.toLowerCase();
          //  console.log('[元素多语言] 标准化后的语言代码:', normalizedLangCode);

            elements.forEach(element => {
                // 获取所有data-lang属性
                const attributes = Array.from(element.attributes);
                const langAttributes = attributes.filter(attr => attr.name.startsWith('data-lang-'));

                //console.log('[元素多语言] 元素的多语言属性:', langAttributes.map(attr => ({name: attr.name, value: attr.value})));

                // 查找匹配当前语言的属性（忽略大小写）
                const matchingAttr = langAttributes.find(attr => {
                    const attrLangCode = attr.name.substring(10).toLowerCase(); // 'data-lang-'.length = 10
                    return attrLangCode === normalizedLangCode;
                });

               // console.log('[元素多语言] 匹配的属性:', matchingAttr);

                // 如果找到匹配的语言属性，则更新元素文本内容
                if (matchingAttr) {
                    // 检查元素类型以决定如何更新内容
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        // 对于表单元素，更新value属性
                        element.value = matchingAttr.value;
                    } else if (element.tagName === 'IMG') {
                        // 对于图片元素，更新alt属性
                        element.alt = matchingAttr.value;
                    } else {
                        // 对于其他元素，更新textContent
                        // 清理多余的换行符，保留正常的换行
                        const cleanText = matchingAttr.value.replace(/\n\s*\n\s*\n/g, '\n\n');
                        element.textContent = cleanText;
                    }
                    //console.log('[元素多语言] 元素内容已更新为:', matchingAttr.value);
                } else if (langAttributes.length > 0) {
                    // 如果没有找到匹配的语言，使用第一个可用的语言作为后备
                    const fallbackAttr = langAttributes[0];
                    //console.log('[元素多语言] 使用后备语言:', fallbackAttr);

                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = fallbackAttr.value;
                    } else if (element.tagName === 'IMG') {
                        element.alt = fallbackAttr.value;
                    } else {
                        // 清理多余的换行符，保留正常的换行
                        const cleanText = fallbackAttr.value.replace(/\n\s*\n\s*\n/g, '\n\n');
                        element.textContent = cleanText;
                    }
                    //console.log('[元素多语言] 元素内容已更新为后备语言:', fallbackAttr.value);
                }
            });

            // 重新生成右侧边栏内容导航
            updateContentNavigation(langCode);

            // 更新导航菜单和头部链接的多语言内容
            updateNavigationAndHeaderLanguages(langCode);
        }

        /**
         * 更新导航菜单和头部链接的多语言内容
         * @param {string} langCode - 语言代码
         */
        function updateNavigationAndHeaderLanguages(langCode) {
            // 更新导航菜单中的多语言内容
            const navItems = document.querySelectorAll('.pfds-nav-item > a, .pfds-nav-group > a');
            navItems.forEach(item => {
                const langAttributes = Array.from(item.attributes).filter(attr => attr.name.startsWith('data-lang-'));
                if (langAttributes.length > 0) {
                    const normalizedLangCode = langCode.toLowerCase();
                    const matchingAttr = langAttributes.find(attr => {
                        const attrLangCode = attr.name.substring(10).toLowerCase();
                        return attrLangCode === normalizedLangCode;
                    });

                    if (matchingAttr) {
                        item.innerHTML = matchingAttr.value;
                    } else {
                        // 使用后备语言
                        item.innerHTML = langAttributes[0].value;
                    }
                }
            });

            // 更新头部链接中的多语言内容
            const headLinks = document.querySelectorAll('.pfds-header-link');
            headLinks.forEach(link => {
                const langAttributes = Array.from(link.attributes).filter(attr => attr.name.startsWith('data-lang-'));
                if (langAttributes.length > 0) {
                    const normalizedLangCode = langCode.toLowerCase();
                    const matchingAttr = langAttributes.find(attr => {
                        const attrLangCode = attr.name.substring(10).toLowerCase();
                        return attrLangCode === normalizedLangCode;
                    });

                    if (matchingAttr) {
                        link.innerHTML = matchingAttr.value;
                    } else {
                        // 使用后备语言
                        link.innerHTML = langAttributes[0].value;
                    }
                }
            });
        }

        /**
         * 重新生成右侧边栏内容导航
         * @param {string} langCode - 语言代码
         */
        function updateContentNavigation(langCode) {
           // console.log('[元素多语言] updateContentNavigation函数被调用，参数:', langCode);

            // 获取当前激活的页面
            const activePage = document.querySelector('.page-content.active');
            if (!activePage) {
               // console.log('[元素多语言] 没有找到激活的页面');
                return;
            }

            const pageId = activePage.id;
           // console.log('[元素多语言] 当前激活页面ID:', pageId);

            // 获取页面中的标题元素，包括h1, h2, h3
            const headers = activePage.querySelectorAll('h1, h2, h3');
           // console.log('[元素多语言] 找到标题元素数量:', headers.length);

            // 获取右侧导航列表元素
            const contentNavList = document.getElementById('pfds-contentNavList');
            if (!contentNavList) {
              //  console.log('[元素多语言] 没有找到右侧导航列表元素');
                return;
            }

            // 清空现有内容
            contentNavList.innerHTML = '';

            // 如果没有标题，则隐藏整个内容导航区域
            const contentNav = document.querySelector('.pfds-content-nav');
            if (headers.length === 0) {
                if (contentNav) {
                    // 检查是否为移动端，如果是则保持隐藏
                    const isMobile = window.matchMedia('(max-width: 979px)').matches;
                    contentNav.style.display = isMobile ? '' : 'none';
                }
                return;
            }

            // 显示内容导航区域（但移动端除外）
            if (contentNav) {
                const isMobile = window.matchMedia('(max-width: 979px)').matches;
                if (!isMobile) {
                    contentNav.style.display = 'block';
                }
            }

            // 为每个标题生成导航项
            headers.forEach((header, index) => {
                const level = parseInt(header.tagName.charAt(1));
                const headerId = `${pageId}-${header.id || 'header-' + index}`;
                header.id = headerId;

                const listItem = document.createElement('li');
                // 添加子项类名以支持样式区分
                if (level > 1) {
                    listItem.classList.add('sub-item');
                }
                const link = document.createElement('a');
                link.href = `#${headerId}`;
                link.setAttribute('data-target', headerId); // 添加目标属性用于高亮

                // 使用间距而不是树状符号来体现层级关系
                // 一级标题不缩进，二级标题开始缩进
                const indent = level > 1 ? '&nbsp;'.repeat((level - 1) * 6) : '';

                // 处理多语言标题
                let headerText = header.textContent;
               // console.log('[元素多语言] 处理标题元素:', header);

                // 检查是否有data-lang属性
                const langAttributes = Array.from(header.attributes).filter(attr => attr.name.startsWith('data-lang-'));
                //console.log('[元素多语言] 标题元素的多语言属性:', langAttributes.map(attr => ({name: attr.name, value: attr.value})));

                if (langAttributes.length > 0) {
                    // 查找匹配的语言属性（忽略大小写）
                    const normalizedLangCode = langCode.toLowerCase();
                    const matchingAttr = langAttributes.find(attr => {
                        const attrLangCode = attr.name.substring(10).toLowerCase(); // 'data-lang-'.length = 10
                        return attrLangCode === normalizedLangCode;
                    });

                    //console.log('[元素多语言] 匹配的属性:', matchingAttr);

                    if (matchingAttr) {
                        headerText = matchingAttr.value;
                    }
                }

                // 清理多余的换行符，保留正常的换行
                const cleanHeaderText = headerText.replace(/\n\s*\n\s*\n/g, '\n\n');
                link.innerHTML = `<span class="tree-symbol"></span>${indent}${cleanHeaderText}`;

                link.onclick = (e) => {
                    e.preventDefault();
                    window.pfdsScrollToAnchor(headerId);
                    // 更新活动状态
                    updateActiveNav(headerId);
                };

                listItem.appendChild(link);
                contentNavList.appendChild(listItem);
            });

            // 初始化活动状态
            setTimeout(updateActiveNav, 100);
        }

        /**
         * 更新导航链接的活动状态
         */
        function updateActiveNav() {
            //console.log('[元素多语言] updateActiveNav 开始执行');

            // 获取当前激活的页面
            const activePage = document.querySelector('.page-content.active');
            if (!activePage) {
                //console.warn('[元素多语言] 未找到激活的页面');
                return;
            }
           // console.log('[元素多语言] 当前激活页面:', activePage.id);

            // 获取所有标题元素
            const headers = activePage.querySelectorAll('h1, h2, h3');
           // console.log('[元素多语言] 找到标题元素数量:', headers.length);
            if (headers.length === 0) {
               // console.log('[元素多语言] 没有标题元素');
                return;
            }

            // 获取内容主区域
            const contentMain = document.querySelector('.pfds-content-main');
            if (!contentMain) {
               // console.warn('[元素多语言] 未找到内容主区域');
                return;
            }
           // console.log('[元素多语言] 内容主区域scrollTop:', contentMain.scrollTop);

            // 获取滚动位置
            const scrollTop = contentMain.scrollTop;

            // 查找当前可见的标题
            let currentHeader = null;
            let closestDistance = Infinity;

            headers.forEach(header => {
                const headerRect = header.getBoundingClientRect();
                const contentMainRect = contentMain.getBoundingClientRect();

                // 计算标题相对于内容主区域的位置
                const headerTop = headerRect.top - contentMainRect.top + scrollTop;

                // 计算标题距离视口顶部的距离
                const distanceToTop = Math.abs(headerTop - scrollTop);

                // 找到距离视口顶部最近的标题
               // console.log(`[元素多语言] 标题 "${header.textContent}" 距离顶部: ${distanceToTop}`);
                if (distanceToTop < closestDistance) {
                    closestDistance = distanceToTop;
                    currentHeader = header;
                }
            });

           // console.log('[元素多语言] 当前标题:', currentHeader ? currentHeader.textContent : '无');

            // 获取右侧导航链接
            const navLinks = document.querySelectorAll('.pfds-content-nav a');
           // console.log('[元素多语言] 右侧导航链接数量:', navLinks.length);

            // 移除所有激活状态
            navLinks.forEach(link => {
                link.classList.remove('active');
               // console.log('[元素多语言] 移除链接激活状态:', link.getAttribute('data-target'));
            });

            // 如果找到了当前标题，则高亮对应的导航链接
            if (currentHeader) {
                const headerId = currentHeader.id;
                //console.log('[元素多语言] 当前标题ID:', headerId);
                // 使用更精确的选择器
                const targetLink = document.querySelector(`.pfds-content-nav a[data-target="${headerId}"]`);
                //console.log('[元素多语言] 目标链接元素:', targetLink);
                if (targetLink) {
                    targetLink.classList.add('active');
                   // console.log('[元素多语言] 激活链接:', headerId);
                } else {
                    //console.warn('[元素多语言] 未找到目标链接');
                }
            }
        }

        /**
         * 处理滚动事件，高亮当前可见的标题
         */
        function handleScroll() {
           // console.log('[元素多语言] handleScroll 开始执行');
            // 使用requestAnimationFrame优化性能
            requestAnimationFrame(updateActiveNav);
        }

        /**
         * 初始化元素多语言功能
         */
        function initElementLanguage() {
           // console.log('[元素多语言] initElementLanguage函数被调用');

            // 监听语言切换事件
            document.addEventListener('languageChanged', function(e) {
                //console.log('[元素多语言] 接收到languageChanged事件:', e.detail);
                const langCode = e.detail.language;
                updateElementLanguages(langCode);
            });

            // 定义初始化函数
            function initializeCurrentLanguage() {
               // console.log('[元素多语言] initializeCurrentLanguage函数被调用');
                const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';
               // console.log('[元素多语言] 初始化语言:', savedLanguage);
                updateElementLanguages(savedLanguage);
            }

            // 页面加载完成后，根据当前语言初始化元素内容
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeCurrentLanguage);
            } else {
                // 如果文档已经加载完成，则立即执行初始化
                initializeCurrentLanguage();
            }

            // 绑定多语言切换事件
            bindMultilingualEvents();

            // 监听滚动事件，更新导航活动状态
            document.addEventListener('DOMContentLoaded', function() {
                const contentMain = document.querySelector('.pfds-content-main');
                if (contentMain) {
                   // console.log('[元素多语言] 为内容主区域添加滚动监听器');
                    // 清除之前的滚动监听器
                    contentMain.removeEventListener('scroll', handleScroll);

                    // 添加新的滚动监听器
                    contentMain.addEventListener('scroll', handleScroll);

                    // 初始化时也调用一次
                    setTimeout(handleScroll, 100);
                    //console.log('[元素多语言] 已安排初始化调用');
                }
            });

            // 监听页面切换事件
            window.addEventListener('showPage', function(e) {
               // console.log('[元素多语言] 接收到showPage事件:', e.detail);
                // 延迟执行以确保页面切换完成
                setTimeout(() => {
                    const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';
                    updateContentNavigation(savedLanguage);

                    // 重新添加滚动监听器
                    const contentMain = document.querySelector('.pfds-content-main');
                    if (contentMain) {
                       // console.log('[元素多语言] 页面切换后重新添加滚动监听器');
                        contentMain.removeEventListener('scroll', handleScroll);
                        contentMain.addEventListener('scroll', handleScroll);
                        setTimeout(handleScroll, 100);
                    }
                }, 100);
            });

            // 监听锚点滚动事件
            window.addEventListener('anchorScrolled', function(e) {
                //console.log('[元素多语言] 接收到anchorScrolled事件:', e.detail);
                // 延迟执行以确保滚动完成
                setTimeout(updateActiveNav, 200);
            });
        }

        /**
         * 绑定多语言切换事件
         */
        function bindMultilingualEvents() {
            // 多语言切换功能
            const multilingualToggle = document.querySelector('.pfds-multilingual');
            if (multilingualToggle) {
               // console.log('[元素多语言] 找到多语言切换元素');

                // 点击切换按钮显示/隐藏下拉菜单
                const toggleButton = multilingualToggle.querySelector('.pfds-multilingual-toggle');
                const dropdown = multilingualToggle.querySelector('.pfds-multilingual-dropdown');

               // console.log('[元素多语言] toggleButton:', toggleButton);
               // console.log('[元素多语言] dropdown:', dropdown);

                if (toggleButton && dropdown) {
                    toggleButton.addEventListener('click', function(e) {
                       // console.log('[元素多语言] 点击切换按钮');
                        e.stopPropagation();
                        e.preventDefault();
                        // 切换下拉菜单显示状态
                        const isDisplayed = dropdown.style.display === 'block';
                        dropdown.style.display = isDisplayed ? 'none' : 'block';
                       // console.log('[元素多语言] 下拉菜单显示状态:', dropdown.style.display);
                    });

                    // 点击选项时更新显示并隐藏下拉菜单
                    const options = multilingualToggle.querySelectorAll('.pfds-multilingual-option');
                   // console.log('[元素多语言] 找到语言选项数量:', options.length);

                    options.forEach(option => {
                        //console.log('[元素多语言] 语言选项:', {lang: option.getAttribute('data-lang'),name: option.getAttribute('data-name'),text: option.textContent});

                        option.addEventListener('click', function(e) {
                           // console.log('[元素多语言] 点击语言选项');
                            e.preventDefault();
                            e.stopPropagation();
                            const langCode = this.getAttribute('data-lang');
                            const name = this.getAttribute('data-name');

                            //console.log('[元素多语言] 选中的语言:', { langCode, name });

                            // 更新当前语言显示为语言代码（而不是语言名称）
                            const currentLang = multilingualToggle.querySelector('.pfds-multilingual-current');
                           // console.log('[元素多语言] currentLang元素:', currentLang);

                            if (currentLang) {
                               // console.log('[元素多语言] 更新前currentLang文本:', currentLang.textContent);
                                currentLang.textContent = langCode;
                               // console.log('[元素多语言] 更新后currentLang文本:', currentLang.textContent);
                            }

                            // 实际切换语言功能
                           // console.log('[元素多语言] 调用switchLanguage函数');
                            switchLanguage(langCode);

                            // 隐藏下拉菜单
                            dropdown.style.display = 'none';
                           // console.log('[元素多语言] 隐藏下拉菜单');
                        });
                    });

                    // 点击下拉菜单中的文字也可以切换语言
                    const dropdownTexts = multilingualToggle.querySelectorAll('.pfds-multilingual-dropdown span');
                    dropdownTexts.forEach(text => {
                        text.addEventListener('click', function(e) {
                            //console.log('[元素多语言] 点击下拉菜单文字');
                            // 找到包含这个文字的选项元素
                            const option = this.closest('.pfds-multilingual-option');
                            if (option) {
                                // 触发选项的点击事件
                                option.click();
                            }
                        });
                    });

                    // 点击其他地方隐藏下拉菜单
                    document.addEventListener('click', function(e) {
                        if (multilingualToggle && !multilingualToggle.contains(e.target)) {
                            dropdown.style.display = 'none';
                        }
                    });
                }
            }
        }

        // 语言切换功能实现
        function switchLanguage(langCode) {
            //console.log('[元素多语言] switchLanguage函数被调用，参数:', langCode);

            // 这里实现实际的语言切换逻辑
           // console.log('切换语言到:', langCode);

            // 保存用户选择的语言到本地存储
            localStorage.setItem('preferredLanguage', langCode);
           // console.log('[元素多语言] 语言已保存到localStorage');

            // 更新多语言切换按钮的显示
            updateMultilingualToggleDisplay(langCode);

            // 在实际项目中，这里可以:
            // 1. 加载对应语言的翻译文件
            // 2. 更新页面内容的语言
            // 3. 发送事件通知其他模块语言已切换
            // 4. 重新加载页面或动态更新内容

            // 示例: 触发自定义事件通知其他组件语言已切换
         //   console.log('[元素多语言] 触发languageChanged事件');
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: {
                    language: langCode
                }
            }));

            // 如果需要页面刷新以应用语言更改，可以取消下面的注释
            // location.reload();
        }

        // 页面加载时恢复用户之前选择的语言
        document.addEventListener('DOMContentLoaded', function() {
          //  console.log('[元素多语言] 页面加载时恢复语言设置');
            const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';  // 添加默认语言
          //  console.log('[元素多语言] 从localStorage获取的语言:', savedLanguage);

            // 恢复语言显示
            const currentLang = document.querySelector('.pfds-multilingual-current');
           // console.log('[元素多语言] currentLang元素:', currentLang);

            if (currentLang) {
                // 显示语言代码而不是语言名称
               // console.log('[元素多语言] 更新currentLang文本为:', savedLanguage);
                currentLang.textContent = savedLanguage;
            }

            // 应用语言设置
          //  console.log('[元素多语言] 调用switchLanguage应用语言设置');
            switchLanguage(savedLanguage);
        });

        // 添加一个函数，在页面加载时确保多语言切换按钮显示正确的语言
        function updateMultilingualToggleDisplay(langCode) {
            const currentLang = document.querySelector('.pfds-multilingual-current');
            if (currentLang) {
                currentLang.textContent = langCode;
            }
        }

        // 监听页面切换事件
        window.addEventListener('showPage', function() {
            // 延迟执行以确保页面切换完成
            setTimeout(() => {
                const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';
                updateContentNavigation(savedLanguage);

                // 重新添加滚动监听器
                const contentMain = document.querySelector('.pfds-content-main');
                if (contentMain) {
                    contentMain.removeEventListener('scroll', handleScroll);
                    contentMain.addEventListener('scroll', handleScroll);
                    setTimeout(handleScroll, 100);
                }
            }, 100);
        });

        // 监听锚点滚动事件
        window.addEventListener('anchorScrolled', function(e) {
           // console.log('[元素多语言] 接收到anchorScrolled事件:', e.detail);
            // 延迟执行以确保滚动完成
            setTimeout(updateActiveNav, 200);
        });

        // 初始化元素多语言功能
        initElementLanguage();
       // console.log('[元素多语言] 模块初始化完成');
    }
};

return elementLanguageModule;
    })());

    // 模块: 平滑滚动
    registerModule('平滑滚动', (function() {
        // 平滑滚动模块
const smoothScrollModule = {
    init: function() {
        window.scrollToSection = function(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        };
    }
};

return smoothScrollModule;
    })());

    // 模块: 折叠
    registerModule('折叠', (function() {
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
    })());

    // 模块: 搜索
    registerModule('搜索', (function() {
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
    })());

    // 模块: 搜索模态框
    registerModule('搜索模态框', (function() {
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
    })());

    // 模块: 智能搜索
    registerModule('智能搜索', (function() {
        /**
 * PFDS 全局智能搜索系统
 * 纯前端，无依赖，自动索引，结构感知，范围可控，导航联动
 */

class PFDSGlobalSearch {
    constructor() {
        this.index = [];
        this.currentScope = 'global';
        this.init();
    }

    init() {
        // 构建索引
        this.buildIndex();

        // 绑定事件
        this.bindEvents();
    }

    /**
     * 创建搜索控件容器（在模态框中）
     */
    createSearchContainer() {
        // 在模态框中创建搜索控件
        const modalContent = document.querySelector('.pfds-modal-content');
        if (modalContent) {
            modalContent.innerHTML = `
                <div class="pfds-search-header">
                    <input type="text" id="pfdsGlobalSearch" placeholder="搜索文档..." class="pfds-search-input-large" />
                </div>
                <div class="pfds-search-body">
                    <div id="pfdsSearchResults" class="pfds-search-results"></div>
                </div>
                <div class="pfds-search-footer">
                    <div class="pfds-search-scope-container">
                        <select id="pfdsSearchScope" class="pfds-search-scope-select">
                            <option value="global">全局</option>
                        </select>
                    </div>
                    <div class="pfds-search-info">
                        搜索提供 PFDS
                    </div>
                </div>
            `;
            
            // 更新搜索范围选项
            this.updateScopeOptions();
        }
    }

    /**
     * 绑定搜索相关事件
     */
    bindEvents() {
        // 绑定模态框内的搜索事件
        const openModal = () => {
            const modal = document.getElementById('pfds-searchModal');
            if (modal) {
                modal.style.display = 'flex';
                this.createSearchContainer();
                
                // 聚焦到搜索输入框
                setTimeout(() => {
                    const searchInput = document.getElementById('pfdsGlobalSearch');
                    if (searchInput) {
                        searchInput.focus();
                    }
                }, 100);
            }
        };

        // 点击头部搜索区域打开模态框
        const headerSearch = document.getElementById('pfds-headerSearch');
        if (headerSearch) {
            headerSearch.addEventListener('click', openModal);
        }

        // 监听键盘事件，Ctrl+K 打开搜索
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                openModal();
            }
        });

        // 动态绑定搜索输入事件（当模态框打开后）
        document.addEventListener('input', (e) => {
            if (e.target && e.target.id === 'pfdsGlobalSearch') {
                this.handleSearchInput(e);
            }
        });

        // 动态绑定范围选择事件
        document.addEventListener('change', (e) => {
            if (e.target && e.target.id === 'pfdsSearchScope') {
                this.handleScopeChange(e);
            }
        });

        // 点击模态框外部关闭
        const modal = document.getElementById('pfds-searchModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    
                    // 关闭移动端侧边栏（如果打开）
                    const sidebar = document.querySelector('.pfds-sidebar');
                    const hamburger = document.querySelector('.pfds-hamburger');
                    const overlay = document.getElementById('pfds-mobileOverlay');
                    
                    if (sidebar && sidebar.classList.contains('show')) {
                        sidebar.classList.remove('show');
                        if (hamburger) {
                            hamburger.classList.remove('active');
                        }
                        if (overlay) {
                            overlay.style.display = 'none';
                        }
                    }
                }
            });
        }
    }

    handleSearchInput(e) {
        // 防抖处理
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            const query = e.target.value.trim();
            if (query) {
                this.performSearch(query, this.currentScope);
            } else {
                this.clearSearchResults();
            }
        }, 300);
    }

    handleScopeChange(e) {
        this.currentScope = e.target.value;
        const searchInput = document.getElementById('pfdsGlobalSearch');
        if (searchInput && searchInput.value.trim()) {
            this.performSearch(searchInput.value.trim(), this.currentScope);
        }
    }

    buildIndex() {
        this.index = []; // 清空索引
        
        document.querySelectorAll('.page-content').forEach(page => {
            const pageId = page.id;
            const navItem = document.querySelector(`.pfds-nav-item a[data-page-id="${pageId}"]`);
            if (!navItem) return;

            const navItemText = navItem.textContent.trim();
            const groupContainer = navItem.closest('.pfds-nav-group');
            const groupName = groupContainer ? groupContainer.querySelector('.pfds-nav-group-toggle').textContent.replace(/[<>]/g, '').trim() : null;
            const pageTitle = page.querySelector('h1')?.textContent.trim() || navItemText;

            // 提取页面内结构化内容（按标题层级）
            const contentTree = this.extractContentTree(page);

            this.index.push({
                pageId,
                pageTitle,
                navItemText,
                navGroupName: groupName,
                isInGroup: !!groupContainer,
                groupElement: groupContainer,
                navElement: navItem,
                pageElement: page,
                contentTree,
                navMatch: false, // 将在搜索时动态标记
                contentMatches: contentTree.length
            });
        });
    }

    extractContentTree(page) {
        const tree = [];
        let currentPath = [];

        // 按顺序遍历所有块级元素
        const elements = page.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, blockquote, td');
        elements.forEach(el => {
            const level = el.tagName.startsWith('H') ? parseInt(el.tagName[1]) : 999;
            
            // 更新标题路径
            if (level < 999) {
                currentPath = currentPath.slice(0, level - 1);
                currentPath.push(el.textContent.trim());
            }

            // 索引所有有文本的元素（包括标题）
            if (el.textContent.trim()) {
                tree.push({
                    titlePath: [...currentPath], // 深拷贝
                    text: el.textContent.trim(),
                    element: el,
                    snippet: this.getSnippet(el, 100)
                });
            }
        });

        return tree;
    }

    getSnippet(element, maxLength = 100) {
        let text = element.textContent.trim();
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    updateScopeOptions() {
        const scopeSelect = document.getElementById('pfdsSearchScope');
        if (!scopeSelect) return;

        // 清空现有选项
        scopeSelect.innerHTML = '';

        // 添加全局选项
        const globalOption = document.createElement('option');
        globalOption.value = 'global';
        globalOption.textContent = '全局';
        scopeSelect.appendChild(globalOption);

        // 获取当前激活的页面
        const activePage = document.querySelector('.page-content.active');
        if (!activePage) return;

        const activePageId = activePage.id;
        const activeItem = this.index.find(item => item.pageId === activePageId);
        
        // 如果当前页面属于某个分组，添加"本组"选项
        if (activeItem && activeItem.navGroupName) {
            const groupOption = document.createElement('option');
            groupOption.value = 'group';
            groupOption.textContent = '本组';
            scopeSelect.appendChild(groupOption);
        }

        // 添加"本页"选项
        const currentPageOption = document.createElement('option');
        currentPageOption.value = 'current';
        currentPageOption.textContent = '本页';
        scopeSelect.appendChild(currentPageOption);

        // 设置当前范围
        scopeSelect.value = this.currentScope;
    }

    performSearch(query, scope) {
        if (!query) return;

        let allResults = [];

        // 1. 搜索导航项匹配（高优先级）
        const navMatches = this.index.filter(item => 
            item.navItemText.toLowerCase().includes(query.toLowerCase()) ||
            (item.navGroupName && item.navGroupName.toLowerCase().includes(query.toLowerCase()))
        ).map(item => ({
            ...item,
            type: 'nav',
            matchText: item.navItemText,
            score: 100 // 高权重
        }));

        // 2. 搜索内容匹配
        const contentMatches = this.index.flatMap(item => {
            const pageMatches = item.contentTree.filter(ct => 
                ct.text.toLowerCase().includes(query.toLowerCase())
            ).map(ct => ({
                ...item,
                type: 'content',
                matchText: ct.text,
                snippet: ct.snippet,
                element: ct.element,
                titlePath: ct.titlePath,
                score: ct.titlePath.length === 1 ? 50 : 30 // h1权重高
            }));
            // 移除限制，显示所有匹配结果
            return pageMatches;
        });

        allResults = [...navMatches, ...contentMatches];

        // 3. 按范围过滤
        switch (scope) {
            case 'group':
                const activePageId = document.querySelector('.page-content.active')?.id;
                const activeGroup = this.index.find(i => i.pageId === activePageId)?.navGroupName;
                if (activeGroup) {
                    allResults = allResults.filter(r => r.navGroupName === activeGroup);
                }
                break;
            case 'current':
                const currentPageId = document.querySelector('.page-content.active')?.id;
                allResults = allResults.filter(r => r.pageId === currentPageId);
                break;
        }

        // 4. 按得分排序
        allResults.sort((a, b) => b.score - a.score);

        // 5. 去重（同一页面只保留最高分一条 + 内容聚合）
        const seenPages = new Set();
        const finalResults = [];
        allResults.forEach(result => {
            if (result.type === 'nav') {
                finalResults.push(result);
            } else {
                if (!seenPages.has(result.pageId)) {
                    seenPages.add(result.pageId);
                    // 聚合该页所有匹配
                    const pageMatches = allResults.filter(r => r.pageId === result.pageId && r.type === 'content');
                    result.aggregated = pageMatches;
                    finalResults.push(result);
                }
            }
        });

        // 6. 渲染
        this.renderResults(finalResults, query);
    }

    renderResults(results, query) {
        const container = document.getElementById('pfdsSearchResults');
        if (!container) return;

        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<div class="pfds-search-empty">未找到匹配结果</div>';
            container.classList.add('active');
            return;
        }

        // 分组渲染
        let hasNav = results.some(r => r.type === 'nav');
        let hasContent = results.some(r => r.type === 'content');

        if (hasNav) {
            const sec = document.createElement('div');
            sec.className = 'pfds-search-section';
            sec.textContent = '导航匹配';
            container.appendChild(sec);

            results.filter(r => r.type === 'nav').forEach(result => {
                const item = this.createResultItem(result, query);
                container.appendChild(item);
            });
        }

        if (hasContent) {
            const sec = document.createElement('div');
            sec.className = 'pfds-search-section';
            sec.textContent = '内容匹配';
            container.appendChild(sec);

            results.filter(r => r.type === 'content').forEach(result => {
                if (result.aggregated) {
                    // 聚合展示
                    const mainItem = this.createResultItem(result, query);
                    container.appendChild(mainItem);

                    // 展开子项（可选：点击展开）
                    const subList = document.createElement('div');
                    subList.style.paddingLeft = '20px';
                    subList.style.fontSize = '13px';
                    result.aggregated.slice(1).forEach(sub => {
                        const subItem = this.createResultItem(sub, query, true);
                        subList.appendChild(subItem);
                    });
                    if (result.aggregated.length > 1) {
                        const toggle = document.createElement('div');
                        toggle.className = 'pfds-search-toggle';
                        toggle.textContent = `+${result.aggregated.length - 1} 处匹配`;
                        toggle.onclick = (e) => {
                            e.stopPropagation();
                            if (subList.style.display === 'none') {
                                subList.style.display = 'block';
                                toggle.textContent = '收起';
                            } else {
                                subList.style.display = 'none';
                                toggle.textContent = `+${result.aggregated.length - 1} 处匹配`;
                            }
                        };
                        mainItem.appendChild(toggle);
                    }
                    mainItem.appendChild(subList);
                    subList.style.display = 'none';
                } else {
                    const item = this.createResultItem(result, query);
                    container.appendChild(item);
                }
            });
        }

        container.classList.add('active');
    }

    createResultItem(result, query, isSubItem = false) {
        const item = document.createElement('div');
        item.className = isSubItem ? 'pfds-search-subitem' : 'pfds-search-item';
        
        // 高亮匹配文本
        const highlightText = (text) => {
            if (!query) return text;
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\\]\\$]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<em>$1</em>');
        };

        let titlePath = '';
        if (result.titlePath && result.titlePath.length > 0) {
            titlePath = result.titlePath.join(' > ');
        } else if (result.navGroupName) {
            titlePath = `${result.navGroupName} > ${result.navItemText}`;
        } else {
            titlePath = result.pageTitle || result.navItemText;
        }

        const pathDiv = document.createElement('div');
        pathDiv.className = 'pfds-search-path';
        pathDiv.innerHTML = highlightText(titlePath);

        let contentDiv;
        if (result.snippet) {
            contentDiv = document.createElement('div');
            contentDiv.className = 'pfds-search-content';
            contentDiv.innerHTML = highlightText(result.snippet);
        }

        item.appendChild(pathDiv);
        if (contentDiv) item.appendChild(contentDiv);

        // 点击事件
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 关闭搜索模态框
            const modal = document.getElementById('pfds-searchModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // 切换页面
            if (typeof window.pfdsShowPage === 'function') {
                window.pfdsShowPage(result.pageId);
            }
            
            // 滚动到元素
            if (result.element) {
                setTimeout(() => {
                    result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 高亮元素
                    result.element.classList.add('pfds-highlight');
                    setTimeout(() => {
                        result.element.classList.remove('pfds-highlight');
                    }, 3000);
                }, 300);
            }
        });

        return item;
    }

    clearSearchResults() {
        const container = document.getElementById('pfdsSearchResults');
        if (container) {
            container.innerHTML = '';
            container.classList.remove('active');
        }
    }

    // 公共方法，供外部调用
    static getInstance() {
        if (!PFDSGlobalSearch.instance) {
            PFDSGlobalSearch.instance = new PFDSGlobalSearch();
        }
        return PFDSGlobalSearch.instance;
    }
}

// 智能搜索模块
const smartSearchModule = {
    init: function() {
        // console.log('[智能搜索] 初始化开始');
        
        // 定义初始化函数
        function initSmartSearch() {
            // console.log('[智能搜索] initSmartSearch函数被调用');
            
            // 获取搜索输入框
            const searchInput = document.getElementById('pfds-searchInput');
            if (!searchInput) {
                // console.warn('[智能搜索] 缺少搜索输入框元素');
                return;
            }
            
            // console.log('[智能搜索] 搜索输入框已找到');
            
            // 绑定输入事件
            searchInput.addEventListener('input', function() {
                // console.log('[智能搜索] 搜索输入变化');
                handleSearchInput(this.value);
            });
            
            // console.log('[智能搜索] 事件监听器绑定完成');
        }
        
        // 处理搜索输入
        function handleSearchInput(query) {
            // console.log('[智能搜索] handleSearchInput函数被调用，查询:', query);
            
            // 清空现有搜索结果
            clearSearchResults();
            
            // 如果查询为空，直接返回
            if (!query.trim()) {
                return;
            }
            
            // 执行智能搜索
            performSmartSearch(query);
        }
        
        // 清空搜索结果
        function clearSearchResults() {
            // console.log('[智能搜索] clearSearchResults函数被调用');
            const searchResults = document.getElementById('pfds-searchResults');
            if (searchResults) {
                searchResults.innerHTML = '';
            }
        }
        
        // 执行智能搜索
        function performSmartSearch(query) {
            // console.log('[智能搜索] performSmartSearch函数被调用，查询:', query);
            
            // 这里应该实现实际的智能搜索逻辑
            // 目前我们只是模拟搜索结果
            simulateSmartSearch(query);
        }
        
        // 模拟智能搜索（实际项目中应替换为真实搜索逻辑）
        function simulateSmartSearch(query) {
            // console.log('[智能搜索] simulateSmartSearch函数被调用，查询:', query);
            
            // 模拟搜索延迟
            setTimeout(() => {
                const searchResults = document.getElementById('pfds-searchResults');
                if (!searchResults) return;
                
                // 模拟搜索结果
                const mockResults = [
                    { title: '智能搜索结果1', content: '这是与"' + query + '"相关的智能搜索结果1' },
                    { title: '智能搜索结果2', content: '这是与"' + query + '"相关的智能搜索结果2' },
                    { title: '智能搜索结果3', content: '这是与"' + query + '"相关的智能搜索结果3' }
                ];
                
                // 生成搜索结果HTML
                let resultsHTML = '';
                mockResults.forEach(result => {
                    resultsHTML += `
                        <div class="pfds-search-result-item">
                            <h3 class="pfds-search-result-title">${result.title}</h3>
                            <p class="pfds-search-result-content">${result.content}</p>
                        </div>
                    `;
                });
                
                searchResults.innerHTML = resultsHTML;
                // console.log('[智能搜索] 搜索结果已更新');
            }, 300); // 模拟网络延迟
        }
        
        // 页面加载完成后初始化智能搜索
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initSmartSearch);
        } else {
            // 如果文档已经加载完成，则立即执行初始化
            initSmartSearch();
        }
        
        // console.log('[智能搜索] 模块初始化完成');
    }
};

// 模块导出
const searchModule = {
    PFDSGlobalSearch,
    init: function() {
        // 初始化全局搜索实例
        PFDSGlobalSearch.getInstance();
    }
};

return searchModule;
    })());

    // 模块: 菜单
    registerModule('菜单', (function() {
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
    })());

    // 模块: 阅读进度条
    registerModule('阅读进度条', (function() {
        // 阅读进度条模块
const progressBarModule = {
    init: function() {
        document.addEventListener('DOMContentLoaded', function() {
            const progressBar = document.getElementById('pfds-progressBar');
            const contentMain = document.querySelector('.pfds-content-main');

            function updateProgress() {
                // 获取当前活动页面
                const activePage = document.querySelector('.pfds-page-content.pfds-active');
                if (!activePage) return;

                // 获取活动页面的滚动容器
                const scrollContainer = activePage.closest('.pfds-content-main');
                if (!scrollContainer) return;

                // 计算滚动进度
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                const progress = (scrollTop / scrollHeight) * 100;

                // 更新进度条宽度
                progressBar.style.width = isNaN(progress) ? '0%' : Math.min(Math.max(progress, 0), 100) + '%';
            }

            // 监听所有页面内容的滚动事件
            if (contentMain) {
                contentMain.addEventListener('scroll', updateProgress);
            }

            // 监听页面切换事件
            window.addEventListener('pfds-showPage', function(event) {
                // 重置进度条到0%
                if (progressBar) {
                    progressBar.style.width = '0%';
                }

                // 获取目标页面并滚动到顶部
                const targetPageId = event.detail.pageId;
                const targetPage = document.getElementById(targetPageId);
                if (targetPage) {
                    // 确保在下一帧滚动到顶部
                    requestAnimationFrame(() => {
                        const contentMain = targetPage.closest('.pfds-content-main');
                        if (contentMain) {
                            contentMain.scrollTop = 0;
                        }
                    });
                }
            });

            // 初始更新进度条
            updateProgress();
        });
    }
};

return progressBarModule;
    })());

    // 模块: 页面导航
    registerModule('页面导航', (function() {
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
    })());

    // 模块: public-script
    registerModule('public-script', (function() {
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
    })());

    // 启动所有模块
    document.addEventListener('DOMContentLoaded', function() {
       // console.log('[模块系统] DOM加载完成，初始化所有模块');
        initModules();
    });
    
    // 将模块系统暴露到全局作用域，便于调试
    window.PFDSModules = {
        get: getModule,
        init: initModules
    };
    
   // console.log('[模块系统] 模块系统初始化完成');
})();

// 确保PFDS_DYNAMIC_LOAD对象存在
window.PFDS_DYNAMIC_LOAD = window.PFDS_DYNAMIC_LOAD || {};
//console.log('[模块系统] PFDS_DYNAMIC_LOAD对象初始化完成，当前内容:', window.PFDS_DYNAMIC_LOAD);
