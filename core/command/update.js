const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const extract = require('extract-zip');
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
    const tarballName = `${packageName}-${version}.tgz`;
    await execAsync(`npm pack ${packageName}@${version}`);
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
            await fs.rm(file, { recursive: true, force: true });
        } catch (e) {
            console.warn(`⚠️ 删除文件失败: ${file}`);
        }
    }
}

// 增量合并 dev 目录
async function mergeDevDir(srcDir, destDir) {
    const files = await fs.readdir(srcDir);
    for (const file of files) {
        const srcFile = path.join(srcDir, file);
        const destFile = path.join(destDir, file);
        const stat = await fs.stat(srcFile);

        if (stat.isDirectory()) {
            if (!await fs.stat(destFile).catch(() => null)) {
                await fs.mkdir(destFile, { recursive: true });
            }
            await mergeDevDir(srcFile, destFile);
        } else {
            // 只有源文件存在才覆盖
            await fs.copyFile(srcFile, destFile);
            console.log(`🔄 已更新 dev 文件: ${destFile}`);
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
            cleanupFiles.push(tarballName);

            console.log('📂 正在解压文件...');
            const extractedPath = await extractTarball(tarballName, process.cwd());
            cleanupFiles.push(path.dirname(extractedPath));

            console.log('🔁 正在更新文件...');

            // 获取解压后的所有文件
            const files = await fs.readdir(extractedPath);

            for (const file of files) {
                const srcPath = path.join(extractedPath, file);
                const destPath = path.join(process.cwd(), file);

                // 如果是 dev 目录，增量更新
                if (file === 'dev' && fsSync.existsSync(srcPath)) {
                    console.log('📂 正在增量更新 dev 目录...');
                    await mergeDevDir(srcPath, destPath);
                } else {
                    // 其他文件直接覆盖
                    if (fsSync.existsSync(destPath)) {
                        await fs.rm(destPath, { recursive: true, force: true });
                    }
                    await fs.cp(srcPath, destPath, { recursive: true });
                    console.log(`✅ 已更新: ${file}`);
                }
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