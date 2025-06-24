module.exports = function (content) {
    // 匹配 {w} 换行 开始 和 {/w} 换行 结束 的内容块
    const pattern = /\{w\}[\r\n]+([\s\S]*?)[\r\n]*\{\/w\}/gi;

    return content.replace(pattern, (match, wordContent) => {
        return `<span class="markdown-word">${wordContent}</span>`;
    });
};