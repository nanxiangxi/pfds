#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const path = require('node:path');
const { exec } = require('child_process');

// 导入命令
const { build } = require(path.resolve(process.cwd(), 'core/command/build'));
const { startDevServer } = require(path.resolve(process.cwd(), 'core/command/dev'));
const { installTheme } = require(path.resolve(process.cwd(), 'core/command/theme'));

// 👇 使用异步版本 runWithNpmLink
function runWithNpmLink(commandFn) {
    return new Promise((resolve, reject) => {
        console.log('🔗 正在运行 npm link --force...');
        const child = exec('npm link --force', (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ npm link 失败: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.warn(`⚠️ npm link 警告: ${stderr}`);
            }
            resolve();
        });

        // 实时输出日志
        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    }).then(commandFn).catch(err => {
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

// 构建和开发命令保持不变
program
    .command('build')
    .description('运行构建任务')
    .action(() => {
        runWithNpmLink(() => build(false));
    });

program
    .command('dev')
    .description('启动开发模式并监听文件变化')
    .action(() => {
        runWithNpmLink(startDevServer);
    });
program
    .command('update')
    .description('检查并更新 my-pfds 到最新版本')
    .action(() => {
        runWithNpmLink(updatePfds);
    });
program.parse(process.argv);