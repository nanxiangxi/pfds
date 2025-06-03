const fs = require('fs');
const path = require('path');
const util = require('util');

// Promisify fs methods
const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

// ✅ 引入 existsSync
const { existsSync } = require('fs');

// 动态导入 node-fetch（因为 node-fetch v3+ 是 ESM 模块）
let fetch;
(async () => {
    try {
        const module = await import('node-fetch');
        fetch = module.default;
    } catch (err) {
        console.error('❌ 无法加载 node-fetch，请确保已安装:', err.message);
        process.exit(1);
    }
})();

// 配置路径
const CONFIG = {
    DEV_DIR: path.resolve(process.cwd(), 'dev'), // 使用 process.cwd() 获取当前工作目录
    OUTPUT_DIR: path.resolve(process.cwd(), 'output'),
    TEMPLATE_DIR: path.resolve(process.cwd(), 'dev/template'),
    ASSETS_DIR: path.resolve(process.cwd(), 'dev/assets'),
    MODULES_DIR: path.resolve(process.cwd(), 'core/modules'),
    THEME_DIR: path.resolve(process.cwd(), 'core/themes') // 主题 CSS 路径
};


// 初始化构建环境
async function initBuildEnvironment() {
    console.log('🔧 正在初始化构建环境...');
    const dirs = [
        CONFIG.OUTPUT_DIR,
        path.join(CONFIG.OUTPUT_DIR, 'assets'),
        path.join(CONFIG.OUTPUT_DIR, 'assets', 'css'),
        path.join(CONFIG.OUTPUT_DIR, 'assets', 'js')
    ];

    for (let dir of dirs) {
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
            console.log(`📁 已创建目录: ${dir}`);
        }
    }
}

// 读取配置文件
async function readConfig() {
    console.log('⚙️ 正在读取全局配置文件...');
    const configPath = path.join(CONFIG.DEV_DIR, 'pfds.json');
    const data = await readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    console.log('📄 全局配置:', config);
    return config;
}

// 读取路由配置
async function readRoutes() {
    console.log('🧭 正在读取路由配置文件...');
    const routePath = path.join(CONFIG.DEV_DIR, 'router.json');
    const data = await readFile(routePath, 'utf-8');
    const routes = JSON.parse(data).routes;
    console.log('📄 路由配置:', routes);
    return routes;
}

// 生成侧栏导航 HTML
function generateNav(routes) {
    console.log('🧱 正在生成侧边栏导航...');
    let navHTML = `<ul>\n`;
    routes.forEach((route, index) => {
        const activeClass = index === 0 ? 'active' : '';
        navHTML += `    <li><a href="#" onclick="showPage('${route.id}')" id="nav-${route.id}" class="${activeClass}">${route.title}</a></li>\n`;
    });
    navHTML += '</ul>';
    return navHTML;
}

// 处理视图文件
// 处理视图文件并隔离 CSS
async function processViews(routes) {
    console.log('🖼️ 正在处理视图文件并隔离 CSS...');
    let viewsHTML = '';

    for (let route of routes) {
        const viewPath = path.join(CONFIG.DEV_DIR, 'views', route.file);
        if (!existsSync(viewPath)) {
            throw new Error(`❌ 视图文件不存在: ${viewPath}`);
        }

        let content = await readFile(viewPath, 'utf-8');

        // 为该视图内容添加唯一的 class 用于作用域限定
        const viewScopeClass = `view-scope-${route.id}`;

        // 查找 <style>...</style> 并进行作用域限定
        const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

        content = content.replace(styleRegex, (match, styleContent) => {
            // 对每条 CSS 规则加上前缀
            const scopedCSS = styleContent
                .split('}')
                .filter(rule => rule.trim())
                .map(rule => {
                    const [selectors, declarations] = rule.split('{').map(part => part.trim());
                    const scopedSelectors = selectors
                        .split(',')
                        .map(sel => `.${viewScopeClass} ${sel.trim()}`)
                        .join(', ');
                    return `${scopedSelectors} {${declarations}}`;
                })
                .join('\n');

            return `<style>\n${scopedCSS}\n</style>`;
        });

        // 包裹视图内容，增加作用域类名
        const className = routes[0].id === route.id ? `page-content active ${viewScopeClass}` : `page-content ${viewScopeClass}`;
        viewsHTML += `<div id="${route.id}" class="${className}">\n${content.trim()}\n</div>\n\n`;

        console.log(`✅ 已处理并隔离视图文件: ${route.file}`);
    }

    return viewsHTML;
}

// 处理主模板中的 CSS 引用（支持本地 + 远程）
async function processCSS(templateContent, config) {
    console.log('🎨 正在处理 CSS 文件...');
    let cssContent = '';

    // 提取 <link rel="stylesheet" href="custom.css"> 标签
    const linkRegex = /<link[^>]+href=(?:"|')([^"']+\.(?:css))(?:'|")/gi;
    let match;

    while ((match = linkRegex.exec(templateContent)) !== null) {
        const href = match[1];

        if (href.startsWith('http')) {
            // ✅ 处理远程 CSS
            console.log(`🌐 正在下载远程 CSS: ${href}`);
            try {
                const response = await fetch(href);
                if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);

                const remoteCSS = await response.text();
                cssContent += `\n/* Remote CSS: ${href} */\n${remoteCSS}`;
                console.log(`✅ 成功下载并合并远程 CSS: ${href}`);
            } catch (err) {
                throw new Error(`❌ 下载远程 CSS 失败: ${href}\n错误: ${err.message}`);
            }
        } else {
            // ✅ 处理本地 CSS
            const cssPath = path.join(CONFIG.ASSETS_DIR, 'css', href);

            if (existsSync(cssPath)) {
                const data = await readFile(cssPath, 'utf-8');
                cssContent += `\n/* Local CSS: ${href} */\n${data}`;
                console.log(`✅ 加载本地 CSS 文件: ${href}`);
            } else {
                throw new Error(`❌ 构建失败：所需 CSS 文件不存在: ${cssPath}`);
            }
        }
    }

    // 提取内联 <style>...</style>
    const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;

    while ((styleMatch = styleRegex.exec(templateContent)) !== null) {
        cssContent += `\n/* 内联样式 */\n${styleMatch[1]}`;
        console.log('✅ 提取到内联 CSS');
    }

    // 添加主题 CSS
    const themeCssPath = path.join(CONFIG.THEME_DIR, `${config.theme}.css`);
    if (existsSync(themeCssPath)) {
        const themeData = await readFile(themeCssPath, 'utf-8');
        cssContent += `\n/* 主题样式 (${config.theme}) */\n${themeData}`;
        console.log(`✅ 加载主题 CSS: ${config.theme}.css`);
    } else {
        throw new Error(`❌ 主题 CSS 文件未找到: ${themeCssPath}`);
    }

    // 输出合并后的 main.css
    const outputCssPath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'css', 'main.css');
    await writeFile(outputCssPath, cssContent);
    console.log(`✅ 合并 CSS 完成，写入: ${outputCssPath}`);

    return cssContent;
}

// 合并所有模块 JS 并添加初始化调用
async function mergeModules() {
    console.log('📦 正在合并 JS 模块...');

    const files = await readdir(CONFIG.MODULES_DIR);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    let modulesJS = '';
    for (let file of jsFiles) {
        const filePath = path.join(CONFIG.MODULES_DIR, file);
        const content = await readFile(filePath, 'utf-8');

        // 移除 export 关键字以避免语法错误（适用于浏览器直接执行）
        const strippedContent = content.replace(/export\s+function/g, 'function');

        modulesJS += `\n// === ${file} ===\n${strippedContent}\n`;
        console.log(`✅ 已合并模块: ${file}`);
    }

    // 添加初始化调用（直接追加到文件末尾）
    const initCalls = `
// 初始化模块
initHighlight();
initModal();
initNavigation();
initScroll();
initSearch();
`;

    modulesJS += initCalls;

    const outputJsPath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js', 'modules.js');
    await writeFile(outputJsPath, modulesJS);
    console.log(`✅ JS 模块已合并至: ${outputJsPath}`);
}

// 替换模板变量并生成最终 HTML
async function generateFinalHTML(templateContent, config, navHTML, viewsHTML, isDev = true) {
    console.log('🌐 正在生成最终 HTML...');

    // 替换 {{siteTitle}}
    let html = templateContent.replace(/{{siteTitle}}/g, config.siteTitle);

    // 🔧 仅在 build 模式下移除 DEV_ONLY 块
    if (!isDev) {
        const devOnlyRegex = /<!-- DEV_ONLY_START -->[\s\S]*?<!-- DEV_ONLY_END -->/gi;
        html = html.replace(devOnlyRegex, '');
    }


    // ✅ 完整移除所有 <link> 标签中包含 .css 的引用
    html = html.replace(/<link\b[^>]*href\s*=\s*(["'])(?!https?:\/\/)[^"']*\.css\1[^>]*>(?:<\/link>)?/gi, '');

    // ✅ 移除所有 <style>...</style> 内联样式块
    html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

    // 插入新 CSS
    html = html.replace('</head>', '    <link rel="stylesheet" href="assets/css/main.css">\n</head>');

    // 插入侧边栏
    html = html.replace('<!-- NAV_PLACEHOLDER -->', navHTML);

    // 插入页面内容
    html = html.replace('<!-- CONTENT_PLACEHOLDER -->', viewsHTML);

    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'index.html');
    await writeFile(outputPath, html);
    console.log(`✅ 最终 HTML 已生成: ${outputPath}`);
}

// 主函数 - 支持传入 isDev 参数
async function build(isDev = true) {
    try {
        await initBuildEnvironment();

        const config = await readConfig();
        const routes = await readRoutes();
        const navHTML = generateNav(routes);
        const viewsHTML = await processViews(routes);

        const templatePath = path.join(CONFIG.TEMPLATE_DIR, config.template);
        const templateContent = await readFile(templatePath, 'utf-8');

        await processCSS(templateContent, config);
        await mergeModules();
        await generateFinalHTML(templateContent, config, navHTML, viewsHTML,isDev);

        if (!isDev) {
            console.log('✅ 构建成功完成！');
            console.log(`🚀 文件已生成在: ${CONFIG.OUTPUT_DIR}`);
        } else {
            console.log('✅ 开发模式 HTML 已生成');
        }
    } catch (error) {
        console.error(`❌ 构建失败: ${error.message}`);
        process.exit(1);
    }
}
// 导出 build 函数，供外部调用
exports.build = build;