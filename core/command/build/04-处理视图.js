const path = require('path');
const { CONFIG, shared, utils } = require('./context');
const applyMarkdownPlugins = require('./markdown'); // 引入自动加载模块
module.exports = async () => {
    shared.logger.stepStart('视图处理');
    let viewsHTML = '';

    for (const route of shared.routes) {
        const viewPath = path.join(CONFIG.DEV_DIR, 'views', route.file);
        if (!utils.existsSync(viewPath)) {
            throw new Error(`视图文件不存在: ${viewPath}`);
        }

        let content = await utils.readFile(viewPath, 'utf-8');

        /*----------------------------------------markdown开始----------------------------------------*/
        content = applyMarkdownPlugins(content);
        /*----------------------------------------markdown结束----------------------------------------*/

        const viewScopeClass = `view-scope-${route.id}`;

        // CSS 作用域处理
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
        const className = shared.routes[0].id === route.id
            ? `page-content active ${viewScopeClass}`
            : `page-content ${viewScopeClass}`;

        viewsHTML += `<div id="${route.id}" class="${className}">\n${content.trim()}\n</div>\n\n`;
        shared.logger.subStep(`${route.file} → CSS 隔离完成`, 'success');
    }

    shared.viewsHTML = viewsHTML;
    shared.logger.stepEnd('视图处理');
};