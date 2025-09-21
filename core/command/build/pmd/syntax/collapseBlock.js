// pmd/syntax/collapseBlock.js
// PMD 折叠块语法模块

const { loadSyntaxModules } = require('../syntax');
const parsePMD = require('../parser');

class CollapseBlockSyntax {
    constructor() {
        this.name = 'collapseBlock';
        this.priority = 85; // 高优先级
    }

    /**
     * 检查是否匹配折叠块语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 检查是否以折叠块开始标记 "(" 开头
        const trimmedLine = line.trim();
        return trimmedLine.startsWith('(') && trimmedLine.includes(')[');
    }

    /**
     * 解析折叠块语法
     * @param {Array} lines - 所有行内容
     * @param {number} startIndex - 开始行索引
     * @returns {Object} 解析结果
     */
    parse(lines, startIndex) {
        const line = lines[startIndex];
        const trimmedLine = line.trim();
        
        // 检查是否是单行折叠块 (标题)[内容]^
        if (trimmedLine.endsWith('^')) {
            const titleEndIndex = trimmedLine.indexOf(')[');
            if (titleEndIndex !== -1) {
                const title = trimmedLine.substring(1, titleEndIndex);
                // 修正内容提取逻辑，避免多出 "]" 字符
                const content = trimmedLine.substring(titleEndIndex + 2, trimmedLine.length - 1);
                
                return {
                    type: 'collapseBlock',
                    html: this.generateCollapseBlock(title, content, startIndex),
                    endIndex: startIndex
                };
            }
        }
        
        // 多行折叠块处理
        const titleEndIndex = trimmedLine.indexOf(')[');
        if (titleEndIndex !== -1) {
            const title = trimmedLine.substring(1, titleEndIndex);
            let contentLines = [];
            
            // 如果开始行还有内容，添加到内容中
            if (titleEndIndex + 2 < trimmedLine.length) {
                // 修正内容提取逻辑，避免多出 "]" 字符
                contentLines.push(trimmedLine.substring(titleEndIndex + 2));
            }
            
            let endIndex = startIndex;
            
            // 查找结束标记
            for (let i = startIndex + 1; i < lines.length; i++) {
                const currentLine = lines[i];
                if (currentLine.trim().endsWith('^')) {
                    // 移除结束标记，同时避免多出 "]" 字符
                    const contentLine = currentLine.trim().slice(0, -1);
                    if (contentLine && !contentLine.endsWith(']')) {
                        contentLines.push(contentLine);
                    }
                    endIndex = i;
                    break;
                } else {
                    contentLines.push(currentLine);
                }
            }
            
            const content = contentLines.join('\n');
            
            return {
                type: 'collapseBlock',
                html: this.generateCollapseBlock(title, content, startIndex),
                endIndex: endIndex
            };
        }
        
        return null;
    }

    /**
     * 解析折叠块内容中的PMD语法
     * @param {string} content - 折叠块内容
     * @returns {string} 解析后的HTML
     */
    parseContent(content) {
        // 使用完整的PMD解析器来解析内容
        return parsePMD(`>pmd\n${content}\npmd<`);
    }

    /**
     * 生成折叠块HTML
     * @param {string} title - 折叠块标题
     * @param {string} content - 折叠块内容
     * @param {number} index - 折叠块索引
     * @returns {string} 生成的HTML
     */
    generateCollapseBlock(title, content, index) {
        // 转义HTML特殊字符（仅用于标题）
        const escapedTitle = this.escapeHtml(title);
        
        // 解析内容中的PMD语法
        const parsedContent = this.parseContent(content);
        
        // 优化HTML结构，减少多余换行
        return `<div class="pmd-collapse-block">` +
               `<div class="pmd-collapse-header" onclick="toggleCollapseBlock('collapse-${index}')">` +
               `<span class="pmd-collapse-title">${escapedTitle}</span>` +
               `<span class="pmd-collapse-toggle"><i class="icon-left"></i></span>` +
               `</div>` +
               `<div id="collapse-${index}" class="pmd-collapse-content" style="display: none;">` +
               `<div class="pmd-collapse-inner">${parsedContent}</div>` +
               `</div>` +
               `</div>`;
    }

    /**
     * 转义HTML特殊字符
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

module.exports = new CollapseBlockSyntax();