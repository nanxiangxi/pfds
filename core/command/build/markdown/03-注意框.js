module.exports = function (content) {
    // 修改后的正则表达式（去除了 ! 的匹配）
    const alertBoxRegex = /:::\s*(>?)\s*\[(\w+)\]\s*([\s\S]*?):::/gim;

    return content.replace(alertBoxRegex, (match, hasStrip, color, innerContent) => {
        // 颜色参数现在对应第二个捕获组
        const boxClass = `Attention-box ${color.trim().toLowerCase()}`;
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
