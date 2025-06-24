const path = require('path');
const { CONFIG, shared, utils } = require('./context');

function generateHeadLinks() {
    shared.logger.stepStart('头部链接生成');
    let linksHTML = '';

    if (shared.config.head?.length > 0) {
        shared.config.head.forEach(item => {
            linksHTML += `      <a href="${item.url}">${item.title}</a>\n`;
        });
    }

    shared.logger.subStep(`生成 ${shared.config.head?.length || 0} 个链接`, 'success');
    shared.logger.stepEnd('头部链接生成');
    return linksHTML;
}

module.exports = async () => {
    shared.logger.stepStart('最终HTML构建');

    // 获取当前时间，格式化为 YYYY-MM-DD HH:mm:ss
    const buildTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(/\//g, '-'); // 替换斜杠为短横线

    let html = shared.templateContent
        .replace(/{{siteTitle}}/g, shared.config.siteTitle)
        .replace(/{{buildTime}}/g, buildTime)  // 新增的替换项
        .replace(/<!-- NAV_PLACEHOLDER -->/g, shared.navHTML)
        .replace(/<!-- CONTENT_PLACEHOLDER -->/g, shared.viewsHTML);

    // 清理开发专用内容
    if (!shared.isDev) {
        html = html.replace(/<!-- DEV_ONLY_START -->[\s\S]*?<!-- DEV_ONLY_END -->/g, '');
    }

    // 注入 CSS 链接
    html = html.replace(
        '</head>',
        '    <link rel="stylesheet" href="assets/css/main.css">\n</head>'
    );

    // 注入头部导航
    html = html.replace('<!-- HEAD_LINKS_PLACEHOLDER -->', generateHeadLinks());

    // 写入文件
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'index.html');
    await utils.writeFile(outputPath, html);

    shared.logger.subStep('HTML文档持久化', 'success');
    shared.logger.stepEnd('最终HTML构建');
};