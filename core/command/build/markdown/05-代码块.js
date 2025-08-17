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

module.exports = function(content) {
   // console.log('【原始内容】');
   // console.log(content);

    const result = content.replace(/```(?:([a-zA-Z]+))?([\\|\/])?(\d+)?(=)?\s*[\r\n]+([\s\S]*?)[\s\r\n]*```/gi, (match, lang, alignChar, width, copyable, code, offset, string) => {
       //  console.log('【匹配到一个代码块】');
       // console.log('完整匹配内容:', match);
       // console.log('语言:', lang || '(空)');
       // console.log('对齐符号:', alignChar || '(空)');
       // console.log('宽度:', width || '(空)');
        //console.log('复制按钮:', copyable ? '是' : '否');
        //console.log('代码内容:', code);
       // console.log('当前位置:', offset);
       // console.log('------------------------------');

        // 默认值
        lang = lang || '';  // 语言可以为空

        let classes = [];

        // 添加语言类（如果存在）
        if (lang) {
            classes.push(lang);
        }

        // 处理对齐方式，默认居中
        if (alignChar === '|') {
            classes.push('align-center');
        } else if (alignChar === '/') {
            classes.push('align-left');
        } else if (alignChar === '\\') {
            classes.push('align-right');
        } else {
            classes.push('align-center');  // 默认居中
        }

        // 处理宽度，默认 90%
        let styles = '';
        if (width) {
            styles += `width: ${width}%;`;
        } else {
            styles += 'width: 90%;';
        }

        // 处理复制按钮，默认不显示
        let copyButton = '';
        if (copyable) {
            copyButton = `<button class="copy-code-button" onclick="copyCode(this)" title="复制代码"><i class="icon-copy"></i></button>`;
        }

        // 构建 language label
        let languageLabel = lang ? `<span class="language-label">${lang}</span>` : '';
        
        // 转义HTML特殊字符，确保代码中的HTML标签能正确显示
        const escapedCode = escapeHtml(code);

        // 返回 HTML
        return `
<pre class="${classes.join(' ')}" style="${styles}"><code>${escapedCode}</code>${languageLabel}${copyButton}</pre>`;
    });

  //  console.log('【处理后的内容】');
   // console.log(result);

    return result;
};