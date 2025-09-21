// pmd/syntax/index.js
// PMD 语法模块注册中心

const fs = require('fs');
const path = require('path');

/**
 * 加载所有语法模块
 * @returns {Array} 语法模块数组
 */
function loadSyntaxModules() {
    const syntaxDir = __dirname;
    const modules = [];
    
    // 读取语法目录中的所有.js文件
    const files = fs.readdirSync(syntaxDir);
    
    for (const file of files) {
        // 跳过index.js和非.js文件
        if (file === 'index.js' || !file.endsWith('.js')) {
            continue;
        }
        
        try {
            // 加载模块
            const modulePath = path.join(syntaxDir, file);
            const module = require(modulePath);
            
            // 确保模块有必要的属性
            if (module && typeof module.name === 'string' && typeof module.parse === 'function') {
                modules.push(module);
            }
        } catch (err) {
            console.error(`[PMD] 加载语法模块失败: ${file}`, err);
        }
    }
    
    return modules;
}

module.exports = {
    loadSyntaxModules
};