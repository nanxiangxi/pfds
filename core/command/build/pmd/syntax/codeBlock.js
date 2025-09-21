// pmd/syntax/codeBlock.js
// PMD 代码块语法模块

/**
 * HTML特殊字符转义函数
 * @param {string} text - 要转义的文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\u00a0/g, ' '); // 转义不间断空格
}

class CodeBlockSyntax {
    constructor() {
        this.name = 'code_block';
        this.priority = 80; // 高优先级
    }

    /**
     * 检查是否匹配代码块语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 检查是否是代码块开始标记 ```language
        return line.trim().startsWith('```');
    }

    /**
     * 解析代码块语法（多行）
     * @param {Array} lines - 所有行内容
     * @param {number} startIndex - 开始行索引
     * @returns {Object} 解析结果
     */
    parse(lines, startIndex) {
        const startLine = lines[startIndex].trim();
        let endIndex = startIndex;
        
        // 解析代码块开始标记，只解析语言和复制标记
        const match = startLine.match(/```([a-zA-Z]+)?(=)?/);
        if (!match) {
            return null;
        }
        
        const [, lang, copyable] = match;
        
        // 收集代码内容
        const codeLines = [];
        for (let i = startIndex + 1; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === '```') {
                // 找到代码块结束标记
                endIndex = i;
                break;
            }
            codeLines.push(line);
        }
        
        // 如果没有找到结束标记，这不是一个有效的代码块
        if (endIndex === startIndex) {
            return null;
        }
        
        // 构建代码内容
        const code = codeLines.join('\n');
        
        // 默认值
        let classes = ['pmd-codeblock'];
        
        // 添加语言类（如果存在）
        if (lang) {
            classes.push(lang);
        }
        
        
        // 处理复制按钮，默认不显示
        let copyButton = '';
        if (copyable) {
            copyButton = `<button class="pmd-code-copy-button" onclick="copyCode(this)" title="复制代码"><i class="icon-copy"></i></button>`;
        }
        
        // 构建 language label
        let languageLabel = lang ? `<span class="pmd-code-lang-label">${lang}</span>` : '';
        
        // 转义HTML特殊字符，确保代码中的HTML标签能正确显示
        const escapedCode = escapeHtml(code);
        
        // 构建HTML，移除style属性
        const html = `
<pre class="${classes.join(' ')}"><code>${escapedCode}</code>${languageLabel}${copyButton}</pre>`;
        
        return {
            type: 'code_block',
            html: html,
            endIndex: endIndex
        };
    }
}

module.exports = new CodeBlockSyntax();