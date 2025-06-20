// core/command/theme.js

const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('child_process');
const axios = require('axios');
const fse = require('fs-extra');

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

function installTheme(themeNameOrUrl) {
    return new Promise(async (resolve, reject) => {
        const themesDir = path.resolve(process.cwd(), 'core', 'themes');

        // 确保目录存在
        if (!fs.existsSync(themesDir)) {
            fs.mkdirSync(themesDir, { recursive: true });
        }

        let destPath;

        // 判断是否是 URL
        if (isUrl(themeNameOrUrl)) {
            const url = themeNameOrUrl;
            const filename = path.basename(url); // 如 dark.css
            destPath = path.join(themesDir, filename);

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

        } else {
            const themePackageName = `@pfds/theme-${themeNameOrUrl}`;
            const tempInstallDir = path.resolve(process.cwd(), '.temp_theme_install');

            try {
                // 清理旧的临时目录
                if (fs.existsSync(tempInstallDir)) {
                    fs.rmSync(tempInstallDir, { recursive: true });
                }
                fs.mkdirSync(tempInstallDir);

                // 安装主题包
                const installCommand = `npm install ${themePackageName} --prefix ${tempInstallDir}`;
                const { stderr } = await execAsync(installCommand);

                if (stderr) console.warn(stderr);

                const cssFilePath = path.join(tempInstallDir, 'node_modules', themePackageName, 'index.css');
                if (!fs.existsSync(cssFilePath)) {
                    throw new Error(`❌ 主题包中未找到 index.css 文件`);
                }

                destPath = path.join(themesDir, `${themeNameOrUrl}.css`);

                // 拷贝 CSS 文件
                fse.copyFileSync(cssFilePath, destPath);

                console.log(`✅ 主题 ${themeNameOrUrl} 成功安装到 ${destPath}`);

                // 清理临时目录
                fs.rmSync(tempInstallDir, { recursive: true });

                resolve();

            } catch (err) {
                console.error(`❌ 安装 npm 主题失败: ${err.message}`);
                reject(err);
            }
        }
    });
}

// 封装 exec 为 Promise
function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) return reject({ error, stderr });
            resolve({ stdout, stderr });
        });
    });
}

module.exports = {
    installTheme
};