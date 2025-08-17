const path = require('path');
const { CONFIG, shared, utils } = require('./context');

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

    // 根据配置决定是否启用主题切换功能
    let templateContent = shared.templateContent;
    let themeToggleHTML = '';
    if (shared.config.themeToggle !== false) {
        // 如果启用主题切换，生成主题切换按钮HTML（使用div而不是li）
        themeToggleHTML = `
<div class="theme-toggle" id="themeToggle">
  <span>🌞</span>
  <label class="switch">
    <input type="checkbox" id="themeSwitch">
    <span class="slider"></span>
  </label>
  <span>🌙</span>
</div>`;
    }

    let html = templateContent
        .replace(/{{siteTitle}}/g, shared.config.siteTitle)
        .replace(/{{buildTime}}/g, buildTime)
        .replace(/<!-- NAV_PLACEHOLDER -->/g, shared.navHTML)
        .replace(/<!-- CONTENT_PLACEHOLDER -->/g, shared.viewsHTML)
        .replace(/<!-- THEME_TOGGLE_PLACEHOLDER -->/g, themeToggleHTML);

    // 清理开发专用内容
    if (!shared.isDev) {
        html = html.replace(/<!-- DEV_ONLY_START -->[\s\S]*?<!-- DEV_ONLY_END -->/g, '');
    }

    // 注入 CSS 链接
    html = html.replace(
        '</head>',
        '    <link rel="stylesheet" href="assets/css/main.css">\n</head>'
    );

    // ✅ 正确做法：直接使用 shared.headLinksHTML
    html = html.replace('<!-- HEAD_LINKS_PLACEHOLDER -->', shared.headLinksHTML);

    // 写入文件
    const outputPath = path.join(CONFIG.OUTPUT_DIR, 'index.html');
    await utils.writeFile(outputPath, html);

    shared.logger.subStep('HTML文档持久化', 'success');
    shared.logger.stepEnd('最终HTML构建');
};