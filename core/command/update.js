const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const semver = require('semver');

const execAsync = promisify(exec);

// 获取本地 package.json 的版本
async function getLocalVersion() {
    const data = await fs.readFile('package.json', 'utf8');
    const pkg = JSON.parse(data);
    return pkg.version;
}

// 获取远程最新版本
async function getRemoteVersion(packageName) {
    const { stdout } = await execAsync(`npm view ${packageName} version`);
    return stdout.trim();
}

// 下载 npm 包
async function downloadPackage(packageName, version) {
    const expectedTarballName = `${packageName}-${version}.tgz`;

    console.log(`⬇️ 正在下载包: ${packageName}@${version}`);
    const { stdout, stderr } = await execAsync(`npm pack ${packageName}@${version}`);

    if (stderr) {
        console.warn(`⚠️ npm pack 输出警告: ${stderr}`);
    }

    // npm pack 输出的最后一行为文件名
    const tarballName = stdout.trim().split('\n').pop();

    if (!tarballName || !fsSync.existsSync(tarballName)) {
        throw new Error(`❌ 下载失败: 未找到生成的 tarball 文件（期望: ${expectedTarballName}）`);
    }

    console.log(`📦 已下载: ${tarballName}`);
    return tarballName;
}

// 解压 .tgz 文件
async function extractTarball(tarballPath, outputDir) {
    const tempDir = path.join(outputDir, '..', 'tmp-extract');
    await fs.mkdir(tempDir, { recursive: true });
    await execAsync(`tar -xzf ${tarballPath} -C ${tempDir}`);
    const extractedFolder = path.join(tempDir, 'package');
    return extractedFolder;
}

// 删除临时文件
async function cleanup(files) {
    for (const file of files) {
        try {
            if (fsSync.existsSync(file)) {
                await fs.rm(file, { recursive: true, force: true });
                console.log(`🗑️ 已清理临时文件: ${file}`);
            }
        } catch (e) {
            console.warn(`⚠️ 删除文件失败: ${file}`);
        }
    }
}

// 主更新逻辑
async function updatePfds() {
    const packageName = 'my-pfds';
    let cleanupFiles = [];

    try {
        const localVersion = await getLocalVersion();
        const remoteVersion = await getRemoteVersion(packageName);

        if (semver.lt(localVersion, remoteVersion)) {
            console.log(`📦 检测到新版本: v${remoteVersion}（当前版本 v${localVersion}）`);
            const answer = await askUser('⚠️ 此操作将覆盖本地文件，是否继续？(y/N): ');
            if (!answer.toLowerCase().startsWith('y')) {
                console.log('❌ 更新已取消');
                return;
            }

            console.log('⬇️ 正在下载最新版本...');
            const tarballName = await downloadPackage(packageName, remoteVersion);
            console.log(`📄 下载完成: ${tarballName}`);
            cleanupFiles.push(tarballName);

            if (!fsSync.existsSync(tarballName)) {
                throw new Error(`❌ 文件不存在: ${tarballName}`);
            }

            console.log('📂 正在解压文件...');
            const extractedPath = await extractTarball(tarballName, process.cwd());
            cleanupFiles.push(path.dirname(extractedPath));

            console.log('🔁 正在更新文件（跳过 dev 目录）...');

            const files = await fs.readdir(extractedPath);

            for (const file of files) {
                const srcPath = path.join(extractedPath, file);
                const destPath = path.join(process.cwd(), file);

                // ✅ 跳过 dev 目录
                if (file === 'dev') {
                    console.log(`📂 已跳过 dev 目录更新（保留本地内容）`);
                    continue;
                }

                // 删除并复制其他文件
                if (fsSync.existsSync(destPath)) {
                    await fs.rm(destPath, { recursive: true, force: true });
                }
                await fs.cp(srcPath, destPath, { recursive: true });
                console.log(`✅ 已更新: ${file}`);
            }

            // ✅ 如果本地没有 dev 目录，创建一个空目录（首次安装）
            const devPath = path.join(process.cwd(), 'dev');
            if (!fsSync.existsSync(devPath)) {
                await fs.mkdir(devPath);
                console.log('📂 已创建空 dev 目录');
            }

            console.log(`✅ 更新完成！当前版本: ${remoteVersion}`);
        } else {
            console.log('🎉 当前已是最新版本，无需更新');
        }
    } catch (e) {
        console.error(`❌ 更新失败: ${e.message}`);
        process.exit(1);
    } finally {
        await cleanup(cleanupFiles);
    }
}

// 简单的命令行交互
function askUser(question) {
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            readline.close();
            resolve(answer);
        });
    });
}

// 用于被 CLI 调用
async function runWithNpmLink(commandFn) {
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

        child.stdout.pipe(process.stdout);
        child.stderr.pipe(process.stderr);
    }).then(() => {
        return commandFn();
    }).catch(err => {
        console.error(`❌ 命令执行失败: ${err.message}`);
        process.exit(1);
    });
}

// CLI 注册部分（简化版，实际应放在主入口文件中）
if (require.main === module) {
    (async () => {
        try {
            await runWithNpmLink(updatePfds);
        } catch (e) {
            console.error(`❌ 命令执行失败: ${e.message}`);
            process.exit(1);
        }
    })();
}

module.exports = {
    updatePfds,
    runWithNpmLink
};