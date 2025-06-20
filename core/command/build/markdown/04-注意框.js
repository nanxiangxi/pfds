module.exports = function (content) {
    // 修正后的正则表达式
    const alertBoxRegex = /:::\s*(>?)\s*\[(\w+)([\/\\|])?\]\s*([\s\S]*?):::/gim;

    return content.replace(alertBoxRegex, (match, hasStrip, color, alignmentSymbol, innerContent) => {
        // 提取颜色和对齐方式
        let alignmentClass = 'align-center'; // 默认居中

        if (alignmentSymbol === '/') {
            alignmentClass = 'align-left';
        } else if (alignmentSymbol === '\\') {
            alignmentClass = 'align-right';
        } else if (alignmentSymbol === '|') {
            alignmentClass = 'align-center';
        }
        const boxClass = `Attention-box ${color.trim().toLowerCase()} ${alignmentClass}`;
        // 判断是否有竖线装饰
        const stripHTML = hasStrip ? '<div class="strip"></div>' : '';
        // 清理内容中的多余空格
        const cleanContent = innerContent.trim();

        // 生成最终HTML结构
        return `
<div class="${boxClass}">
    ${stripHTML}
    ${cleanContent}
</div>`;
    });
};
