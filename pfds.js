#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const path = require('node:path');
const { execSync } = require('child_process');

// 导入命令
const { build } = require(path.resolve(process.cwd(), 'core/command/build'));
const { startDevServer } = require(path.resolve(process.cwd(), 'core/command/dev'));
const { installDependencies } = require(path.resolve(process.cwd(), 'core/command/install'));

// 👇 新增一个通用执行器，确保先运行 npm link
async function runWithNpmLink(commandFn) {
    try {
        // 执行 npm link 并强制覆盖已存在的文件
        console.log('🔗 正在运行 npm link --force...');
        execSync('npm link --force', { stdio: 'inherit' });

        // 执行实际命令
        await commandFn();
    } catch (error) {
        console.error(`❌ 命令执行失败: ${error.message}`);
        process.exit(1);
    }
}

program
    .command('build')
    .description('运行构建任务')
    .action(async () => {
        await runWithNpmLink(() => build(false));
    });

program
    .command('dev')
    .description('启动开发模式并监听文件变化')
    .action(async () => {
        await runWithNpmLink(() => startDevServer());
    });

program
    .command('install')
    .alias('i')
    .description('安装项目依赖')
    .action(async () => {
        await runWithNpmLink(() => installDependencies());
    });

program.parse(process.argv);