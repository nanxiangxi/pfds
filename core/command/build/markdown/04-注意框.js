module.exports = function (content) {
    // 改进后的正则表达式，能正确捕获对齐符号和宽度
    const alertBoxRegex = /:::\s*(>?)\s*\[(\w+)([\/\\|])?\s*([0-9]+)?\s*]\s*([\s\S]*?):::/gim;

    return content.replace(alertBoxRegex, (match, hasStrip, color, alignmentSymbol, number, innerContent) => {
        // 默认对齐方式
        let alignmentClass = 'align-center';
        if (alignmentSymbol === '/') {
            alignmentClass = 'align-left';
        } else if (alignmentSymbol === '\\') {
            alignmentClass = 'align-right';
        } else if (alignmentSymbol === '|') {
            alignmentClass = 'align-center';
        }

        // 宽度处理
        const widthPercent = number ? `${number}%` : '80%';

        // 竖线装饰
        const stripHTML = hasStrip ? '<div class="strip"></div>' : '';

        // 清理内容
        const cleanContent = innerContent.trim();

        // 构建类名和样式
        const boxClass = `Attention-box ${color.trim().toLowerCase()} ${alignmentClass}`;

        // 返回 HTML
        return `
<div class="${boxClass}" style="width: ${widthPercent};">
    ${stripHTML}
    ${cleanContent}
</div>`;
    });
};