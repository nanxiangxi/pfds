const path = require('path');
const { CONFIG, shared, utils } = require('./context');

async function readConfig() {
    const configPath = path.join(CONFIG.DEV_DIR, 'pfds.json');
    const routePath = path.join(CONFIG.DEV_DIR, 'router.json');
    const headPath = path.join(CONFIG.DEV_DIR, 'head.json');

    // 读取全局配置
    const configData = await utils.readFile(configPath, 'utf-8');
    const config = JSON.parse(configData);

    // 读取路由配置
    const routeData = await utils.readFile(routePath, 'utf-8');
    const routes = JSON.parse(routeData).routes;

    // 读取头部配置
    let headConfig = [];
    if (utils.existsSync(headPath)) {
        try {
            const headData = await utils.readFile(headPath, 'utf-8');
            headConfig = JSON.parse(headData).head || [];
        } catch (error) {
            shared.logger.subStep('头部配置解析失败', 'error');
        }
    }

    // 读取模板文件
    const templatePath = path.join(CONFIG.TEMPLATE_DIR, config.template);
    const templateContent = await utils.readFile(templatePath, 'utf-8');

    return { config, routes, headConfig, templateContent };
}

module.exports = async () => {
    shared.logger.stepStart('配置加载');

    try {
        const { config, routes, headConfig, templateContent } = await readConfig();

        // 存入共享上下文
        shared.config = { ...config, head: headConfig };
        shared.routes = routes;
        shared.templateContent = templateContent;

        shared.logger.subStep('全局配置加载完成', 'success');
        shared.logger.subStep(`路由配置加载完成 (${routes.length}个路由)`, 'success');
        shared.logger.subStep('模板文件加载完成', 'success');
    } catch (error) {
        shared.logger.error(`配置加载失败: ${error.message}`);
        throw error;
    }

    shared.logger.stepEnd('配置加载');
};
