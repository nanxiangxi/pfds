// unorderedList.js - 支持单行多级列表的解析器
module.exports = function parseUnorderedList(content) {
    // 匹配 * 或 ** 或 *** 等开头的列表项
    const regex = /(\*+)(\s+)([^*\n\r]+)/g;

    let result = '';
    const stack = []; // 存储 ul 的层级

    let lastIndex = 0;
    let match;

    // 处理闭合剩余的 ul
    function closeAllUls() {
        while (stack.length > 0) {
            result += '</ul>';
            stack.pop();
        }
    }

    // 主循环处理每一项
    while ((match = regex.exec(content)) !== null) {
        const [full, stars, space, text] = match;
        const level = stars.length;

        // 如果不是从第一个字符开始，前面的部分保留为普通文本
        if (match.index > lastIndex) {
            closeAllUls();
            result += content.slice(lastIndex, match.index);
        }

        // 构造 li
        const li = `<li class="markdown-li">${text.trim()}</li>`;

        // 关闭比当前 level 深的 ul
        while (stack.length >= level) {
            result += '</ul>';
            stack.pop();
        }

        // 打开新的 ul（如果需要）
        if (stack.length < level) {
            for (let i = stack.length + 1; i <= level; i++) {
                result += '<ul class="markdown-ul">';
                stack.push(i);
            }
        }

        // 添加 li
        result += li;

        lastIndex = regex.lastIndex;
    }

    // 处理末尾剩余内容
    if (lastIndex < content.length) {
        closeAllUls();
        result += content.slice(lastIndex);
    } else {
        closeAllUls();
    }

    return result;
};