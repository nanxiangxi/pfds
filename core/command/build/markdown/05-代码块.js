module.exports = function(content) {
    // 匹配代码块：支持语言标识，如 ```javascript ... ```
    return content.replace(/```([a-z]*)[\s\r\n]+([\s\S]*?)[\s\r\n]*```/gi, (match, lang, code) => {
        if (!lang) {
            // 无语言类型的代码块
            return `<pre><code>${code}</code></pre>`;
        }

        // 有语言类型的情况
        return `<pre><code class="${lang}">${code}</code><span class="language-label">${lang}</span></pre>`;
    });
};