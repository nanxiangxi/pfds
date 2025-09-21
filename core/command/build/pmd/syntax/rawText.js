// pmd/syntax/rawText.js
// PMD 纯文本语法模块

class RawTextSyntax {
    constructor() {
        this.name = 'rawText';
        this.priority = 100; // 最高优先级
    }

    /**
     * 检查是否匹配纯文本语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 检查是否以 <! 开头
        return line.trim().startsWith('<!');
    }

    /**
     * 解析纯文本语法（单行或多行）
     * @param {Array} lines - 所有行内容
     * @param {number} startIndex - 开始行索引
     * @returns {Object} 解析结果
     */
    parse(lines, startIndex) {
        let endIndex = startIndex;
        let contentLines = [];
        let hasStart = false;
        let hasEnd = false;

        // 查找开始标记和结束标记
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            if (line.includes('<!') && !hasStart) {
                hasStart = true;
                // 检查是否在同一行内有结束标记 !>
                if (line.includes('!>')) {
                    // 单行情况
                    const startIdx = line.indexOf('<!');
                    const endIdx = line.indexOf('!>', startIdx);
                    if (endIdx > startIdx) {
                        contentLines.push(line.substring(startIdx + 2, endIdx));
                        hasEnd = true;
                        endIndex = i;
                        break;
                    }
                } else {
                    // 多行开始，提取开始标记后的内容
                    const startIdx = line.indexOf('<!');
                    contentLines.push(line.substring(startIdx + 2));
                }
                continue;
            }
            
            if (hasStart && !hasEnd) {
                if (line.includes('!>')) {
                    // 找到结束标记
                    const endIdx = line.indexOf('!>');
                    contentLines.push(line.substring(0, endIdx));
                    hasEnd = true;
                    endIndex = i;
                    break;
                } else {
                    // 收集内容行
                    contentLines.push(line);
                }
            }
        }

        if (!hasStart || !hasEnd) {
            return null;
        }

        // 合并内容并转义HTML特殊字符
        const content = contentLines.join('\n');
        const escapedContent = this.escapeHtml(content);

        return {
            type: 'rawText',
            html: `<pre class="pmd-raw-text">${escapedContent}</pre>`,
            endIndex: endIndex
        };
    }

    /**
     * 转义HTML特殊字符
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

module.exports = new RawTextSyntax();