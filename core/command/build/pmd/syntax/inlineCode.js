// pmd/syntax/inlineCode.js
// PMD 内联代码语法模块

class InlineCodeSyntax {
    constructor() {
        this.name = 'inline_code';
        this.priority = 75; // 较高优先级
    }

    /**
     * 检查是否匹配内联代码语法
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 检查是否包含内联代码语法 :#color: code :#color:
        return /:#(?:[^:\s]+):\s*[^:]*?\s*:(?:[^:\s]+):/.test(line);
    }

    /**
     * 解析内联代码语法（单行）
     * @param {string} line - 要解析的行
     * @returns {Object} 解析结果
     */
    parse(line) {
        // 查找并替换所有内联代码语法
        let result = line;
        
        // 处理内联代码语法 :#color: code :#color:
        // 支持复杂颜色值如 rgba(255, 255, 255, 0.1)
        const inlineCodeRegex = /:#([^:]+):\s*([^:]*?)\s*:(?:([^:]+):)/g;
        result = result.replace(inlineCodeRegex, (match, startColor, code, endColor) => {
            // 转义HTML特殊字符
            const escapedCode = code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            
            // 构建内联代码HTML
            let inlineCodeHtml = `<code class="pmd-inline-code"`;
            
            // 添加样式
            let style = `background-color: ${startColor};`;
            if (endColor !== startColor) {
                // 如果结束标签与开始标签不同，将其作为前景色
                style += ` color: ${endColor};`;
            }
            
            inlineCodeHtml += ` style="${style}">${escapedCode}</code>`;
            return inlineCodeHtml;
        });
        
        if (result !== line) {
            return {
                type: 'inline_code',
                html: result
            };
        }
        
        return null;
    }
}

module.exports = new InlineCodeSyntax();