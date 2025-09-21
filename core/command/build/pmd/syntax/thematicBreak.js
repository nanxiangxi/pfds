// pmd/syntax/thematicBreak.js
// PMD 分割线语法模块

class ThematicBreakSyntax {
    constructor() {
        this.name = 'thematic_break';
        this.priority = 90; // 较高优先级
    }

    /**
     * 检查是否匹配分割线语法
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        const trimmedLine = line.trim();
        // 支持带文字的分割线
        return trimmedLine.startsWith('===') ||  // 双分割线
               trimmedLine.startsWith('---') ||  // 单分割线
               trimmedLine.startsWith('···');    // 虚线分割线
    }

    /**
     * 解析分割线语法
     * @param {string} line - 要解析的行
     * @returns {Object} 解析结果
     */
    parse(line) {
        const trimmedLine = line.trim();
        
        // 检查是否是支持的分割线类型
        if (!(trimmedLine.startsWith('===') || 
              trimmedLine.startsWith('---') || 
              trimmedLine.startsWith('···'))) {
            return null;
        }
        
        // 提取文字内容（如果有的话）
        let text = '';
        let type = '';
        let className = 'pmd-thematic-break';
        
        if (trimmedLine.startsWith('===')) {
            type = 'double';
            className += ' pmd-thematic-break-double';
            text = trimmedLine.substring(3).trim();
            if (text.endsWith('===')) {
                text = text.substring(0, text.length - 3).trim();
            }
        } else if (trimmedLine.startsWith('---')) {
            type = 'single';
            text = trimmedLine.substring(3).trim();
            if (text.endsWith('---')) {
                text = text.substring(0, text.length - 3).trim();
            }
        } else if (trimmedLine.startsWith('···')) {
            type = 'dotted';
            className += ' pmd-thematic-break-dotted';
            text = trimmedLine.substring(3).trim();
            if (text.endsWith('···')) {
                text = text.substring(0, text.length - 3).trim();
            }
        }
        
        // 生成HTML
        if (text) {
            // 带文字的分割线
            return {
                type: 'thematic_break',
                html: `<div class="${className} pmd-thematic-break-with-text"><span class="pmd-thematic-break-text">${text}</span></div>`
            };
        } else {
            // 不带文字的分割线
            return {
                type: 'thematic_break',
                html: `<hr class="${className}">`
            };
        }
    }
}

module.exports = new ThematicBreakSyntax();