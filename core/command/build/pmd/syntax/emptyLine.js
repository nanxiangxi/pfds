// pmd/syntax/emptyLine.js
// PMD 空行语法模块

class EmptyLineSyntax {
    constructor() {
        this.name = 'emptyLine';
        this.priority = 10; // 最低优先级
    }

    /**
     * 检查是否为空行
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否为空行
     */
    matches(line) {
        return line.trim() === '';
    }

    /**
     * 解析空行语法
     * @param {string} line - 要解析的行
     * @returns {Object} 解析结果
     */
    parse(line) {
        // 返回换行符以保留段落间距
        return {
            type: 'emptyLine',
            content: '',
            html: '\n'
        };
    }
}

module.exports = new EmptyLineSyntax();