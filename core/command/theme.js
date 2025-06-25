// core/command/theme.js

const fs = require('node:fs');
const path = require('node:path');
const axios = require('axios');

function isUrl(str) {
    try {
        new URL(str);
        return true;
    } catch (e) {
        return false;
    }
}

async function downloadCssFromUrl(url, targetPath) {
    console.log(`🌐 正在从 ${url} 下载 CSS 文件...`);
    const res = await axios.get(url, { responseType: 'stream' });

    const writer = fs.createWriteStream(targetPath);

    res.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

/**
 * 安装主题，支持通过完整 URL 或主题名称安装。
 * 如果是主题名称，则从 https://docs.shlm.top/pfds/css/{themeName}.css 下载。
 * @param {string} themeNameOrUrl 主题名称或主题 CSS 的 URL 地址
 * @returns {Promise<void>}
 */
async function installTheme(themeNameOrUrl) {
    return new Promise(async (resolve, reject) => {
        const themesDir = path.resolve(process.cwd(), 'core', 'themes');

        // 确保目录存在
        if (!fs.existsSync(themesDir)) {
            fs.mkdirSync(themesDir, { recursive: true });
        }

        let url;

        // 判断输入类型，并生成正确的 URL
        if (isUrl(themeNameOrUrl)) {
            url = themeNameOrUrl;
        } else {
            url = `https://docs.shlm.top/pfds/css/${themeNameOrUrl}.css`;
        }

        const filename = path.basename(url); // 如 dark.css
        const destPath = path.join(themesDir, filename);

        if (fs.existsSync(destPath)) {
            console.warn(`⚠️ 文件已存在，正在覆盖: ${destPath}`);
        }

        try {
            await downloadCssFromUrl(url, destPath);
            console.log(`✅ CSS 文件成功保存到: ${destPath}`);
            resolve();
        } catch (err) {
            console.error(`❌ 下载 CSS 文件失败: ${err.message}`);
            reject(err);
        }
    });
}

module.exports = {
    installTheme
};