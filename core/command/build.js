const path = require('path');
const fs = require('fs');
const logger = require('./log');
const { CONFIG, shared } = require('./build/context');

async function loadBuildModules() {
    const buildDir = path.join(__dirname, 'build');
    return fs.readdirSync(buildDir)
        .filter(f => f.endsWith('.js') && f !== 'context.js')
        .sort((a, b) => {
            const numA = parseInt(a.split('-')[0]);
            const numB = parseInt(b.split('-')[0]);
            return numA - numB;
        })
        .map(f => require(path.join(buildDir, f)));
}

/**
 * 执行构建过程
 * @param {boolean} [isDev=true] 是否为开发模式
 * @returns {Promise<{ success: boolean, error?: Error, outputDir?: string }>}
 */
async function build(isDev = true) {
    try {
        // 初始化上下文
        shared.logger = logger;
        shared.isDev = isDev;
        logger.configure({ color: true, level: 'info' });
        logger.title(`启动${isDev ? '开发' : '生产'}模式...`);

        // 加载并执行构建模块
        const modules = await loadBuildModules();
        for (const module of modules) {
            await module();
        }

        logger.success('✅ 构建成功完成！');
        logger.info(`🚀 文件已生成在: ${CONFIG.OUTPUT_DIR}`);

        return {
            success: true,
            outputDir: CONFIG.OUTPUT_DIR
        };
    } catch (error) {
        logger.error(`构建失败: ${error.message}`);
        logger.debug(error.stack); // 可选：打印堆栈信息用于调试

        return {
            success: false,
            error: error
        };
    }
}

// 导出构建函数
exports.build = build;