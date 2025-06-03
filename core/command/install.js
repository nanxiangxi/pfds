// ./core/command/install.js

const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const copyFile = util.promisify(fs.copyFile);

/**
 * 执行 shell 命令
 */
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`执行失败: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`错误输出: ${stderr}`);
            }
            console.log(stdout);
            resolve(stdout);
        });
    });
}

/**
 * 安装项目依赖（固定使用 npm）
 */
async function installDependencies() {
    const command = 'npm install';
    console.log('🚀 正在使用 npm 安装依赖...');
    try {
        await runCommand(command);
        console.log('✅ 依赖安装完成！');
    } catch (err) {
        console.error('❌ 安装依赖失败，请检查网络或配置');
        process.exit(1); // 安装失败退出程序
    }
}

// 暴出 install 命令处理函数
exports.installDependencies = installDependencies;