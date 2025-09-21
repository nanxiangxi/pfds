// pmd/syntax/roundedNotification.js
// PMD 圆角提示框语法模块

const { loadSyntaxModules } = require('../syntax');

class RoundedNotificationSyntax {
    constructor() {
        this.name = 'rounded_notification';
        this.priority = 80; // 高优先级
    }

    /**
     * 检查是否匹配圆角提示框语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        const trimmedLine = line.trim();
        // 只要以 (:: 开头就是匹配
        return trimmedLine.startsWith('(::');
    }

    /**
     * 解析圆角提示框语法
     * @param {Array} lines - 所有行内容
     * @param {number} startIndex - 开始行索引
     * @returns {Object} 解析结果
     */
    parse(lines, startIndex) {
        let endIndex = startIndex;
        let contentLines = [];
        let hasStart = false;
        let hasEnd = false;

        // 查找开始标记
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (line.startsWith('(::') && !hasStart) {
                hasStart = true;
                // 检查是否是单行 (::content::)
                if (line.endsWith('::)') && line.length > 6) {
                    // 单行情况
                    contentLines.push(line.substring(3, line.length - 3));
                    hasEnd = true;
                    endIndex = i;
                    break;
                }
                // 多行开始，继续查找结束标记
                continue;
            }
            
            if (hasStart && !hasEnd) {
                if (line === '::)') {
                    // 找到结束标记
                    hasEnd = true;
                    endIndex = i;
                    break;
                } else {
                    // 收集内容行
                    contentLines.push(lines[i]);
                }
            }
        }

        if (!hasStart || !hasEnd) {
            return null;
        }

        // 合并内容
        const content = contentLines.join('\n');

        // 解析内容中的语法标记
        let bordered = false;
        let customColor = '';
        let displayContent = content;

        // 解析语法：> 代表边框，# 或 rgba 代表颜色，后面是内容
        if (content.startsWith('>')) {
            bordered = true;
            displayContent = content.substring(1);
            
            // 检查边框颜色
            if (displayContent.startsWith('#') || displayContent.startsWith('rgba(')) {
                let colorMatch;
                if (displayContent.startsWith('#')) {
                    colorMatch = displayContent.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\s*(.*)$/s);
                    if (colorMatch) {
                        customColor = '#' + colorMatch[1];
                        displayContent = colorMatch[2] || '';
                    }
                } else if (displayContent.startsWith('rgba(')) {
                    colorMatch = displayContent.match(/^(rgba\([^)]+\))\s*(.*)$/s);
                    if (colorMatch) {
                        customColor = colorMatch[1];
                        displayContent = colorMatch[2] || '';
                    }
                }
            }
        } else if (content.startsWith('#') || content.startsWith('rgba(')) {
            // 背景颜色
            let colorMatch;
            if (content.startsWith('#')) {
                colorMatch = content.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\s*(.*)$/s);
                if (colorMatch) {
                    customColor = '#' + colorMatch[1];
                    displayContent = colorMatch[2] || '';
                }
            } else if (content.startsWith('rgba(')) {
                colorMatch = content.match(/^(rgba\([^)]+\))\s*(.*)$/s);
                if (colorMatch) {
                    customColor = colorMatch[1];
                    displayContent = colorMatch[2] || '';
                }
            }
        }

        // 构建HTML
        let classes = 'pmd-notification pmd-notification-rounded';
        let styles = '';
        
        if (bordered) {
            classes += ' pmd-notification-bordered';
            if (customColor) {
                styles = ` style="border-left-color: ${customColor};"`;
            }
        } else if (customColor) {
            classes += ' pmd-notification-custom';
            
            // 根据背景颜色设置字体颜色
            if (customColor.startsWith('#')) {
                // 简单的亮度检测来决定字体颜色
                const hex = customColor.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                if (brightness > 128) {
                    styles = ` style="background-color: ${customColor}; color: #333;"`;
                } else {
                    styles = ` style="background-color: ${customColor}; color: #fff;"`;
                }
            } else if (customColor.startsWith('rgba(')) {
                // 从rgba中提取rgb值来计算亮度
                const rgbaMatch = customColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                if (rgbaMatch) {
                    const r = parseInt(rgbaMatch[1]);
                    const g = parseInt(rgbaMatch[2]);
                    const b = parseInt(rgbaMatch[3]);
                    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
                    if (brightness > 128) {
                        styles = ` style="background-color: ${customColor}; color: #333;"`;
                    } else {
                        styles = ` style="background-color: ${customColor}; color: #fff;"`;
                    }
                }
            } else {
                styles = ` style="background-color: ${customColor};"`;
            }
        }

        // 解析嵌套的PMD内容
        const parsedContent = this.parseNestedContent(displayContent);

        return {
            type: 'rounded_notification',
            content: displayContent,
            html: `<div class="${classes}"${styles}>${parsedContent}</div>`,
            endIndex: endIndex
        };
    }

    /**
     * 解析嵌套的PMD内容
     * @param {string} content - 要解析的内容
     * @returns {string} 解析后的HTML
     */
    parseNestedContent(content) {
        if (!content) return content;
        
        // 加载所有语法模块
        const syntaxModules = loadSyntaxModules();
        // 移除通知框模块以避免递归
        const filteredModules = syntaxModules.filter(module => 
            module.name !== 'notification' && module.name !== 'rounded_notification');
        
        // 按优先级排序
        filteredModules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        // 获取文本样式模块
        const textStyleModule = syntaxModules.find(module => module.name === 'textStyle');
        
        // 按行处理内容
        const lines = content.split('\n');
        const parsedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let parsed = false;
            let parsedResult = line;
            
            // 尝试所有语法模块
            for (const syntax of filteredModules) {
                if (syntax.matches && syntax.matches(line)) {
                    // 特殊处理标题语法
                    if (syntax.name === 'heading') {
                        const result = syntax.parse(line);
                        if (result && result.html) {
                            parsedResult = result.html;
                            parsed = true;
                            break;
                        }
                    }
                    // 特殊处理多语言语法
                    else if (syntax.name === 'lang') {
                        const result = syntax.parse(line);
                        if (result && result.html) {
                            parsedResult = result.html;
                            parsed = true;
                            break;
                        }
                    }
                }
            }
            
            // 如果有语法模块处理了内容，则进一步处理文本样式
            if (parsed) {
                // 处理纯文本语法
                const rawTextRegex = /<!([^]*?)!>/g;
                parsedResult = parsedResult.replace(rawTextRegex, (match, rawContent) => {
                    // 转义HTML特殊字符
                    const escapedContent = rawContent
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    return `<pre class="pmd-raw-text">${escapedContent}</pre>`;
                });
                
                // 对于已解析的内容，如果包含文本样式，则进一步处理
                if (textStyleModule && textStyleModule.parse) {
                    const textStyleResult = textStyleModule.parse(parsedResult);
                    if (textStyleResult && textStyleResult.html) {
                        parsedResult = textStyleResult.html;
                    }
                }
                parsedLines.push(parsedResult);
            } else {
                // 使用文本样式模块处理内联语法
                let result = line;
                
                // 处理纯文本语法
                const rawTextRegex = /<!([^]*?)!>/g;
                result = result.replace(rawTextRegex, (match, rawContent) => {
                    // 转义HTML特殊字符
                    const escapedContent = rawContent
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#039;');
                    return `<pre class="pmd-raw-text">${escapedContent}</pre>`;
                });
                
                // 处理图片语法
                const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;
                result = result.replace(imageRegex, (match, alt, src, title) => {
                    let imageHtml = `<img src="${src}" alt="${alt}" class="pmd-image"`;
                    if (title) {
                        imageHtml += ` title="${title}"`;
                    }
                    imageHtml += '>';
                    return imageHtml;
                });
                
                // 处理内部链接语法
                const internalLinkRegex = /\[([^\]]+)\]\(#([^)]+)\)/g;
                result = result.replace(internalLinkRegex, (match, linkText, pageId) => {
                    const normalizedPageId = pageId.toLowerCase().replace(/\s+/g, '-');
                    return `<a href="#" class="pmd-internal-link" onclick="pfdsShowPage('${normalizedPageId}');return false;">${linkText}</a>`;
                });
                
                // 处理链接语法
                const linkRegex = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;
                result = result.replace(linkRegex, (match, text, url, title) => {
                    let linkHtml = `<a href="${url}" class="pmd-link"`;
                    if (title) {
                        linkHtml += ` title="${title}"`;
                    }
                    linkHtml += `>${text}</a>`;
                    return linkHtml;
                });
                
                // 处理文本样式（仅当没有纯文本语法时才处理）
                if (textStyleModule && textStyleModule.parse && !result.includes('<pre class="pmd-raw-text">')) {
                    const textStyleResult = textStyleModule.parse(result);
                    if (textStyleResult && textStyleResult.html) {
                        result = textStyleResult.html;
                    }
                }
                
                parsedLines.push(result);
            }
        }
        
        // 修复：正确处理空行和换行
        // 只有在需要的地方添加换行，而不是在所有元素之间添加
        let result = '';
        for (let i = 0; i < parsedLines.length; i++) {
            // 如果当前行是空行，直接添加换行符
            if (parsedLines[i] === '') {
                result += '\n';
                continue;
            }
            
            result += parsedLines[i];
            
            // 只有当前元素不是PMD语法元素且下一行不是空行时才添加换行
            if (i < parsedLines.length - 1 && 
                !parsedLines[i].startsWith('<h') && 
                !parsedLines[i].startsWith('<div') &&
                parsedLines[i+1] !== '') {
                result += '\n';
            }
        }
        
        return result;
    }
}

module.exports = new RoundedNotificationSyntax();