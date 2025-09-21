// pmd/syntax/textStyle.js
// PMD 文本样式语法模块（斜体、粗体、粗斜体、删除线）

class TextStyleSyntax {
    constructor() {
        this.name = 'textStyle';
        this.priority = 25; // 高于段落优先级
    }

    /**
     * 检查是否包含文本样式语法
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否包含文本样式语法
     */
    matches(line) {
        // 检查是否包含任何文本样式标记
        return /(\*\*.*?\*\*|_.*?_|~~.*?~~|\*\*?_.*?_\*\*?)/.test(line);
    }

    /**
     * 解析文本样式语法
     * @param {string} line - 要解析的行
     * @returns {Object} 解析结果
     */
    parse(line) {
        let processedLine = line;
        
        // 处理粗斜体 **_粗斜体_** 或 *_粗斜体_*
        processedLine = processedLine.replace(/\*\*_(.*?)_\*\*/g, '<strong class="pmd-strong"><em class="pmd-em">$1</em></strong>');
        processedLine = processedLine.replace(/\*_(.*?)_\*/g, '<strong class="pmd-strong"><em class="pmd-em">$1</em></strong>');
        
        // 处理粗体 **粗体**
        processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong class="pmd-strong">$1</strong>');
        
        // 处理斜体 _斜体_
        processedLine = processedLine.replace(/_([^_]*?)_/g, '<em class="pmd-em">$1</em>');
        
        // 处理删除线 ~~删除线~~
        processedLine = processedLine.replace(/~~(.*?)~~/g, '<del class="pmd-del">$1</del>');
        
        return {
            type: 'textStyle',
            content: processedLine,
            html: processedLine
        };
    }
}

module.exports = new TextStyleSyntax();