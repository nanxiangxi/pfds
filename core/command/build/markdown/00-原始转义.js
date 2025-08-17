// markdown-plugins/00-capture-raw.js

const { shared } = require('../context');

// HTML特殊字符转义函数
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\u00a0/g, ' '); // 转义不间断空格
}

module.exports = (content) => {
    //shared.logger.subStep('【Raw 插件】开始捕获 "*内容*"');

    const rawMap = {};
    let rawCounter = 0;

    // ✅ 使用你指定的正则：/"\*([\s\S]*?)\*"/g
    const replaced = content.replace(/"\*([\s\S]*?)\*"/g, (match, p1) => {
        const key = `{{RAW_${rawCounter++}}}`;
        // 对捕获的内容进行HTML转义处理
        const escapedContent = escapeHtml(p1.trim());
        rawMap[key] = escapedContent; // 去除前后空白（可选）
       // shared.logger.debug(`【Raw 插件】捕获到原始块: ${key} → "${p1.trim()}"`);
        return key;
    });

    /*

    if (rawCounter === 0) {
        shared.logger.subStep('【Raw 插件】未发现任何 "*内容*"');
    } else {
        shared.logger.subStep(`【Raw 插件】共捕获到 ${rawCounter} 个原始块`);
    }

     */

    shared.rawContentMap = rawMap; // 存入共享上下文
    return replaced;
};