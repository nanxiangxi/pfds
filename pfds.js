#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();
const path = require('node:path');
const { exec } = require('child_process'); // 改用异步 exec

// 导入命令
const { build } = require(path.resolve(process.cwd(), 'core/command/build'));
const { startDevServer } = require(path.resolve(process.cwd(), 'core/command/dev'));
const { installDependencies } = require(path.resolve(process.cwd(), 'core/command/install'));

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
        runWithNpmLink(startDevServer); // 注意：这里也可以直接传函数引用
    });

program
    .command('install')
    .alias('i')
    .description('安装项目依赖')
    .action(() => {
        runWithNpmLink(installDependencies);
    });

program.parse(process.argv);