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
    
    console.log(`[CSS处理诊断] 开始处理页面 ${pageId} 的CSS`);

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
        console.log(`[CSS处理诊断] 提取CSS内容，长度: ${scopedCSS.length}`);

        // 如果启用提取，则从 HTML 中移除 <style>
        if (initCssAutoLoad) {
            return ''; // 删除原始 style 标签
        } else {
            return `<style>\n${scopedCSS}\n</style>`; // 返回修改后的内容（带作用域）
        }
    });

    console.log(`[CSS处理诊断] 页面 ${pageId} 提取的CSS总长度: ${extractedCSS.length}`);
    
    // 只有在确实有CSS内容时才生成文件
    if (initCssAutoLoad && extractedCSS.trim()) {
        const assetsCSSDir = path.join(CONFIG.OUTPUT_DIR, 'assets', 'css');
        const cssFilename = `css-${pageId}.css`;
        const cssFilePath = path.join(assetsCSSDir, cssFilename);
        
        console.log(`[CSS处理诊断] 写入CSS文件: ${cssFilePath}`);

        if (!(await utils.existsSync(assetsCSSDir))) {
            await utils.mkdir(assetsCSSDir, { recursive: true });
        }

        await utils.writeFile(cssFilePath, extractedCSS);
    } else {
        console.log(`[CSS处理诊断] 不需要生成CSS文件，initCssAutoLoad: ${initCssAutoLoad}, CSS内容: ${extractedCSS.trim() ? '有' : '无'}`);
    }

    // 如果 initCssAutoLoad === false，则不需要插入额外标签，因为已保留在 HTML 中
    return htmlContent;
};