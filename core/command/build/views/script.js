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
    
    console.log(`[JS处理诊断] 开始处理页面 ${pageId} 的JS`);

    // 替换所有 <script> 标签内容并提取 JS
    const htmlContent = content.replace(scriptRegex, (match, attrs, scriptContent) => {
        const isPublic = attrs.includes('public');
        console.log(`[JS处理诊断] 发现脚本标签 - 公共脚本: ${isPublic}, 属性: ${attrs}`);

        if (isPublic) {
            // 收集到 shared.publicJS
            const publicScript = `\n// From ${pageId}\n${scriptContent.trim()}\n`;
            shared.publicJS += publicScript;
            console.log(`[JS处理诊断] 添加公共脚本，长度: ${publicScript.length}`);
            return ''; // 删除原始 <script> 标签
        } else {
            // 私有脚本收集到 privateJS
            const privateScript = `\n// From ${pageId}\n${scriptContent.trim()}\n`;
            privateJS += privateScript;
            console.log(`[JS处理诊断] 添加私有脚本，长度: ${privateScript.length}`);
            return ''; // 删除原始 <script> 标签
        }
    });

    console.log(`[JS处理诊断] 页面 ${pageId} 私有JS内容长度: ${privateJS.length}`);
    console.log(`[JS处理诊断] 页面 ${pageId} 公共JS内容总长度: ${shared.publicJS.length}`);

    // 只有在确实有私有JS内容时才生成文件
    if (initJsAutoLoad && privateJS.trim()) {
        const assetsJSDir = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js');
        if (!(await utils.existsSync(assetsJSDir))) {
            await utils.mkdir(assetsJSDir, { recursive: true });
        }

        const privateFilename = `script-${pageId}.js`;
        const privateFilePath = path.join(assetsJSDir, privateFilename);
        
        console.log(`[JS处理诊断] 写入私有JS文件: ${privateFilePath}`);
        await utils.writeFile(privateFilePath, privateJS);
    } else {
        console.log(`[JS处理诊断] 不需要生成私有JS文件，initJsAutoLoad: ${initJsAutoLoad}, 私有JS内容: ${privateJS.trim() ? '有' : '无'}`);
    }

    // ✅ 不再插入任何 <script> 标签，直接返回处理后的 HTML（没有脚本）
    return htmlContent;
};