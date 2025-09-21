// views/pmd.js
// PMD (Plain Markdown) 解析器
// 解析自定义的PMD标记语言，将其转换为HTML

class PMDParser {
    constructor() {
        this.rules = [];
        this.initRules();
    }

    /**
     * 初始化解析规则
     */
    initRules() {
        // 标题规则 (#, ##, ### 对应 h1, h2, h3)
        this.rules.push({
            name: 'heading',
            pattern: /^(#{1,3})\s+(.*?)$/,
            replacement: (match, hashes, content) => {
                const level = hashes.length;
                return `<h${level} class="pmd-heading pmd-h${level}">${this.escapeHTML(content.trim())}</h${level}>`;
            }
        });

        // 分割线规则
        this.rules.push({
            name: 'thematic_break',
            pattern: /^---$/,
            replacement: () => {
                return `<hr class="pmd-thematic-break">`;
            }
        });

        // 段落规则（默认规则）
        this.rules.push({
            name: 'paragraph',
            pattern: /^([^<\n].*?)$/,
            replacement: (match, content) => {
                return `<p class="pmd-paragraph">${this.escapeHTML(content.trim())}</p>`;
            }
        });
    }

    /**
     * 转义HTML特殊字符
     */
    escapeHTML(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * 解析单行内容
     */
    parseLine(line) {
        line = line.trim();
        
        // 空行处理
        if (line === '') {
            return '<div class="pmd-empty-line"></div>';
        }

        // 应用解析规则
        for (const rule of this.rules) {
            const match = line.match(rule.pattern);
            if (match) {
                return rule.replacement(...match);
            }
        }

        // 默认作为段落处理
        return `<p class="pmd-paragraph">${this.escapeHTML(line)}</p>`;
    }

    /**
     * 解析PMD块内容
     */
    parsePMDContent(content) {
        if (!content) return '';
        
        const lines = content.split('\n');
        const htmlLines = [];
        
        for (const line of lines) {
            const parsedLine = this.parseLine(line);
            if (parsedLine) {
                htmlLines.push(parsedLine);
            }
        }
        
        return htmlLines.join('\n');
    }

    /**
     * 解析完整的文本，提取并转换PMD块
     */
    parse(text) {
        if (!text) return '';
        
        // 匹配 >pmd ... pmd< 块
        return text.replace(/>pmd([\s\S]*?)pmd</g, (match, content) => {
            return this.parsePMDContent(content);
        });
    }
}

/**
 * 处理 PMD 标记语言
 * @param {string} content - 原始 HTML 内容
 * @returns {string} 处理后的 HTML 内容
 */
module.exports = function parsePMD(content) {
    const parser = new PMDParser();
    return parser.parse(content);
};