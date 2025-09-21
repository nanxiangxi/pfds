const path = require('path');
const { existsSync } = require('fs');
const fs = require('fs/promises');

module.exports = {
    CONFIG: {
        DEV_DIR: path.resolve(process.cwd(), 'dev'),
        OUTPUT_DIR: path.resolve(process.cwd(), 'output'),
        ASSETS_DIR: path.resolve(process.cwd(), 'dev/assets'),
        MODULES_DIR: path.resolve(process.cwd(), 'core/modules'),
        THEME_DIR: path.resolve(process.cwd(), 'core/themes')
    },
    shared: {
        logger: null,
        isDev: true,
        config: null,
        routes: [],
        headConfig: [],
        templateContent: '',
        navHTML: '',
        viewsHTML: '',
        cssContent: '',
        modulesJS: ''
    },
    utils: {
        existsSync,
        readFile: require('util').promisify(require('fs').readFile),
        writeFile: require('util').promisify(require('fs').writeFile),
        mkdir: require('util').promisify(require('fs').mkdir),
        copyFile: require('util').promisify(require('fs').copyFile),
        readdir: require('util').promisify(require('fs').readdir),

        /**
         * 深度合并两个对象
         * @param {Object} target 目标对象
         * @param {Object} source 源对象
         * @returns {Object} 合并后的对象
         */
        deepMerge: (target, source) => {
            const result = { ...target };
            
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                        // 如果是对象且不是数组，则递归合并
                        result[key] = module.exports.utils.deepMerge(result[key] || {}, source[key]);
                    } else {
                        // 否则直接赋值
                        result[key] = source[key];
                    }
                }
            }
            
            return result;
        },

        /**
         * 删除指定目录或文件
         * @param {string} dirPath 要删除的路径
         */
        removeDir: async (dirPath) => {
            try {
                await fs.rm(dirPath, { recursive: true, force: true });
            } catch (err) {
                // 忽略不存在的情况，其他错误仍可抛出
                if (err.code !== 'ENOENT') throw err;
            }
        },

        /**
         * 清空 output 输出目录
         */
        cleanOutput: async () => {
            const outputDir = module.exports.CONFIG.OUTPUT_DIR;
            await module.exports.utils.removeDir(outputDir);
            await module.exports.utils.mkdir(outputDir, { recursive: true });
        },
        
        /**
         * 确保目录存在
         * @param {string} dirPath 目录路径
         */
        ensureDir: async (dirPath) => {
            try {
                await fs.access(dirPath);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    await fs.mkdir(dirPath, { recursive: true });
                } else {
                    throw err;
                }
            }
        }
    }
};