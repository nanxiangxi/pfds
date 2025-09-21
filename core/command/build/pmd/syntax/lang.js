// pmd/syntax/lang.js
// PMD 多语言语法模块

class LangSyntax {
    constructor() {
        this.name = 'lang';
        this.priority = 90; // 高优先级
    }

    /**
     * 检查是否匹配多语言语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 检查是否以 lang[ 开头
        return line.trim().startsWith('lang[');
    }

    /**
     * 解析单行多语言语法
     * @param {string} line - 要解析的行
     * @returns {Object} 解析结果
     */
    parse(line) {
        const trimmedLine = line.trim();
        
        // 检查是否是单行完整的多语言语法 (lang[...])
        if (trimmedLine.endsWith(']')) {
            // 匹配 lang[汉="内容" En="内容"] 格式
            const langRegex = /^lang\[(.*)\]$/;
            const match = trimmedLine.match(langRegex);
            
            if (!match) {
                return null;
            }
            
            // 提取语言键值对
            const content = match[1];
            return this.parseLangContent(content);
        } else {
            // 不是单行完整的多语言语法，返回null让多行解析处理
            return null;
        }
    }
    
    /**
     * 解析多行多语言语法
     * @param {string[]} lines - 所有行
     * @param {number} startIndex - 开始索引
     * @returns {Object} 解析结果
     */
    parseMultiLine(lines, startIndex) {
        let content = '';
        let endIndex = startIndex;
        
        // 检查起始行是否以 lang[ 开头
        const startLine = lines[startIndex].trim();
        if (!startLine.startsWith('lang[')) {
            return null;
        }
        
        // 提取起始行的内容
        const startMatch = startLine.match(/^lang\[(.*)$/);
        if (!startMatch) {
            return null;
        }
        
        content += startMatch[1];
        
        // 如果起始行就结束了（单行），直接处理
        if (startLine.endsWith(']')) {
            const langContent = content.slice(0, -1); // 移除末尾的 ]
            const result = this.parseLangContent(langContent);
            if (result) {
                return {
                    ...result,
                    endIndex: startIndex
                };
            }
            return null;
        }
        
        // 多行处理
        endIndex = startIndex + 1;
        while (endIndex < lines.length) {
            const currentLine = lines[endIndex].trim();
            content += '\n' + currentLine; // 添加换行符
            
            // 检查是否结束
            if (currentLine.endsWith(']')) {
                // 移除末尾的 ]
                const langContent = content.slice(0, -1);
                const result = this.parseLangContent(langContent);
                if (result) {
                    return {
                        ...result,
                        endIndex: endIndex
                    };
                }
                return null;
            }
            
            endIndex++;
        }
        
        // 未找到结束标记
        return null;
    }
    
    /**
     * 解析多语言内容
     * @param {string} content - 多语言内容部分
     * @returns {Object} 解析结果
     */
    parseLangContent(content) {
        const langPairs = {};
        
        // 匹配键值对，支持汉="内容"或En="内容"格式
        // 使用[\w\u4e00-\u9fa5]+来匹配包括中文在内的字符
        // 修复正则表达式，使其能正确处理包含转义引号的内容
        const pairRegex = /([\w\u4e00-\u9fa5]+)="((?:[^"\\]|\\.)*)"/g;
        let pairMatch;
        
        while ((pairMatch = pairRegex.exec(content)) !== null) {
            const langKey = pairMatch[1];
            const langValue = pairMatch[2];
            langPairs[langKey] = langValue;
        }
        
        // 如果没有匹配到任何语言键值对，则返回null
        if (Object.keys(langPairs).length === 0) {
            return null;
        }
        
        // 构建HTML属性
        let attributes = '';
        for (const [key, value] of Object.entries(langPairs)) {
            // 不进行额外的转义处理，保留原始文本格式
            attributes += ` data-lang-${key}="${value}"`;
        }
        
        // 构建HTML
        const html = `<span${attributes}></span>`;
        
        return {
            type: 'lang',
            html: html
        };
    }
}

module.exports = new LangSyntax();