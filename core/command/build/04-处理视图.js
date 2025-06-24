const path = require('path');
const { CONFIG, shared, utils } = require('./context');
const applyMarkdownPlugins = require('./markdown');
const applyScopedCSS = require('./views/css');
const applyScopedJS = require('./views/script'); // 引入 JS 隔离模块

module.exports = async () => {
    shared.logger.stepStart('视图处理');
    let viewsHTML = '';

    // 初始化共享的公共 JS 缓存
    shared.publicJS = '';

    for (const route of shared.routes) {
        const viewPath = path.join(CONFIG.DEV_DIR, 'views', route.file);
        if (!utils.existsSync(viewPath)) {
            throw new Error(`视图文件不存在: ${viewPath}`);
        }

        let content = await utils.readFile(viewPath, 'utf-8');

        /*----------------------------------------markdown开始----------------------------------------*/
        content = applyMarkdownPlugins(content);
        /*----------------------------------------markdown结束----------------------------------------*/

        /*----------------------------------------CSS作用域开始----------------------------------------*/
        const viewScopeClass = `view-scope-${route.id}`;
        const initCssAutoLoad = shared.config.initCssAutoLoad === true;
        content = await applyScopedCSS(content, viewScopeClass, route.id, initCssAutoLoad);
        /*----------------------------------------CSS作用域结束----------------------------------------*/

        /*----------------------------------------JS作用域开始----------------------------------------*/
        const initJsAutoLoad = shared.config.initJsAutoLoad === true;
        content = await applyScopedJS(content, route.id, initJsAutoLoad);
        /*----------------------------------------JS作用域结束----------------------------------------*/

        // 包裹视图内容
        const className = shared.routes[0].id === route.id
            ? `page-content active ${viewScopeClass}`
            : `page-content ${viewScopeClass}`;

        viewsHTML += `<div id="${route.id}" class="${className}">\n${content.trim()}\n</div>\n\n`;

        shared.logger.subStep(`${route.file} → JS 隔离 & 处理完成`, 'success');
    }

    // 所有视图处理完成后再统一写入 public-script.js（无论是否为空）
    const assetsJSDir = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js');
    const publicFilePath = path.join(assetsJSDir, 'public-script.js');

    // 确保目录存在
    if (!(await utils.existsSync(assetsJSDir))) {
        await utils.mkdir(assetsJSDir, { recursive: true });
    }

    // ✅ 无论 shared.publicJS 是否为空，都写入文件
    await utils.writeFile(publicFilePath, shared.publicJS || '');

    // 可选：根据是否有内容输出不同日志等级
    if (shared.publicJS && shared.publicJS.trim()) {
        shared.logger.subStep(`公共 JS 已写入: public-script.js`, 'success');
    } else {
        shared.logger.subStep(`公共 JS 文件已创建（空文件）: public-script.js`, 'info');
    }

    shared.viewsHTML = viewsHTML;
    shared.logger.stepEnd('视图处理');
};