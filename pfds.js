#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const path = require('node:path');
const { exec } = require('child_process');

// 导入命令
const { build } = require(path.resolve(process.cwd(), 'core/command/build'));
const { startDevServer } = require(path.resolve(process.cwd(), 'core/command/dev'));
const { installTheme } = require(path.resolve(process.cwd(), 'core/command/theme'));
const { updatePfds } = require(path.resolve(process.cwd(), 'core/command/update'));

// 👇 使用异步版本 runWithNpmLink
function runWithNpmLink(commandFn) {
    return new Promise((resolve, reject) => {
        console.log('🔗 正在运行 npm link --force...');
        const child = exec('npm link --force', (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ npm link 失败: ${error.message}`);
                return reject(error);
            }
            if (stderr && !stderr.includes('using --force')) {
                console.warn(`⚠️ npm link 警告: ${stderr}`);
            }
            resolve();
        });

        // 实时输出日志
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    }).then(() => {
        if (commandFn) {
            return commandFn();
        }
    }).catch(err => {
        console.error(`❌ 命令执行失败: ${err.message}`);
        process.exit(1);
    });
}

// 👇 注册 theme 命令
program
    .command('theme <themeName>')
    .alias('t')
    .description('下载并安装主题到 core/themes/<themeName>')
    .action(async (themeName) => {
        await installTheme(themeName);
    });

// 构建和开发命令（保持异步兼容）
program
    .command('build')
    .description('运行构建任务')
    .action(() => {
        return runWithNpmLink(() => build(false));
    });

program
    .command('dev')
    .description('启动开发模式并监听文件变化')
    .action(() => {
        return runWithNpmLink(startDevServer);
    });

// 👇 注册 update 命令（✅ 修改重点：使用 async 包装）
program
    .command('update')
    .description('检查并更新 pfds 到最新版本')
    .action(async () => {
        try {
            await new Promise((resolve, reject) => {
                console.log('🔗 正在运行 npm link --force...');
                const child = exec('npm link --force', (error, stdout, stderr) => {
                    if (error) {
                        console.error(`❌ npm link 失败: ${error.message}`);
                        return reject(error);
                    }
                    if (stderr && !stderr.includes('using --force')) {
                        console.warn(`⚠️ npm link 警告: ${stderr}`);
                    }
                    resolve();
                });

                child.stdout.pipe(process.stdout);
                child.stderr.pipe(process.stderr);
            });

            await updatePfds();  // ✅ 真正等待 updatePfds 完成
        } catch (e) {
            console.error(`❌ 更新失败: ${e.message}`);
            process.exit(1);
        }
    });

// ✅ 启动 CLI 解析
program.parse(process.argv);