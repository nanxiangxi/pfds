// 引入日志模块
const logger = require('./log');
logger.configure({ color: true, level: 'info' });

// 初始化日志
logger.title('启动开发模式...');

// 原有依赖导入保持不变
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
        logger.error('无法加载 node-fetch，请确保已安装:', err.message);
        process.exit(1);
    }
})();

// 配置路径
const CONFIG = {
    DEV_DIR: path.resolve(process.cwd(), 'dev'),
    OUTPUT_DIR: path.resolve(process.cwd(), 'output'),
    TEMPLATE_DIR: path.resolve(process.cwd(), 'dev/template'),
    ASSETS_DIR: path.resolve(process.cwd(), 'dev/assets'),
    MODULES_DIR: path.resolve(process.cwd(), 'core/modules'),
    THEME_DIR: path.resolve(process.cwd(), 'core/themes')
};

// 初始化构建环境
async function initBuildEnvironment() {
    logger.stepStart('构建环境初始化');

    const dirs = [
        CONFIG.OUTPUT_DIR,
        path.join(CONFIG.OUTPUT_DIR, 'assets'),
        path.join(CONFIG.OUTPUT_DIR, 'assets', 'css'),
        path.join(CONFIG.OUTPUT_DIR, 'assets', 'js')
    ];

    for (let dir of dirs) {
        if (!existsSync(dir)) {
            await mkdir(dir, { recursive: true });
            logger.subStep(`创建目录: ${dir}`, 'success');
        } else {
            logger.subStep(`目录已存在: ${dir}`, 'success');
        }
    }

    logger.stepEnd('构建环境初始化');
}

// 读取配置文件
async function readConfig() {
    logger.stepStart('配置加载');

    // 读取头部配置
    const headPath = path.join(CONFIG.DEV_DIR, 'head.json');
    let headConfig = [];

    if (existsSync(headPath)) {
        try {
            const data = await readFile(headPath, 'utf-8');
            headConfig = JSON.parse(data).head || [];
            logger.subStep('头部配置', 'success');
        } catch (error) {
            logger.subStep('头部配置解析失败', 'error');
        }
    } else {
        logger.subStep('头部配置文件未找到', 'warn');
    }

    // 读取全局配置
    const configPath = path.join(CONFIG.DEV_DIR, 'pfds.json');
    const data = await readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    logger.subStep('全局配置', 'success');

    // 读取路由配置
    const routePath = path.join(CONFIG.DEV_DIR, 'router.json');
    const routeData = await readFile(routePath, 'utf-8');
    const routes = JSON.parse(routeData).routes;
    logger.subStep('路由解析', 'success');

    logger.stepEnd('配置加载');
    return { config, routes, headConfig };
}

// 生成侧边栏导航
function generateNav(routes) {
    logger.stepStart('导航生成');

    let navHTML = '<ul>\n';
    routes.forEach((route, index) => {
        const activeClass = index === 0 ? 'active' : '';
        navHTML += `    <li><a href="#" onclick="showPage('${route.id}')" id="nav-${route.id}" class="${activeClass}">${route.title}</a></li>\n`;
    });
    navHTML += '</ul>';

    logger.subStep('导航结构构建完成', 'success');
    logger.stepEnd('导航生成');
    return navHTML;
}

// 处理视图文件
async function processViews(routes) {
    logger.stepStart('视图处理');
    let viewsHTML = '';

    for (let route of routes) {
        const viewPath = path.join(CONFIG.DEV_DIR, 'views', route.file);
        if (!existsSync(viewPath)) {
            throw new Error(`视图文件不存在: ${viewPath}`);
        }

        let content = await readFile(viewPath, 'utf-8');
        const viewScopeClass = `view-scope-${route.id}`;

        // CSS作用域限定
        const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
        content = content.replace(styleRegex, (match, styleContent) => {
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

        // 包裹视图内容
        const className = routes[0].id === route.id
            ? `page-content active ${viewScopeClass}`
            : `page-content ${viewScopeClass}`;

        viewsHTML += `<div id="${route.id}" class="${className}">\n${content.trim()}\n</div>\n\n`;
        logger.subStep(`${route.file} → CSS 隔离完成`, 'success');
    }

    logger.stepEnd('视图处理');
    return viewsHTML;
}

// 处理CSS文件
async function processCSS(templateContent, config) {
    logger.stepStart('样式合并');

    let cssContent = '';

    // 提取<link>标签
    const linkRegex = /<link[^>]+href=(?:"|')([^"']+\.(?:css))(?:'|")/gi;
    let match;

    while ((match = linkRegex.exec(templateContent)) !== null) {
        const href = match[1];

        if (href.startsWith('http')) {
            logger.subStep(`远程 CSS: ${href}`);
            try {
                const response = await fetch(href);
                if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);

                const remoteCSS = await response.text();
                cssContent += `\n/* Remote CSS: ${href} */\n${remoteCSS}`;
                logger.subStep(`远程 CSS: ${href}`, 'success');
            } catch (err) {
                logger.subStep(`远程 CSS: ${href}`, 'error');
                throw new Error(`下载远程 CSS 失败: ${href}\n错误: ${err.message}`);
            }
        } else {
            const cssPath = path.join(CONFIG.ASSETS_DIR, 'css', href);

            if (existsSync(cssPath)) {
                const data = await readFile(cssPath, 'utf-8');
                cssContent += `\n/* Local CSS: ${href} */\n${data}`;
                logger.subStep(`本地 CSS: ${href}`, 'success');
            } else {
                logger.subStep(`CSS 文件不存在: ${href}`, 'error');
                throw new Error(`所需 CSS 文件不存在: ${cssPath}`);
            }
        }
    }

    // 提取内联样式
    const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch;

    while ((styleMatch = styleRegex.exec(templateContent)) !== null) {
        cssContent += `\n/* 内联样式 */\n${styleMatch[1]}`;
        logger.subStep('内联样式', 'success');
    }

    // 添加主题CSS
    const themeCssPath = path.join(CONFIG.THEME_DIR, `${config.theme}.css`);
    if (existsSync(themeCssPath)) {
        const themeData = await readFile(themeCssPath, 'utf-8');
        cssContent += `\n/* 主题样式 (${config.theme}) */\n${themeData}`;
        logger.subStep(`应用主题: ${config.theme}`, 'success');
    } else {
        logger.subStep(`主题样式: ${config.theme}.css`, 'error');
        throw new Error(`主题 CSS 文件未找到: ${themeCssPath}`);
    }

    // 输出合并后的CSS
    const outputCssPath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'css', 'main.css');
    await writeFile(outputCssPath, cssContent);
    logger.subStep('样式表输出完成', 'success');

    logger.stepEnd('样式合并');

    return cssContent;
}

// 合并JS模块
async function mergeModules() {
    logger.stepStart('JS 模块打包');

    const files = await readdir(CONFIG.MODULES_DIR);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    let modulesJS = '';
    for (let file of jsFiles) {
        const filePath = path.join(CONFIG.MODULES_DIR, file);
        const content = await readFile(filePath, 'utf-8');
        const strippedContent = content.replace(/export\s+function/g, 'function');
        modulesJS += `\n// === ${file} ===\n${strippedContent}\n`;
        logger.subStep(`加载模块: ${file}`, 'success');
    }

    // 添加初始化调用
    const initCalls = `
// 初始化模块
initHighlight();
initModal();
initNavigation();
initScroll();
initSearch();
`;
    modulesJS += initCalls;
    logger.subStep('模块初始化注入', 'success');

    const outputJsPath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js', 'modules.js');
    await writeFile(outputJsPath, modulesJS);
    logger.subStep('模块打包完成', 'success');

    logger.stepEnd('JS 模块打包');
}

// 生成头部链接
function generateHeadLinks(headItems) {
    logger.stepStart('头部链接生成');
    let linksHTML = '';

    if (headItems.length > 0) {
        headItems.forEach(item => {
            linksHTML += `      <a href="${item.url}">${item.title}</a>\n`;
        });
    }

    logger.subStep(`生成 ${headItems.length} 个链接`, 'success');
    logger.stepEnd('头部链接生成');
    return linksHTML;
}

// 生成最终HTML
async function generateFinalHTML(templateContent, config, navHTML, viewsHTML, isDev = true) {
    logger.stepStart('最终HTML 构建');

    // 替换模板变量
    let html = templateContent.replace(/{{siteTitle}}/g, config.siteTitle);
    logger.subStep('替换模板变量', 'success');

    // 移除DEV_ONLY块
    if (!isDev) {
        const devOnlyRegex = /<!-- DEV_ONLY_START -->[\s\S]*?<!-- DEV_ONLY_END -->/gi;
        html = html.replace(devOnlyRegex, '');
    }

    // 移除CSS引用
    html = html.replace(/<link\b[^>]*href\s*=\s*(["'])(?!https?:\/\/)[^"']*\.css\1[^>]*>(?:<\/link>)?/gi, '');
    html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '');

    // 插入新CSS
    html = html.replace('</head>', '    <link rel="stylesheet" href="assets/css/main.css">\n</head>');
    logger.subStep('注入样式表链接', 'success');

    // 插入头部链接
    const headLinks = generateHeadLinks(config.head);
    html = html.replace('<!-- HEAD_LINKS_PLACEHOLDER -->', headLinks);
    logger.subStep('生成 头部导航', 'success');

    // 插入导航
    html = html.replace('<!-- NAV_PLACEHOLDER -->', navHTML);
    logger.subStep('生成侧栏导航', 'success');

    // 插入内容
    html = html.replace('<!-- CONTENT_PLACEHOLDER -->', viewsHTML);
    logger.subStep('生成首页 index.html', 'success');

    // 写入文件
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'index.html');
    await writeFile(outputPath, html);
    logger.subStep('HTML文档持久化', 'success');

    logger.stepEnd('最终HTML 构建');

    return html;
}

// 主函数
async function build(isDev = true) {
    try {
        await initBuildEnvironment();

        // 读取配置
        const { config, routes, headConfig } = await readConfig();
        config.head = headConfig;

        // 读取模板
        const templatePath = path.join(CONFIG.TEMPLATE_DIR, config.template);
        const templateContent = await readFile(templatePath, 'utf-8');

        // 生成导航
        const navHTML = generateNav(routes);

        // 处理视图
        const viewsHTML = await processViews(routes);

        // 处理CSS
        await processCSS(templateContent, config);

        // 合并模块
        await mergeModules();

        // 生成HTML
        await generateFinalHTML(templateContent, config, navHTML, viewsHTML, isDev);

        // 显示服务信息
        if (isDev) {

        } else {
            logger.success('✅ 构建成功完成！');
            logger.info(`🚀 文件已生成在: ${CONFIG.OUTPUT_DIR}`);
        }
    } catch (error) {
        logger.error(`构建失败: ${error.message}`);
        process.exit(1);
    }
}

// 导出构建函数
exports.build = build;
