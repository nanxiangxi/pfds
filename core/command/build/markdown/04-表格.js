module.exports = function (content) {
    const lines = content.split('\n');
    let inTable = false;
    let tableLines = [];
    let result = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!inTable) {
            // 检查是否是表格开始：第一行为表头，第二行为分隔行（每列至少4个 -）
            if (line.trim().startsWith('|')) {
                const nextLine = lines[i + 1];
                if (
                    nextLine &&
                    /(\| *:?\s*[-]{4,}\s*:?\s*\|)+/.test(nextLine)
                ) {
                    inTable = true;
                    tableLines.push(line);
                    continue;
                }
            }

            // 非表格内容直接添加
            result += line + '\n';
        } else {
            // 当前行属于表格内容
            if (line.trim().startsWith('|')) {
                tableLines.push(line);
            } else {
                // 遇到非表格行，结束表格并转换
                result += convertTableToHTML(tableLines.join('\n')) + '\n';
                tableLines = [];
                inTable = false;

                // ⭐⭐⭐ 关键修复点：
                // 将当前非表格行加入 result，并跳过下一轮自动递增 i
                result += line + '\n';
                continue; // 避免重复添加这一行
            }
        }
    }

    // 处理最后可能残留的表格内容
    if (tableLines.length > 0) {
        result += convertTableToHTML(tableLines.join('\n')) + '\n';
    }

    return result;
};

function convertTableToHTML(tableContent) {
    const lines = tableContent.split('\n');
    const headers = lines[0].split('|').map(cell => cell.trim()).filter(Boolean);
    const separator = lines[1];
    const bodyRows = lines.slice(2).filter(line => line.trim().startsWith('|'));

    const expectedColumnCount = headers.length;

    // 解析对齐方式
    const alignMatch = separator.split('|').slice(1, -1).map(cell => {
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
        const cells = row.split('|').map(cell => cell.trim()).filter(Boolean);

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