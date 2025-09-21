const path = require('path');
const handlebars = require('handlebars');
const { CONFIG, shared, utils } = require('./context');

// 注册一个安全字符串助手，用于避免HTML被转义
handlebars.registerHelper('safeString', function(str) {
    return new handlebars.SafeString(str);
});

module.exports = async () => {
    shared.logger.stepStart('最终HTML构建');

    // 获取当前时间，格式化为 YYYY-MM-DD HH:mm:ss
    const buildTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\//g, '-'); // 替换斜杠为短横线

    // 根据配置决定是否启用主题切换功能
    let templateContent = shared.templateContent;
    
    // 检查模板内容是否存在
    if (!templateContent) {
        shared.logger.error('模板内容为空，请检查模板文件是否正确加载');
        throw new Error('模板内容为空');
    }
    
    // 确保模板内容是字符串
    if (typeof templateContent !== 'string') {
        shared.logger.warn('模板内容不是字符串，尝试转换为字符串');
        templateContent = String(templateContent);
    }
    
    // 处理预声明内容
    let preDeclarationContent = '';
    let enablePreDeclaration = false;
    // 修复预声明配置读取逻辑，从根配置读取而不是header中读取
    if (shared.config['pre-declaration'] && shared.config['pre-declaration'].enable) {
        preDeclarationContent = shared.config['pre-declaration'].content || '';
        enablePreDeclaration = true;
    }
    
    // 如果未启用预声明区域，则移除相关HTML结构
    if (!enablePreDeclaration) {
        templateContent = templateContent.replace(/<!-- PFDS_PRE_DECLARATION_START -->[\s\S]*?<!-- PFDS_PRE_DECLARATION_END -->/, '');
    }
    
    // 处理搜索部分
    let searchSection = '';
    let mobileSearchSection = ''; // 添加移动端搜索区域
    let hasSearch = false;
    if (shared.config.header && shared.config.header.search) {
        searchSection = `
<div class="pfds-header-search" id="pfds-headerSearch">
    <i class="icon-search"></i>
    <span class="pfds-header-search-text">搜索 / SEARCCH</span>
</div>`;
        
        // 为移动端创建一个独立的搜索区域
        mobileSearchSection = `
<div class="pfds-header-search" id="pfds-mobileSearch">
    <i class="icon-search"></i>
    <span class="pfds-header-search-text">搜索 / SEARCCH</span>
</div>`;
        
        hasSearch = true;
    }
    
    // 处理主题切换部分
    let themeToggleSection = '';
    let hasThemeToggle = false;
    if (shared.config.header && shared.config.header.themeToggle) {
        themeToggleSection = `
<div class="pfds-theme-toggle">
    <label class="pfds-theme-toggle__label" for="pfds-themeSwitch">主题</label>
    <button class="pfds-theme-toggle__button" type="button" id="pfds-themeSwitch" title="主题切换" aria-label="浅色主题">
        <span class="pfds-theme-toggle__button-wrap">
            <span class="pfds-theme-toggle__shadow"></span>
            <span class="pfds-theme-toggle__shadow"></span>
            <span class="pfds-theme-toggle__inner">
                <span class="pfds-theme-toggle__options">
                    <span class="pfds-theme-toggle__option-label" aria-hidden="true">D</span>
                    <span class="pfds-theme-toggle__option-sep"></span>
                    <span class="pfds-theme-toggle__option-label" aria-hidden="true">L</span>
                </span>
            </span>
        </span>
    </button>
</div>`;
        hasThemeToggle = true;
    }
    
    // 处理多语言部分
    let multilingualSection = '';
    let hasMultilingual = false;
    let defaultLanguage = '语言'; // 默认显示文本
    
    if (shared.config.multilingual && shared.config.multilingual.enable && 
        shared.config.multilingual.languages && Array.isArray(shared.config.multilingual.languages) && 
        shared.config.multilingual.languages.length > 0) {
        hasMultilingual = true;
        
        // 设置默认语言为第一个语言的code
        if (shared.config.multilingual.languages.length > 0) {
            defaultLanguage = shared.config.multilingual.languages[0].code || '语言';
        }
        
        // 检查是否配置了默认语言
        if (shared.config.multilingual.defaultLanguage) {
            defaultLanguage = shared.config.multilingual.defaultLanguage;
        }
        
        const languages = shared.config.multilingual.languages.map(lang => {
            // 下拉列表中显示name，data属性中保存code和name
            return `<a href="#" class="pfds-multilingual-option" data-lang="${lang.code}" data-name="${lang.name}">${lang.name}</a>`;
        }).join('');
        
        // 使用JavaScript动态设置默认语言，而不是静态HTML
        multilingualSection = `
<div class="pfds-multilingual">
    <div class="pfds-multilingual-toggle">
        <span class="pfds-multilingual-current">${defaultLanguage}</span>
        <i class="pfds-multilingual-icon icon-chevron-down"></i>
    </div>
    <div class="pfds-multilingual-dropdown">
        ${languages}
    </div>
</div>
<script>
  // 页面加载时从localStorage恢复用户选择的语言
  document.addEventListener('DOMContentLoaded', function() {
    const savedLanguage = localStorage.getItem('preferredLanguage') || '${defaultLanguage}';
    const currentLangElement = document.querySelector('.pfds-multilingual-current');
    if (currentLangElement) {
      currentLangElement.textContent = savedLanguage;
    }
  });
</script>`;
    }
    
    // 准备多语言配置用于模板注入
    let multilingualConfig = '[]';
    if (shared.config.multilingual && shared.config.multilingual.languages) {
        multilingualConfig = JSON.stringify(shared.config.multilingual.languages);
    }

    // 处理头部链接部分
    let headLinksHTML = '';
    let hasHeadLinks = false;
    if (shared.config.header && shared.config.header.head && Array.isArray(shared.config.header.head)) {
        hasHeadLinks = shared.config.header.head.length > 0;
        const headLinks = shared.config.header.head.map(link => {
            // 检查是否有子菜单
            if (link.children && Array.isArray(link.children) && link.children.length > 0) {
                // 有子菜单的链接
                const childrenHTML = link.children.map(child => {
                    return `<a href="${child.url}" target="_blank">${child.title}</a>`;
                }).join('');
                
                return `
<div class="pfds-header-dropdown">
    <span class="pfds-header-dropdown-title">${link.title}</span>
    <div class="pfds-header-dropdown-content">
        ${childrenHTML}
    </div>
</div>`;
            } else if (link.icon) {
                // 有图标的链接
                // 处理icon:前缀的图标引用
                let iconClass = link.icon;
                if (link.icon.startsWith('icon:')) {
                    iconClass = link.icon.substring(5); // 移除'icon:'前缀
                }
                // 为图标链接添加文字显示
                return `
<a class="pfds-header-link pfds-header-link-with-icon" href="${link.url}" target="_blank" title="${link.title}">
    <i class="icon-${iconClass}"></i>
    <span>${link.title}</span>
</a>`;
            } else {
                // 普通链接 - 添加文本链接的特殊类
                return `
<a class="pfds-header-link pfds-header-link-text" href="${link.url}" target="_blank">${link.title}</a>`;
            }
        });
        headLinksHTML = headLinks.join('\n');
    }
    
    // 处理logo
    let logo = shared.config.header?.logo || '';
    let logoClass = '';
    
    // 如果logo是图标引用，则使用CSS类
    if (typeof logo === 'string' && logo.startsWith('icon:')) {
        const iconName = logo.substring(5); // 移除 'icon:' 前缀
        logoClass = `icon-${iconName}`;
        logo = ''; // 清空logo URL，因为我们使用CSS类
    }
    // 如果logo是对象（来自本地文件引用），则提取实际的URL
    else if (typeof logo === 'object' && logo.url) {
        logo = logo.url;
    }
    // 如果logo是图标数组，则使用第一个图标的URL
    else if (typeof logo === 'object' && logo.icons && Array.isArray(logo.icons) && logo.icons.length > 0) {
        logo = logo.icons[0].url;
    }

    // 使用Handlebars模板引擎渲染
    const template = handlebars.compile(templateContent);
    const data = {
        title: shared.config.header?.title || 'PFDS文档',
        favicon: shared.config.header?.favicon || '',
        logo: logo,
        logoClass: logoClass,
        logoLink: shared.config.header?.logoLink || '#',
        logoTitle: shared.config.header?.logoTitle || 'PFDS文档',
        buildTime: buildTime,
        preDeclarationContent: preDeclarationContent,
        searchSection: searchSection,
        themeToggleSection: themeToggleSection,
        multilingualSection: multilingualSection,
        headLinksHTML: headLinksHTML,
        hasSearch: hasSearch,
        hasThemeToggle: hasThemeToggle,
        hasMultilingual: hasMultilingual,
        hasHeadLinks: hasHeadLinks,
        navHTML: shared.navHTML || '',
        viewsHTML: shared.viewsHTML || '',
        multilingualConfig: multilingualConfig,
        mobileSearchSection: mobileSearchSection // 添加移动端搜索区域
    };
    
    let html = template(data);

    // 清理开发专用内容
    if (!shared.isDev) {
        html = html.replace(/<!-- DEV_ONLY_START -->[\s\S]*?<!-- DEV_ONLY_END -->/g, '');
    }

    // 注入 CSS 链接
    html = html.replace(
        '</head>',
        '    <link rel="stylesheet" href="assets/css/main.css">\n</head>'
    );

    // 写入文件
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'index.html');
    await utils.writeFile(outputPath, html);

    shared.logger.subStep('HTML文档持久化', 'success');
    shared.logger.stepEnd('最终HTML构建');
};