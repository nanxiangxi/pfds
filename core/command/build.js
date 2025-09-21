const path = require('path');
const fs = require('fs');
const logger = require('./log');

// ✅ 正确引入 context 中的 CONFIG 和 utils
const { CONFIG, shared, utils } = require('./build/context'); // 注意这里

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

        // ✅ 清空 output 目录
        await utils.cleanOutput(); // ✅ 使用正确导入的 utils

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

// 处理模块
async function processModules() {
    const modulesDir = path.join(__dirname, '../modules');
    const moduleFiles = fs.readdirSync(modulesDir);
    
    // 过滤出需要的模块文件（排除特定文件）
    const filteredModules = moduleFiles.filter(file => 
        file.endsWith('.js') && 
        !file.includes('public-script') &&
        !file.includes('js动态加载')
    );
    
    // 按照特定顺序排列模块
    const orderedModules = [
        'css自动加载.js',
        '页面导航.js',
        '菜单.js',
        '下拉菜单.js',
        '主题切换.js',
        '代码高亮.js',
        '平滑滚动.js',
        '代码复制.js',
        '元素多语言.js',
        '阅读进度条.js',
        '搜索.js',
        '智能搜索.js',  // 添加新模块
        '搜索模态框.js'
    ];
    
    // 确保所有模块都在排序列表中
    const remainingModules = filteredModules.filter(file => !orderedModules.includes(file));
    const allModules = [...orderedModules, ...remainingModules];
    
    // 生成导入语句
    let imports = '';
    let initCalls = '';
    
    for (const file of allModules) {
        const moduleName = path.parse(file).name;
        const safeModuleName = moduleName.replace(/[^a-zA-Z0-9]/g, '_');
        
        // 添加导入语句
        imports += `import ${safeModuleName} from '../modules/${file}';\n`;
        
        // 添加初始化调用（兼容 ESM 和 CommonJS）
        const initCall = `
    const mod_${safeModuleName} = typeof ${safeModuleName} === 'object' && ${safeModuleName} !== null ? ${safeModuleName}.default || ${safeModuleName} : ${safeModuleName};
    if (['css自动加载', '主题切换', '代码高亮', '代码复制', '元素多语言', '菜单', '下拉菜单', '平滑滚动', '阅读进度条', '搜索', '智能搜索', '搜索模态框'].includes('${moduleName}')) {
        if (typeof mod_${safeModuleName}.init === 'function') mod_${safeModuleName}.init();
    } else {
        if (typeof mod_${safeModuleName} === 'function') new mod_${safeModuleName}();
    }`;
        initCalls += initCall;
    }
    
    // 生成模块文件内容
    const moduleContent = `// 动态加载所有模块
${imports}

// 初始化所有模块
export function initModules() {
${initCalls}
}

// 默认导出初始化函数
export default initModules;
`;
    
    // 写入模块文件
    const outputPath = path.join(__dirname, '../../output/assets/js/modules.js');
    fs.writeFileSync(outputPath, moduleContent);
    
    console.log('模块处理完成');
}

// 处理头部搜索区域
function processHeaderSearch() {
    // 在构建时不需要特殊处理，因为搜索控件将通过JavaScript动态创建
    // 这里保留函数以备将来扩展
}

// 导出构建函数
exports.build = build;