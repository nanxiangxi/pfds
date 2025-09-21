// pmd/syntax/paragraph.js
// PMD 段落语法模块

class ParagraphSyntax {
    constructor() {
        this.name = 'paragraph';
        this.priority = 10; // 最低优先级
    }

    /**
     * 检查是否匹配段落语法（总是匹配，作为默认选项）
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 段落作为默认选项，总是匹配（除非是空行）
        return line.trim() !== '';
    }

    /**
     * 解析段落语法（单行）
     * @param {string} line - 要解析的行
     * @returns {Object} 解析结果
     */
    parse(line) {
        // 处理纯文本语法
        let result = this.processRawText(line);
        
        // 处理图片语法（必须在链接语法之前处理）
        result = this.processImages(result);
        
        // 处理内部链接语法
        result = this.processInternalLinks(result);
        
        // 处理链接语法
        result = this.processLinks(result);
        
        return {
            type: 'paragraph',
            html: result
        };
    }
    
    /**
     * 处理纯文本语法
     * @param {string} text - 要处理的文本
     * @returns {string} 处理后的文本
     */
    processRawText(text) {
        const rawTextRegex = /<!([^]*?)!>/g;
        return text.replace(rawTextRegex, (match, rawContent) => {
            // 转义HTML特殊字符
            const escapedContent = rawContent
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
            return `<pre class="pmd-raw-text">${escapedContent}</pre>`;
        });
    }
    
    /**
     * 处理图片语法
     * @param {string} text - 要处理的文本
     * @returns {string} 处理后的文本
     */
    processImages(text) {
        const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;
        return text.replace(imageRegex, (match, alt, src, title) => {
            let imageHtml = `<img src="${src}" alt="${alt}" class="pmd-image"`;
            if (title) {
                imageHtml += ` title="${title}"`;
            }
            imageHtml += '>';
            return imageHtml;
        });
    }
    
    /**
     * 处理内部链接语法
     * @param {string} text - 要处理的文本
     * @returns {string} 处理后的文本
     */
    processInternalLinks(text) {
        // 匹配 [text](#id) 格式的内部链接
        const internalLinkRegex = /\[([^\]]+)\]\(#([^)]+)\)/g;
        return text.replace(internalLinkRegex, (match, linkText, pageId) => {
            // 转换 pageId 为小写并移除特殊字符，以匹配 pfdsShowPage 函数的参数格式
            const normalizedPageId = pageId.toLowerCase().replace(/\s+/g, '-');
            return `<a href="#" class="pmd-internal-link" onclick="pfdsShowPage('${normalizedPageId}');return false;">${linkText}</a>`;
        });
    }
    
    /**
     * 处理链接语法
     * @param {string} text - 要处理的文本
     * @returns {string} 处理后的文本
     */
    processLinks(text) {
        const linkRegex = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;
        return text.replace(linkRegex, (match, text, url, title) => {
            let linkHtml = `<a href="${url}" class="pmd-link"`;
            if (title) {
                linkHtml += ` title="${title}"`;
            }
            linkHtml += `>${text}</a>`;
            return linkHtml;
        });
    }
}

module.exports = new ParagraphSyntax();