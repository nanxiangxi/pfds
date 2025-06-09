// log.js - 日志模块
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    underline: '\x1b[4m',
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

class Logger {
    constructor() {
        this.stepStack = [];
        this.timers = {};
        this.config = {
            verbose: false,
            level: 'info',
            color: true
        };
    }

    // 配置日志系统
    configure(options = {}) {
        Object.assign(this.config, options);
    }

    // 获取当前时间戳
    timestamp() {
        return Date.now();
    }

    // 格式化耗时
    formatDuration(start) {
        const ms = this.timestamp() - start;
        return ms < 1000 ? `${ms}ms` : `${(ms/1000).toFixed(1)}s`;
    }

    // ANSI颜色应用
    colorize(text, colorCode) {
        return this.config.color ? `${colorCode}${text}${colors.reset}` : text;
    }

    // 标准化日志输出
    log(level, icon, color, message, ...args) {
        if (this.getLevelPriority(level) < this.getLevelPriority(this.config.level)) return;

        const prefix = this.colorize(`[${level}]`, color);
        const formattedMessage = this.colorize(message, color);
        console.log(`${prefix} ${formattedMessage}`, ...args);
    }

    // 获取日志级别优先级
    getLevelPriority(level) {
        const levels = ['error', 'warn', 'info', 'debug'];
        return levels.indexOf(level.toLowerCase());
    }

    // 主要步骤开始
    stepStart(name) {
        this.stepStack.push(name);
        this.timers[name] = this.timestamp();

        const prefix = this.colorize('⚙️', colors.blue);
        console.log(`${prefix} [${name}] 开始...`);
    }

    // 主要步骤结束
    stepEnd(name) {
        const duration = this.formatDuration(this.timers[name]);
        const prefix = this.colorize('✔️', colors.green);
        console.log(`${prefix} [${name}] 完成（${duration}）\n`);

        this.stepStack.pop();
    }

    // 子步骤状态
    subStep(name, status = 'success') {
        const indent = '    ';
        const last = this.stepStack[this.stepStack.length - 1];

        let statusIcon, statusColor;

        switch(status) {
            case 'success':
                statusIcon = '✔️';
                statusColor = colors.green;
                break;
            case 'error':
                statusIcon = '✖';
                statusColor = colors.red;
                break;
            case 'warn':
                statusIcon = '⚠️';
                statusColor = colors.yellow;
                break;
            default:
                statusIcon = '➤';
                statusColor = colors.cyan;
        }

        const line = status === 'success'
            ? `${indent}├─ ${name} ${this.colorize(statusIcon, statusColor)}`
            : status === 'error'
                ? `${indent}├─ ${name} ${this.colorize(statusIcon, statusColor)}`
                : `${indent}➤ ${name} ${this.colorize(statusIcon, statusColor)}`;

        console.log(line);
    }

    // 摘要信息
    summary(stats) {
        const title = this.colorize('📊 构建摘要:', colors.bright + colors.cyan);
        console.log(title);

        Object.entries(stats).forEach(([key, value]) => {
            const keyColor = this.colorize(`${key}:`, colors.cyan);
            const valueColor = this.colorize(value, colors.green);
            console.log(`  • ${keyColor} ${valueColor}`);
        });
    }

    // 专业标题
    title(message) {
        const line = this.colorize(`\n[PFDS] ${message}`, colors.bright + colors.green);
        console.log(line + '\n');
    }

    // 错误日志
    error(message, ...args) {
        this.log('error', '❌', colors.red, message, ...args);
    }

    // 警告日志
    warn(message, ...args) {
        this.log('warn', '⚠️ ', colors.yellow, message, ...args);
    }

    // 信息日志
    info(message, ...args) {
        this.log('info', 'ℹ️ ', colors.cyan, message, ...args);
    }

    // 调试日志
    debug(message, ...args) {
        this.log('debug', '🔍', colors.dim + colors.white, message, ...args);
    }
}

// 创建单例
const logger = new Logger();
module.exports = logger;
