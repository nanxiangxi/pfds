const path = require('path');
const { CONFIG, shared, utils } = require('./context');

module.exports = async () => {
    shared.logger.stepStart('JS 模块打包');

    const files = await utils.readdir(CONFIG.MODULES_DIR);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    let modulesJS = '';
    for (const file of jsFiles) {
        const filePath = path.join(CONFIG.MODULES_DIR, file);
        const content = await utils.readFile(filePath, 'utf-8');
        const strippedContent = content.replace(/export\s+function/g, 'function');
        modulesJS += `\n// === ${file} ===\n${strippedContent}\n`;
        shared.logger.subStep(`加载模块: ${file}`, 'success');
    }

    // 添加初始化调用（条件判断）
    const initFunctions = [
        'initHighlight',
        'initModal',
        'initNavigation',
        'initScroll',
        'initSearch',
        'initJsAutoLoad',
        'initJsIsolation',
        'initHamburgerMenu',
        'initPageAnchors',
        'initCopyCode'

    ];

    if (shared.config.initCssAutoLoad) {
        initFunctions.push('initCssAutoLoad');
    }

    modulesJS += `\n// 初始化模块\n${initFunctions.map(fn => `${fn}();`).join('\n')}\n`;

    const outputJsPath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js', 'modules.js');
    await utils.writeFile(outputJsPath, modulesJS);
    shared.modulesJS = modulesJS;

    shared.logger.stepEnd('JS 模块打包');
};