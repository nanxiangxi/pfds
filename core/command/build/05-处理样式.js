const path = require('path');
const { CONFIG, shared, utils } = require('./context');

module.exports = async () => {
    shared.logger.stepStart('样式合并');
    let cssContent = '';

    // 处理远程和本地 CSS
    const linkRegex = /<link[^>]+href=(?:"|')([^"']+\.css)(?:'|")/gi;
    let match;

    while ((match = linkRegex.exec(shared.templateContent)) !== null) {
        const href = match[1];

        if (href.startsWith('http')) {
            try {
                const module = await import('node-fetch');
                const fetch = module.default;
                const response = await fetch(href);
                if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);

                const remoteCSS = await response.text();
                cssContent += `\n/* Remote CSS: ${href} */\n${remoteCSS}`;
                shared.logger.subStep(`远程 CSS: ${href}`, 'success');
            } catch (err) {
                shared.logger.subStep(`远程 CSS 加载失败: ${href}`, 'error');
                throw err;
            }
        } else {
            const cssPath = path.join(CONFIG.ASSETS_DIR, 'css', href);
            if (utils.existsSync(cssPath)) {
                const data = await utils.readFile(cssPath, 'utf-8');
                cssContent += `\n/* Local CSS: ${href} */\n${data}`;
                shared.logger.subStep(`本地 CSS: ${href}`, 'success');
            }
        }
    }

    // 处理主题样式
    const themeCssPath = path.join(CONFIG.THEME_DIR, `${shared.config.theme}.css`);
    if (utils.existsSync(themeCssPath)) {
        const themeData = await utils.readFile(themeCssPath, 'utf-8');
        cssContent += `\n/* 主题样式 (${shared.config.theme}) */\n${themeData}`;
        shared.logger.subStep(`应用主题: ${shared.config.theme}`, 'success');
    }

    // ✅ 新增图标样式处理
    const iconJsonPath = path.join(CONFIG.DEV_DIR, 'icon.json');
    if (utils.existsSync(iconJsonPath)) {
        try {
            const iconData = await utils.readFile(iconJsonPath, 'utf-8');
            const icons = JSON.parse(iconData).icons;

            if (icons && icons.length > 0) {
                // 每个图标类都包含完整样式
                icons.forEach(icon => {
                    const { name, url, width, height } = icon;
                    cssContent += `
.icon-${name} {
    display: inline-block;
    background-image: url('${url}');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    width: ${width}px;
    height: ${height}px;
}
`;
                    //shared.logger.subStep(`图标样式: ${name}`, 'success');
                });
            }
        } catch (err) {
            //shared.logger.subStep('图标配置解析失败', 'error');
            throw err;
        }
    }

    // 写入输出文件
    const outputCssPath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'css', 'main.css');
    await utils.writeFile(outputCssPath, cssContent);
    shared.cssContent = cssContent;

    shared.logger.stepEnd('样式合并');
};