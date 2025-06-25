// markdown-plugins/00-capture-raw.js

const { shared } = require('../context');

module.exports = (content) => {
    //shared.logger.subStep('【Raw 插件】开始捕获 "*内容*"');

    const rawMap = {};
    let rawCounter = 0;

    // ✅ 使用你指定的正则：/"\*([\s\S]*?)\*"/g
    const replaced = content.replace(/"\*([\s\S]*?)\*"/g, (match, p1) => {
        const key = `{{RAW_${rawCounter++}}}`;
        rawMap[key] = p1.trim(); // 去除前后空白（可选）
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