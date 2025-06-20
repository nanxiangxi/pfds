module.exports = function (content) {
    const lines = content.split('\n');
    let inTable = false;
    let tableLines = [];
    let result = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!inTable) {
            // 判断是否为表格起始：表头 + 合法分隔行
            if (isTableRow(line)) {
                const nextLine = lines[i + 1];
                if (nextLine && isSeparatorRow(nextLine)) {
                    inTable = true;
                    tableLines.push(line);
                    continue;
                }
            }

            // 非表格内容直接加入结果
            result += line + '\n';
        } else {
            // 当前处于表格中
            if (isTableRow(line)) {
                tableLines.push(line);
            } else {
                // 遇到非表格行，结束当前表格
                result += convertTableToHTML(tableLines.join('\n')) + '\n';
                tableLines = [];
                inTable = false;

                // 回退索引，让下一轮重新处理该行（可能是其他插件需要的内容）
                i--;
            }
        }
    }

    // 处理最后残留的表格
    if (tableLines.length > 0) {
        result += convertTableToHTML(tableLines.join('\n')) + '\n';
    }

    return result;
};

// 检查某一行是否可能是表格行（包含 |）
function isTableRow(line) {
    return line && line.trim().startsWith('|');
}

// 检查某一行是否是合法的表格分隔行（如 |---|:--| 等）
function isSeparatorRow(line) {
    const trimmed = line && line.trim();
    // 匹配标准 Markdown 分隔行：| --- | :--: | --: |
    return trimmed && /^\|((-|\s)*:?(-|\s)*(\||$))+/.test(trimmed);
}

// 将表格转换为 HTML
function convertTableToHTML(tableContent) {
    const lines = tableContent.split('\n');
    const headers = lines[0].split('|').map(cell => cell.trim()).filter(Boolean);
    const separator = lines[1];
    const bodyRows = lines.slice(2).filter(isTableRow);

    const expectedColumnCount = headers.length;

    // 解析对齐方式
    const alignMatch = separator
        .split('|')
        .slice(1, -1)
        .map(cell => {
            const trimmed = cell.trim();
            if (/^:--+$/.test(trimmed)) return 'left';
            if (/^--+:$/.test(trimmed)) return 'right';
            if (/^:--+:$/.test(trimmed)) return 'center';
            return '';
        });

    let html = '<table class="markdown-table">\n  <thead>\n  <tr>\n';

    for (let i = 0; i < headers.length; i++) {
        const align = alignMatch[i] ? ` style="text-align:${alignMatch[i]}"` : '';
        html += `    <th${align}>${headers[i]}</th>\n`;
    }

    html += '  </tr>\n  </thead>\n  <tbody>\n';

    for (const row of bodyRows) {
        const cells = row
            .split('|')
            .map(cell => cell.trim())
            .filter(Boolean);

        html += '    <tr>\n';

        for (let i = 0; i < expectedColumnCount; i++) {
            const cellContent = cells[i] || ''; // 空列填充
            const align = alignMatch[i] ? ` style="text-align:${alignMatch[i]}"` : '';
            html += `      <td${align}>${cellContent}</td>\n`;
        }

        html += '    </tr>\n';
    }

    html += '  </tbody>\n</table>\n';

    return html;
}