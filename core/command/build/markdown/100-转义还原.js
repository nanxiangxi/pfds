// markdown-plugins/99-restore-raw.js

const { shared } = require('../context');

module.exports = (content) => {
    const rawMap = shared.rawContentMap || {};
    const count = Object.keys(rawMap).length;

  //  shared.logger.subStep(`【Raw 插件】开始还原 ${count} 个原始块`);

    let restored = content;

    for (const key in rawMap) {
        if (rawMap.hasOwnProperty(key)) {
            const value = rawMap[key];
           // shared.logger.debug(`【Raw 插件】还原原始块: ${key} → "${value}"`);
            const escapedKey = key.replace(/[.*+?^${}()|[$$\$$]/g, '\\$&');
            const regex = new RegExp(escapedKey, 'g');
            restored = restored.replace(regex, value);
        }
    }

   // shared.logger.subStep('【Raw 插件】原始块还原完成');
    return restored;
};