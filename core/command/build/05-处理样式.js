const path = require('path');
const fs = require('fs').promises;
const { CONFIG, shared, utils } = require('./context');

module.exports = async () => {
    shared.logger.stepStart('样式处理');

    // 读取主题CSS文件
    const themePath = path.join(CONFIG.THEME_DIR, shared.config.theme + '.css');
    let themeCSS = '';
    
    try {
        themeCSS = await utils.readFile(themePath);
        shared.logger.subStep(`主题文件读取成功: ${shared.config.theme}`, 'success');
    } catch (err) {
        shared.logger.subStep(`主题文件读取失败: ${shared.config.theme}`, 'error');
        throw err;
    }

    // 处理图标生成CSS类
    let iconCSS = '';
    
    // 读取图标文件
    const iconFilePath = path.join(CONFIG.DEV_DIR, 'icon.json');
    try {
        const iconFileContent = await fs.readFile(iconFilePath, 'utf-8');
        const iconData = JSON.parse(iconFileContent);
        
        // 为所有图标生成CSS类
        if (iconData.icons && Array.isArray(iconData.icons)) {
            iconCSS = '\n/* 自动生成的图标样式 */\n';
            for (const icon of iconData.icons) {
                iconCSS += `
.icon-${icon.name} {
    display: inline-block;
    background-image: url('${icon.url}');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    width: ${icon.width || 20}px;
    height: ${icon.height || 20}px;
}`;
            }
        }
    } catch (error) {
        shared.logger.warn(`无法读取或处理图标文件: ${iconFilePath}`, 'warning');
    }

    // 读取PMD样式文件
    let pmdCSS = '';
    const pmdCSSPath = path.join(__dirname, 'pmd', 'styles.css');
    try {
        pmdCSS = await utils.readFile(pmdCSSPath, 'utf-8');
        shared.logger.subStep('PMD样式文件读取成功', 'success');
    } catch (err) {
        shared.logger.subStep('PMD样式文件读取失败', 'error');
        throw err;
    }

    // 合并CSS
    const finalCSS = themeCSS + iconCSS + '\n\n/* PMD 语法样式 */\n' + pmdCSS;

    // 确保输出目录存在
    const cssOutputDir = path.join(CONFIG.OUTPUT_DIR, 'assets', 'css');
    await utils.ensureDir(cssOutputDir);

    // 写入CSS文件
    const cssOutputPath = path.join(cssOutputDir, 'main.css');
    await utils.writeFile(cssOutputPath, finalCSS, 'utf-8');

    shared.logger.subStep('样式文件生成完成', 'success');
    shared.logger.stepEnd('样式处理');
};