const path = require('path');
const fs = require('fs').promises;
const { CONFIG, shared, utils } = require('./context');

/**
 * 解析配置中的本地文件引用
 * @param {any} value - 配置值
 * @param {string} baseDir - 基准目录
 * @returns {Promise<any>} 解析后的值
 */
async function resolveFileReferences(value, baseDir) {
    if (typeof value === 'string' && value.startsWith('#file:')) {
        // 提取文件路径
        const filePath = value.substring(6); // 移除 '#file:' 前缀
        const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(baseDir, filePath);
        
        try {
            // 读取文件内容
            const fileContent = await fs.readFile(absolutePath, 'utf-8');
            return JSON.parse(fileContent);
        } catch (error) {
            shared.logger.warn(`无法读取文件引用: ${absolutePath}`, 'warning');
            return value; // 返回原始值
        }
    } else if (typeof value === 'string' && value.startsWith('icon:')) {
        // 处理图标引用，格式为 icon:name
        const iconName = value.substring(5); // 移除 'icon:' 前缀
        
        // 查找图标文件
        const iconFilePath = path.join(baseDir, 'icon.json');
        try {
            const iconFileContent = await fs.readFile(iconFilePath, 'utf-8');
            const iconData = JSON.parse(iconFileContent);
            
            // 查找图标
            if (iconData.icons && Array.isArray(iconData.icons)) {
                const icon = iconData.icons.find(i => i.name === iconName);
                if (icon) {
                    // 返回图标URL及相关属性
                    return {
                        url: icon.url,
                        width: icon.width || null,
                        height: icon.height || null
                    };
                }
            }
        } catch (error) {
            shared.logger.warn(`无法读取或处理图标文件: ${iconFilePath}`, 'warning');
        }
        
        // 如果找不到图标，返回原始值
        return value;
    } else if (typeof value === 'object' && value !== null) {
        // 递归处理对象中的每个属性
        const resolvedObject = {};
        for (const [key, val] of Object.entries(value)) {
            resolvedObject[key] = await resolveFileReferences(val, baseDir);
        }
        return resolvedObject;
    } else if (Array.isArray(value)) {
        // 递归处理数组中的每个元素
        const resolvedArray = [];
        for (const item of value) {
            resolvedArray.push(await resolveFileReferences(item, baseDir));
        }
        return resolvedArray;
    }
    
    // 返回原始值
    return value;
}

module.exports = async () => {
    shared.logger.stepStart('配置加载');

    // 读取配置文件
    const configPath = path.join(CONFIG.DEV_DIR, 'pfds.json');
    const configContent = await utils.readFile(configPath);
    let config = JSON.parse(configContent);

    // 处理配置中的本地文件引用
    config = await resolveFileReferences(config, CONFIG.DEV_DIR);

    // 合并默认配置
    const defaultConfig = {
        header: {
            title: 'PFDS文档',
            favicon: '',
            logo: '',
            logoLink: '#',
            logoTitle: 'PFDS文档',
            themeToggle: true,
            search: true,
            'pre-declaration': {
                enable: false,
                content: ''
            },
            head: [] // 默认空的头部链接数组
        },
        multilingual: {
            enable: false,
            languages: []
        },
        theme: 'default',
        initCssAutoLoad: false
    };

    // 合并配置
    shared.config = utils.deepMerge(defaultConfig, config);
    
    // 修复multilingual.languages可能被错误转换为对象的问题
    if (shared.config.multilingual && shared.config.multilingual.languages && 
        typeof shared.config.multilingual.languages === 'object' && 
        !Array.isArray(shared.config.multilingual.languages)) {
        // 如果是对象但不是数组，则转换为数组
        const languagesArray = [];
        for (const key in shared.config.multilingual.languages) {
            if (shared.config.multilingual.languages.hasOwnProperty(key)) {
                languagesArray.push(shared.config.multilingual.languages[key]);
            }
        }
        shared.config.multilingual.languages = languagesArray;
    }
    
    // 加载路由配置文件
    try {
        const routerPath = path.join(CONFIG.DEV_DIR, 'router.json');
        const routerContent = await fs.readFile(routerPath, 'utf-8');
        const routerConfig = JSON.parse(routerContent);
        if (routerConfig.routes && Array.isArray(routerConfig.routes)) {
            shared.routes = routerConfig.routes;
        }
    } catch (error) {
        shared.logger.warn('无法加载路由配置文件，使用默认路由', 'warning');
        // 设置默认路由
        shared.routes = [{
            id: 'home',
            title: '首页',
            file: 'home.html'
        }];
    }
    
    // 自动加载head.json配置文件
    try {
        const headConfigPath = path.join(CONFIG.DEV_DIR, 'head.json');
        const headConfigContent = await fs.readFile(headConfigPath, 'utf-8');
        const headConfig = JSON.parse(headConfigContent);
        if (headConfig.head && Array.isArray(headConfig.head)) {
            shared.config.header.head = headConfig.head;
        }
    } catch (error) {
        // head.json文件不存在或解析失败，保持默认空数组
        // 不再记录该信息日志
    }
    
    // 读取模板文件
    const templatePath = path.join(process.cwd(), 'dev', 'index.html');
    const templateBuffer = await utils.readFile(templatePath);
    shared.templateContent = templateBuffer.toString('utf-8');
    
    shared.logger.subStep('配置读取完成', 'success');
    shared.logger.stepEnd('配置加载');
};