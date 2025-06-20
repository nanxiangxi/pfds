// enhancedInlineCode.js - 支持多种风格的内联代码解析器
module.exports = function parseEnhancedInlineCode(content) {
    // 匹配带风格的格式，如 :red:text:red:
    content = content.replace(/:([a-zA-Z0-9_-]+):([^]*?):\1:/g, (match, style, code) => {
        return `<code class="markdown-inline-code ${style}">${code.trim()}</code>`;
    });

    // 匹配默认风格格式 ::text::
    content = content.replace(/::([^]*?)::/g, (match, code) => {
        return `<code class="markdown-inline-code">${code.trim()}</code>`;
    });

    return content;
};