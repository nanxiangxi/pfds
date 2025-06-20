const fs = require('fs');
const path = require('path');
const { shared } = require('../context');

/**
 * 应用多个 Markdown 插件，按序号顺序依次执行
 * @param {string} content 原始 Markdown 内容
 * @returns {string} 处理后的 Markdown 内容
 */
const applyMarkdownPlugins = (content) => {
    // 获取当前目录下所有非 index.js 的 .js 文件
    const pluginFiles = fs.readdirSync(__dirname)
        .filter(file => file !== 'index.js' && file.endsWith('.js'));

    // 提取序号并排序
    pluginFiles.sort((a, b) => {
        const matchA = a.match(/^(\d+)-/);
        const matchB = b.match(/^(\d+)-/);
        const numA = matchA ? parseInt(matchA[1], 10) : Infinity;
        const numB = matchB ? parseInt(matchB[1], 10) : Infinity;
        return numA - numB;
    });

    shared.logger.subStep(`开始应用 Markdown 插件，共加载 ${pluginFiles.length} 个插件`);

    // 依次调用插件
    for (const file of pluginFiles) {
        const pluginPath = path.join(__dirname, file);
        let plugin;

        try {
            plugin = require(pluginPath);
        } catch (err) {
            shared.logger.error(`插件 ${file} 加载失败:`, err.message);
            continue;
        }

        if (typeof plugin === 'function') {
            try {
                //shared.logger.debug(`正在应用插件: ${file}`);
                content = plugin(content); // 上一个插件的输出作为下一个插件的输入
                shared.logger.subStep(`插件 ${file} 应用成功`);
            } catch (err) {
                shared.logger.error(`插件 ${file} 执行出错:`, err.message);
                shared.logger.debug(`错误堆栈:`, err.stack);
            }
        } else {
            shared.logger.warn(`插件 ${file} 导出的不是一个函数`);
        }
    }

    return content;
};

module.exports = applyMarkdownPlugins;