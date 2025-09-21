// pmd/syntax/orderedList.js
// PMD 有序列表语法模块

class OrderedListSyntax {
    constructor() {
        this.name = 'ordered_list';
        this.priority = 60; // 中等优先级
    }

    /**
     * 检查是否匹配有序列表语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        const trimmedLine = line.trim();
        // 以数字开头，后跟点号或间隔符，再跟空格的行匹配有序列表
        return /^(\d+)[·.]?\s+/.test(trimmedLine);
    }

    /**
     * 解析有序列表语法
     * @param {Array} lines - 所有行内容
     * @param {number} startIndex - 开始行索引
     * @returns {Object} 解析结果
     */
    parse(lines, startIndex) {
        const listItems = [];
        let endIndex = startIndex;
        
        // 收集连续的列表项
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // 检查是否是列表项
            const match = trimmedLine.match(/^(\d+(?:[·.]\d+)*)[·.]?\s+(.*)$/);
            if (match) {
                const [, numberPart, content] = match;
                const levels = numberPart.split(/[·.]/).map(Number);
                const level = levels.length;
                
                listItems.push({
                    level: level,
                    number: levels,
                    content: content,
                    lineIndex: i
                });
                endIndex = i;
            } else if (trimmedLine === '') {
                // 空行，继续但不加入列表项
                endIndex = i;
            } else {
                // 遇到非列表行，停止解析
                break;
            }
        }
        
        if (listItems.length === 0) {
            return null;
        }
        
        // 构建嵌套列表HTML
        const html = this.buildNestedList(listItems);
        
        return {
            type: 'ordered_list',
            html: html,
            endIndex: endIndex
        };
    }
    
    /**
     * 构建嵌套列表HTML
     * @param {Array} items - 列表项数组
     * @returns {string} HTML字符串
     */
    buildNestedList(items) {
        if (!items || items.length === 0) return '';
        
        // 构建树状结构
        const root = { children: [] };
        
        for (const item of items) {
            const { level, content } = item;
            
            // 找到合适的父节点
            let parent = root;
            for (let i = 1; i < level; i++) {
                if (parent.children.length > 0) {
                    // 获取最后一个子节点作为父节点
                    parent = parent.children[parent.children.length - 1];
                } else {
                    // 如果没有合适的父节点，创建一个虚拟节点
                    const virtualNode = { children: [] };
                    parent.children.push(virtualNode);
                    parent = virtualNode;
                }
            }
            
            // 添加当前节点
            parent.children.push({
                content: content,
                children: []
            });
        }
        
        // 递归构建HTML
        function buildHtml(nodes) {
            if (!nodes || nodes.length === 0) {
                return '';
            }
            
            let html = '<ol class="pmd-ol">';
            for (const node of nodes) {
                // 处理节点内容中的链接和图片
                let content = node.content;
                
                // 处理纯文本语法
                const rawTextRegex = /<!([^]*?)!>/g;
                content = content.replace(rawTextRegex, (match, rawContent) => {
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
                content = content.replace(imageRegex, (match, alt, src, title) => {
                    let imageHtml = `<img src="${src}" alt="${alt}" class="pmd-image"`;
                    if (title) {
                        imageHtml += ` title="${title}"`;
                    }
                    imageHtml += '>';
                    return imageHtml;
                });
                
                // 处理内部链接语法
                const internalLinkRegex = /\[([^\]]+)\]\(#([^)]+)\)/g;
                content = content.replace(internalLinkRegex, (match, linkText, pageId) => {
                    const normalizedPageId = pageId.toLowerCase().replace(/\s+/g, '-');
                    return `<a href="#" class="pmd-internal-link" onclick="pfdsShowPage('${normalizedPageId}');return false;">${linkText}</a>`;
                });
                
                // 处理链接语法
                const linkRegex = /\[([^\]]+)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g;
                content = content.replace(linkRegex, (match, text, url, title) => {
                    let linkHtml = `<a href="${url}" class="pmd-link"`;
                    if (title) {
                        linkHtml += ` title="${title}"`;
                    }
                    linkHtml += `>${text}</a>`;
                    return linkHtml;
                });
                
                html += `<li class="pmd-li">${content}`;
                html += buildHtml(node.children);
                html += '</li>';
            }
            html += '</ol>';
            return html;
        }
        
        return buildHtml(root.children);
    }
}

module.exports = new OrderedListSyntax();