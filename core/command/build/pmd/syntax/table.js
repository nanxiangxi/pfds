// pmd/syntax/table.js
// PMD 表格语法模块

const textStyleSyntax = require('./textStyle');

class TableSyntax {
    constructor() {
        this.name = 'table';
        this.priority = 85; // 较高优先级
    }

    /**
     * 检查是否匹配表格语法开始
     * @param {string} line - 要检查的行
     * @returns {boolean} 是否匹配
     */
    matches(line) {
        // 检查是否是表格开始标记，即以 | 开头的分隔行
        return line.trim().startsWith('|') && /^[\s\S]*\|[\s\S]*$/.test(line) && 
               line.trim().split('|').slice(1, -1).every(cell => {
                   const trimmed = cell.trim();
                   return /^:---:$|^:---|---:$|^---{3,}$/.test(trimmed);
               });
    }

    /**
     * 解析表格语法（多行）
     * @param {Array} lines - 所有行内容
     * @param {number} startIndex - 开始行索引
     * @returns {Object} 解析结果
     */
    parse(lines, startIndex) {
        // 检查是否是有效的表格开始
        // 表格至少需要三行：分隔行、表头行、数据行
        if (startIndex + 2 >= lines.length) {
            return null;
        }

        // 第一行应该是分隔行，包含对齐信息
        const separatorLine = lines[startIndex].trim();
        if (!separatorLine.startsWith('|') || !separatorLine.endsWith('|')) {
            return null;
        }

        // 检查分隔行是否符合表格分隔符格式
        const separatorCells = separatorLine.split('|').slice(1, -1);
        // 至少需要一个有效分隔符
        if (separatorCells.length === 0) {
            return null;
        }
        
        const validSeparator = separatorCells.every(cell => {
            const trimmed = cell.trim();
            // 支持 :---: (居中对齐)、:--- (左对齐)、---: (右对齐) 或 --- (默认左对齐)
            // 要求至少3个横线
            return /^:---:$|^:---|---:$|^---{3,}$/.test(trimmed);
        });

        if (!validSeparator) {
            return null;
        }

        // 第二行应该是表头
        const headerLine = lines[startIndex + 1].trim();
        if (!headerLine.startsWith('|') || !headerLine.endsWith('|')) {
            return null;
        }

        // 收集表格行
        const tableLines = [separatorLine, headerLine];
        let endIndex = startIndex + 1;

        // 从第三行开始收集数据行
        for (let i = startIndex + 2; i < lines.length; i++) {
            const line = lines[i].trim();
            // 表格以连续的非表格行结束，或者到达文件末尾
            if (!line.startsWith('|') || !line.endsWith('|')) {
                endIndex = i - 1;
                break;
            }
            tableLines.push(line);
            endIndex = i;
        }

        // 至少需要有分隔行、表头行和一行数据
        if (tableLines.length < 3) {
            return null;
        }

        // 解析表格
        const html = this.buildTableHTML(tableLines);
        
        return {
            type: 'table',
            html: html,
            endIndex: endIndex
        };
    }

    /**
     * 构建表格HTML
     * @param {Array} tableLines - 表格行（分隔行在前，表头行在后）
     * @returns {string} HTML字符串
     */
    buildTableHTML(tableLines) {
        // 解析分隔行以获取对齐信息
        const separators = tableLines[0].split('|').slice(1, -1).map(cell => cell.trim());
        const alignments = separators.map(separator => {
            if (separator === ':---:') {
                return 'center';
            } else if (separator === ':---') {
                return 'left';
            } else if (separator === '---:') {
                return 'right';
            } else if (/^---+$/.test(separator)) {
                return 'left'; // 默认左对齐
            }
            return 'left'; // 默认左对齐
        });
        
        // 解析表头（第二行）
        const headers = tableLines[1].split('|').slice(1, -1).map(cell => cell.trim());

        // 构建HTML
        let html = '<table class="pmd-table">\n';
        html += '  <thead>\n';
        html += '    <tr>\n';
        
        // 添加表头
        for (let i = 0; i < headers.length; i++) {
            const align = alignments[i];
            const alignAttr = align && align !== 'left' ? ` align="${align}"` : ''; // 左对齐是默认值，可以省略
            // 处理表头中的文本样式
            const processedHeader = this.processTextStyles(headers[i]);
            html += `      <th${alignAttr}>${processedHeader}</th>\n`;
        }
        
        html += '    </tr>\n';
        html += '  </thead>\n';
        html += '  <tbody>\n';

        // 添加数据行（从第三行开始）
        for (let i = 2; i < tableLines.length; i++) {
            const row = tableLines[i];
            const cells = row.split('|').slice(1, -1).map(cell => cell.trim());
            html += '    <tr>\n';
            
            for (let j = 0; j < Math.min(cells.length, headers.length); j++) {
                const align = alignments[j];
                const alignAttr = align && align !== 'left' ? ` align="${align}"` : ''; // 左对齐是默认值，可以省略
                // 处理单元格中的文本样式
                const processedCell = this.processTextStyles(cells[j]);
                html += `      <td${alignAttr}>${processedCell}</td>\n`;
            }
            
            html += '    </tr>\n';
        }

        html += '  </tbody>\n';
        html += '</table>';
        
        return html;
    }

    /**
     * 处理文本样式
     * @param {string} text - 要处理的文本
     * @returns {string} 处理后的HTML
     */
    processTextStyles(text) {
        if (textStyleSyntax.matches(text)) {
            return textStyleSyntax.parse(text).html;
        }
        return this.escapeHtml(text);
    }

    /**
     * HTML特殊字符转义函数
     * @param {string} text - 要转义的文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}

module.exports = new TableSyntax();