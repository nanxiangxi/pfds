const path = require('path');
const { CONFIG, shared, utils } = require('./context');

module.exports = async () => {
    shared.logger.stepStart('构建环境初始化');

    const dirs = [
        CONFIG.OUTPUT_DIR,
        path.join(CONFIG.OUTPUT_DIR, 'assets'),
        path.join(CONFIG.OUTPUT_DIR, 'assets', 'css'),
        path.join(CONFIG.OUTPUT_DIR, 'assets', 'js')
    ];

    for (const dir of dirs) {
        if (!utils.existsSync(dir)) {
            await utils.mkdir(dir, { recursive: true });
            shared.logger.subStep(`创建目录: ${dir}`, 'success');
        } else {
            shared.logger.subStep(`目录已存在: ${dir}`, 'success');
        }
    }

    shared.logger.stepEnd('构建环境初始化');
};
