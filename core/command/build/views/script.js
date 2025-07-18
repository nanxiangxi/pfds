// views/js.js
const fs = require('fs/promises');
const path = require('path');

const { CONFIG, shared, utils } = require('../context');

/**
 * 处理 <script> 标签并根据是否为 public 决定输出位置
 * @param {string} content - 原始 HTML 内容
 * @param {string} pageId - 页面 ID
 * @param {boolean} initJsAutoLoad - 是否启用自动 JS 提取（当前已不再使用该参数控制 script 标签插入）
 * @returns {Promise<string>} 处理后的 HTML 内容
 */
module.exports = async function applyScopedJS(content, pageId, initJsAutoLoad) {
    let privateJS = '';

    // 初始化 shared.publicJS（首次调用）
    if (!shared.publicJS) {
        shared.publicJS = '';
    }

    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;

    // 替换所有 <script> 标签内容并提取 JS
    const htmlContent = content.replace(scriptRegex, (match, attrs, scriptContent) => {
        const isPublic = attrs.includes('public');

        if (isPublic) {
            // 收集到 shared.publicJS
            shared.publicJS += `\n// From ${pageId}\n${scriptContent.trim()}\n`;
        } else {
            privateJS += `\n// From ${pageId}\n${scriptContent.trim()}\n`;
        }

        return ''; // 删除原始 <script> 标签
    });

    const assetsJSDir = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js');
    if (!(await utils.existsSync(assetsJSDir))) {
        await utils.mkdir(assetsJSDir, { recursive: true });
    }

    const privateFilename = `script-${pageId}.js`;
    const privateFilePath = path.join(assetsJSDir, privateFilename);

    // ✅ 无论 privateJS 是否为空，都写入文件
    await utils.writeFile(privateFilePath, privateJS);

    // ✅ 不再插入任何 <script> 标签，直接返回处理后的 HTML（没有脚本）
    return htmlContent;
};