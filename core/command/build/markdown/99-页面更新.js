// 99-页面更新.js

/**
 * 页面跳转插件：将 go@目标页面[显示文字] 替换为可点击元素
 * 支持任意单词字符（字母、数字、下划线）、中文、路径等作为目标页面名；
 * 显示文字可以是任何字符串。
 */
module.exports = function(content) {
    // 匹配 go@目标页面[显示文字] 的模式
    return content.replace(/go@([^[\s\u200B]+)\[([^\]]*)\]/g, (match, pageName, displayText) => {
        // 确保显示文本不为空，如果为空，则默认使用页面名称
        if (!displayText.trim()) {
            displayText = pageName;
        }

        return `<span class="page-link" onclick="showPage('${pageName}')">${displayText}</span>`;
    });
};
