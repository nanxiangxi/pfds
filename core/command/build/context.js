const path = require('path');
const { existsSync } = require('fs');

module.exports = {
    CONFIG: {
        DEV_DIR: path.resolve(process.cwd(), 'dev'),
        OUTPUT_DIR: path.resolve(process.cwd(), 'output'),
        TEMPLATE_DIR: path.resolve(process.cwd(), 'dev/template'),
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
        readdir: require('util').promisify(require('fs').readdir)
    }
};
