const path = require('path');
const { CONFIG, shared, utils } = require('./context');

module.exports = async () => {
    shared.logger.stepStart('JS 模块打包');

    const files = await utils.readdir(CONFIG.MODULES_DIR);
    const jsFiles = files.filter(file => file.endsWith('.js'));

    // 创建模块封装模板
    let modulesJS = `// PFDS 模块系统
(function() {
    'use strict';
    
    //console.log('[模块系统] 开始初始化');
    
    // 动态加载标记
    window.PFDS_DYNAMIC_LOAD = window.PFDS_DYNAMIC_LOAD || {};
    
    // 检查页面是否需要动态加载JS
    window.PFDS_DYNAMIC_LOAD.needsJS = function(pageId) {
        const result = this[pageId] && this[pageId].js === true;
       // console.log('[模块系统] 检查页面是否需要JS:', pageId, '结果:', result);
        return result;
    };
    
    // 检查页面是否需要动态加载CSS
    window.PFDS_DYNAMIC_LOAD.needsCSS = function(pageId) {
        const result = this[pageId] && this[pageId].css === true;
        //console.log('[模块系统] 检查页面是否需要CSS:', pageId, '结果:', result);
        return result;
    };
    
    // 模块注册表
    const modules = {};
    
    // 模块注册函数
    function registerModule(name, factory) {
       // console.log('[模块系统] 注册模块:', name);
        modules[name] = factory;
    }
    
    // 模块获取函数
    function getModule(name) {
        return modules[name];
    }
    
    // 初始化所有模块
    function initModules() {
        //console.log('[模块系统] 开始初始化所有模块');
        const initOrder = [
            'css自动加载',
            '主题切换',
            '代码高亮', 
            '代码复制',
            '元素多语言',
            '菜单',
            '下拉菜单', 
            '平滑滚动',
            '阅读进度条',
            '搜索',
            '智能搜索',
            '搜索模态框',
            '页面导航',
            'js隔离',
            'js动态加载',
            '折叠',
            'public-script'
        ];
        
        initOrder.forEach(name => {
            if (modules[name] && typeof modules[name].init === 'function') {
                try {
                   // console.log('[模块系统] 初始化模块:', name);
                    modules[name].init();
                } catch (e) {
                  //  console.error('[模块系统] 模块初始化失败:', name, e);
                }
            }
        });
        
        // console.log('[模块系统] 所有模块初始化完成');
    }
`;

    // 特殊处理public-script模块，确保其DOMContentLoaded事件监听器能正常工作
    let publicScriptContent = null;

    for (const file of jsFiles) {
        const filePath = path.join(CONFIG.MODULES_DIR, file);
        const content = await utils.readFile(filePath, 'utf-8');
        const moduleName = path.parse(file).name;
        
       // console.log(`[模块打包诊断] 处理模块文件: ${file}`);
        
        if (moduleName === 'public-script') {
            // 保存public-script模块内容，稍后特殊处理
            publicScriptContent = content;
            continue;
        }
        
        // 处理模块内容 - 移除导出语句但保留结构
        let moduleContent = content.replace(/export\s*{[^}]*};?/g, '');
        moduleContent = moduleContent.replace(/export\s+default\s+/g, 'return ');
        moduleContent = moduleContent.replace(/export\s+(function|class|const|let|var)/g, '$1');
        
        // 更彻底地移除import语句（这些是构建时使用的，不应该出现在浏览器环境中）
        moduleContent = moduleContent.replace(/import\s+.*?from\s+['"][^'"]+['"];/g, '');
        moduleContent = moduleContent.replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"];/g, '');
        moduleContent = moduleContent.replace(/import\s+['"][^'"]+['"];/g, '');
        // 移除单独行上的import语句
        moduleContent = moduleContent.replace(/^\s*import\s.*$/gm, '');

        modulesJS += `
    // 模块: ${moduleName}
    registerModule('${moduleName}', (function() {
        ${moduleContent}
    })());
`;
        shared.logger.subStep(`加载模块: ${file}`, 'success');
    }

    // 特殊处理public-script模块，将其DOMContentLoaded相关代码提取到模块系统外部
    if (publicScriptContent) {
        // 处理public-script模块
        let publicScriptModuleContent = publicScriptContent.replace(/export\s*{[^}]*};?/g, '');
        publicScriptModuleContent = publicScriptModuleContent.replace(/export\s+default\s+/g, 'return ');
        publicScriptModuleContent = publicScriptModuleContent.replace(/export\s+(function|class|const|let|var)/g, '$1');
        publicScriptModuleContent = publicScriptModuleContent.replace(/import\s+.*?from\s+['"][^'"]+['"];/g, '');
        publicScriptModuleContent = publicScriptModuleContent.replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]+['"];/g, '');
        publicScriptModuleContent = publicScriptModuleContent.replace(/import\s+['"][^'"]+['"];/g, '');
        publicScriptModuleContent = publicScriptModuleContent.replace(/^\s*import\s.*$/gm, '');

        modulesJS += `
    // 模块: public-script
    registerModule('public-script', (function() {
        ${publicScriptModuleContent}
    })());
`;
        shared.logger.subStep(`加载模块: public-script.js`, 'success');
    }

    modulesJS += `
    // 启动所有模块
    document.addEventListener('DOMContentLoaded', function() {
       // console.log('[模块系统] DOM加载完成，初始化所有模块');
        initModules();
    });
    
    // 将模块系统暴露到全局作用域，便于调试
    window.PFDSModules = {
        get: getModule,
        init: initModules
    };
    
   // console.log('[模块系统] 模块系统初始化完成');
})();

// 确保PFDS_DYNAMIC_LOAD对象存在
window.PFDS_DYNAMIC_LOAD = window.PFDS_DYNAMIC_LOAD || {};
//console.log('[模块系统] PFDS_DYNAMIC_LOAD对象初始化完成，当前内容:', window.PFDS_DYNAMIC_LOAD);
`;

    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js', 'modules.js');
    await utils.writeFile(outputPath, modulesJS);
    
    shared.logger.subStep(`模块已打包至: ${outputPath}`, 'success');
    //console.log(`[模块打包诊断] 模块打包完成，输出路径: ${outputPath}`);
    shared.logger.stepEnd('JS 模块打包');
};