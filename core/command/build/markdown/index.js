const fs = require('fs');
const path = require('path');
const { shared } = require('../context');

// 加载所有放在 markdown/ 目录下的插件（除 index.js 外）
const pluginFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.js'));

// 按数字前缀排序插件文件
pluginFiles.sort((a, b) => {
    const numA = parseInt(a.match(/^(\d+)/)[1], 10);
    const numB = parseInt(b.match(/^(\d+)/)[1], 10);
    return numA - numB;
});

// 按顺序应用插件
const applyMarkdownPlugins = (content) => {
    shared.logger.subStep(`开始应用 Markdown 插件，共加载 ${pluginFiles.length} 个插件`);

    pluginFiles.forEach(file => {
        const pluginPath = path.join(__dirname, file);
        const plugin = require(pluginPath);
        if (typeof plugin === 'function') {
            try {
                content = plugin(content);
                shared.logger.subStep(`插件 ${file} 应用成功`);
            } catch (err) {
                shared.logger.error(`插件 ${file} 应用失败:`, err.message);
            }
        }
    });
    return content;
};

module.exports = applyMarkdownPlugins;