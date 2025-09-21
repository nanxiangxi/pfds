// pmd/syntax/heading.js
// PMD 标题语法模块

const { loadSyntaxModules } = require('./index');

class HeadingSyntax {
    constructor() {
        this.name = 'heading';
        this.priority = 100; // 高优先级
    }

    /**
     * 检查是否匹配标题语法
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        const trimmedLine = line.trim();
        if (!trimmedLine.startsWith('#')) return false;
        
        // 检查是否是有效的标题 (# 后面必须跟空格)
        const match = trimmedLine.match(/^(#{1,3})\s+(.*)$/);
        return match !== null;
    }

    /**
     * 解析标题语法
     * @param {string} line - 要解析的行
     * @returns {Object} 解析结果
     */
    parse(line) {
        const trimmedLine = line.trim();
        const match = trimmedLine.match(/^(#{1,3})\s+(.*)$/);
        
        if (!match) {
            return null;
        }
        
        const [, hashes, content] = match;
        const level = hashes.length;
        
        // 解析嵌套的多语言语法和文本样式
        const parsedContent = this.parseNestedContent(content.trim());
        
        return {
            type: 'heading',
            level: level,
            content: content.trim(),
            html: `<h${level} class="pmd-h${level}">${parsedContent}</h${level}>`
        };
    }
    
    /**
     * 解析嵌套内容中的多语言语法和文本样式
     * @param {string} content - 要解析的内容
     * @returns {string} 解析后的内容
     */
    parseNestedContent(content) {
        if (!content) return content;
        
        // 加载所有语法模块
        const syntaxModules = loadSyntaxModules();
        // 获取多语言和文本样式模块
        const langModule = syntaxModules.find(module => module.name === 'lang');
        const textStyleModule = syntaxModules.find(module => module.name === 'textStyle');
        
        let result = content;
        
        // 先处理文本样式语法
        if (textStyleModule && textStyleModule.parse) {
            const textStyleResult = textStyleModule.parse(result);
            if (textStyleResult && textStyleResult.html) {
                result = textStyleResult.html;
            }
        }
        
        // 再处理多语言语法
        if (langModule) {
            const langRegex = /lang\[[^\]]+\]/g;
            let match;
            
            while ((match = langRegex.exec(result)) !== null) {
                const langSyntax = match[0];
                const parsed = langModule.parse(langSyntax);
                if (parsed && parsed.html) {
                    result = result.replace(langSyntax, parsed.html);
                }
            }
        }
        
        return result;
    }
}

module.exports = new HeadingSyntax();