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