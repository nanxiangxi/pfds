// views/css.js

const fs = require('fs/promises');
const path = require('path');

const { CONFIG, utils } = require('../context');

/**
 * 处理 CSS 的作用域，并根据配置决定是否提取样式到文件
 * @param {string} content - 原始 HTML 内容
 * @param {string} scopeClass - 作用域名
 * @param {string} pageId - 页面 ID
 * @param {boolean} initCssAutoLoad - 是否启用自动 CSS 提取
 * @returns {Promise<string>} 处理后的 HTML 内容
 */
module.exports = async function applyScopedCSS(content, scopeClass, pageId, initCssAutoLoad) {
    let extractedCSS = '';

    const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

    // 替换 <style> 标签内容并提取 CSS
    const htmlContent = content.replace(styleRegex, (match, styleContent) => {
        const scopedCSS = styleContent
            .split('}')
            .filter(rule => rule.trim())
            .map(rule => {
                const [selectors, declarations] = rule.split('{').map(part => part.trim());
                const scopedSelectors = selectors
                    .split(',')
                    .map(sel => `.${scopeClass} ${sel.trim()}`)
                    .join(', ');
                return `${scopedSelectors} {${declarations}}`;
            })
            .join('\n');

        extractedCSS += scopedCSS + '\n';

        // 如果启用提取，则从 HTML 中移除 <style>
        if (initCssAutoLoad) {
            return ''; // 删除原始 style 标签
        } else {
            return `<style>\n${scopedCSS}\n</style>`; // 返回修改后的内容（带作用域）
        }
    });

    const assetsCSSDir = path.join(CONFIG.OUTPUT_DIR, 'assets', 'css');
    const cssFilename = `css-${pageId}.css`;
    const cssFilePath = path.join(assetsCSSDir, cssFilename);

    // ✅ 无论 extractedCSS 是否为空，都写入文件
    if (!(await utils.existsSync(assetsCSSDir))) {
        await utils.mkdir(assetsCSSDir, { recursive: true });
    }

    await utils.writeFile(cssFilePath, extractedCSS);

    // 如果 initCssAutoLoad === false，则不需要插入额外标签，因为已保留在 HTML 中
    return htmlContent;
};