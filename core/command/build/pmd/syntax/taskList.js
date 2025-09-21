// pmd/syntax/taskList.js
// PMD 任务列表语法模块

const textStyleSyntax = require('./textStyle');

class TaskListSyntax {
    constructor() {
        this.name = 'taskList';
        this.priority = 70;
    }

    /**
     * 检查是否匹配任务列表语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 检查是否是任务列表项开始：- [ ] 或 - [x]
        return /^\s*-\s*\[\s*[x\s]?\s*\]\s+.*/.test(line);
    }

    /**
     * 解析任务列表语法（多行）
     * @param {Array} lines - 所有行内容
     * @param {number} startIndex - 开始行索引
     * @returns {Object} 解析结果
     */
    parse(lines, startIndex) {
        const taskListLines = [];
        let endIndex = startIndex - 1;
        
        // 收集连续的任务列表项
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i];
            // 检查是否是任务列表项
            if (this.matches(line)) {
                taskListLines.push(line);
                endIndex = i;
            } else {
                // 遇到非任务列表项则停止
                break;
            }
        }

        // 至少需要一个任务列表项
        if (taskListLines.length === 0) {
            return null;
        }

        // 解析任务列表
        const html = this.buildTaskListHTML(taskListLines);
        
        return {
            type: 'taskList',
            html: html,
            endIndex: endIndex
        };
    }

    /**
     * 构建任务列表HTML
     * @param {Array} taskListLines - 任务列表行
     * @returns {string} HTML字符串
     */
    buildTaskListHTML(taskListLines) {
        let html = '<ul class="pmd-task-list">';
        
        for (const line of taskListLines) {
            // 解析任务列表项
            const match = line.match(/^(\s*)-\s*\[\s*([x\s]?)\s*\]\s*(.*)/);
            if (match) {
                const indent = match[1]; // 缩进（用于未来支持嵌套）
                const status = match[2].trim(); // 状态 x 或空
                const content = match[3]; // 内容（不进行trim，保持原有空格）
                
                const isChecked = status === 'x';
                const checkboxClass = isChecked ? 'pmd-task-list-item-checkbox checked' : 'pmd-task-list-item-checkbox';
                const itemClass = isChecked ? 'pmd-task-list-item completed' : 'pmd-task-list-item';
                
                // 处理内容中的各种语法
                const processedContent = this.processContent(content);
                
                html += `<li class="${itemClass}">`;
                html += `<input type="checkbox" class="${checkboxClass}"${isChecked ? ' checked' : ''} disabled>`;
                html += `<span class="pmd-task-list-item-content">${processedContent}</span>`;
                html += '</li>';
            }
        }
        
        html += '</ul>';
        return html;
    }

    /**
     * 处理任务列表项内容中的各种语法
     * @param {string} text - 要处理的文本
     * @returns {string} 处理后的HTML
     */
    processContent(text) {
        // 处理纯文本语法
        const rawTextRegex = /<!([^]*?)!>/g;
        let result = text.replace(rawTextRegex, (match, rawContent) => {
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
        
        // 处理文本样式
        if (textStyleSyntax.matches(result)) {
            return textStyleSyntax.parse(result).html;
        }
        
        return result;
    }
}

module.exports = new TaskListSyntax();