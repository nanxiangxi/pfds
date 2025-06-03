const fs = require('fs');
const path = require('path');
const express = require('express');
const chokidar = require('chokidar');
const { app, server } = require('./socket.io-server'); // ✅ 使用相对路径
const { build } = require('./build');
const net = require('net'); // 引入 net 模块用于检测端口占用

// 配置路径
const CONFIG = {
    OUTPUT_DIR: path.resolve(__dirname, '../../output'),
    DEV_DIRS: [
        path.resolve(__dirname, '../../dev'),
        path.resolve(__dirname, '../../core/modules'),
        path.resolve(__dirname, '../../core/themes'),
    ],
};

/**
 * 检查端口是否被占用
 * @param {number} port - 要检查的端口号
 * @returns {Promise<boolean>} - 如果端口被占用返回 true，否则返回 false
 */
function isPortInUse(port) {
    return new Promise((resolve) => {
        const tester = net.createServer()
            .once('error', (err) => (err.code === 'EADDRINUSE' ? resolve(true) : resolve(false)))
            .once('listening', () => tester.once('close', () => resolve(false)).close())
            .listen(port);
    });
}

/**
 * 获取可用端口
 * @param {number} startPort - 从哪个端口开始检查
 * @returns {Promise<number>} - 返回第一个可用端口
 */
async function getAvailablePort(startPort) {
    let port = startPort;
    while (await isPortInUse(port)) {
        port += 1; // 如果端口被占用，则递增
    }
    return port;
}

async function startDevServer() {
    console.log('🔧 正在启动开发服务器...');

    // 第一次构建
    await build(); // 保留 DEV_ONLY 内容，不合并资源

    // 启动 Express + Socket.IO 服务
    const app = express();
    const httpServer = require('http').createServer(app);
    const io = require('socket.io')(httpServer);

    // 静态资源服务
    app.use(express.static(CONFIG.OUTPUT_DIR));

    // 动态获取可用端口
    const START_PORT = 309;
    const PORT = await getAvailablePort(START_PORT);
    httpServer.listen(PORT, () => {
        console.log(`🚀 开发服务器已启动: http://localhost:${PORT}`);
    });

    // WebSocket 实时通知客户端刷新
    io.on('connection', (socket) => {
        console.log('🔌 客户端已连接');
    });

    function notifyClients() {
        io.emit('reload');
        console.log('🔁 检测到文件变化，正在重新构建...');
    }

    // 使用 chokidar 监听文件变化
    const watcher = chokidar.watch(CONFIG.DEV_DIRS, {
        ignored: /(^|[\/\\])\../, // 忽略 dotfiles
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on('change', async (filePath) => {
        console.log(`📁 文件修改: ${filePath}`);
        await build();
        notifyClients();
    });

    watcher.on('add', async (filePath) => {
        console.log(`📁 文件新增: ${filePath}`);
        await build();
        notifyClients();
    });

    watcher.on('unlink', async (filePath) => {
        console.log(`📁 文件删除: ${filePath}`);
        await build();
        notifyClients();
    });
}

module.exports = { startDevServer };
