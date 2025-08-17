// HTML特殊字符转义函数
function escapeHtml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\u00a0/g, ' '); // 转义不间断空格
}

// enhancedInlineCode.js - 支持多种风格的内联代码解析器
module.exports = function parseEnhancedInlineCode(content) {
    // 匹配带风格的格式，如 :red:text:red:
    content = content.replace(/:([a-zA-Z0-9_-]+):([^]*?):\1:/g, (match, style, code) => {
        // 转义HTML特殊字符
        const escapedCode = escapeHtml(code).trim();
        return `<code class="markdown-inline-code ${style}">${escapedCode}</code>`;
    });

    // 匹配默认风格格式 ::text::
    content = content.replace(/::([^]*?)::/g, (match, code) => {
        // 转义HTML特殊字符
        const escapedCode = escapeHtml(code).trim();
        return `<code class="markdown-inline-code">${escapedCode}</code>`;
    });

    return content;
};