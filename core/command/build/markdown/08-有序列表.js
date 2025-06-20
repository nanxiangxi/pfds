// orderedList.js - 支持多级嵌套的有序列表解析器
module.exports = function parseOrderedList(content) {
    // 匹配数字编号格式：如 1., 1.1., 1.2.3 等 + 后面的文字
    const regex = /(\d+(?:\.\d+)*)([.)])\s+([^\n\r]+)/g;

    let result = '';
    const stack = []; // 存储 ol 的层级
    let lastIndex = 0;
    let match;

    // 关闭栈中所有剩余的 ol 标签
    function closeAllOls() {
        while (stack.length > 0) {
            result += '</ol>';
            stack.pop();
        }
    }

    while ((match = regex.exec(content)) !== null) {
        const [full, numberPart, delimiter, text] = match;
        const level = numberPart.split('.').length; // 层级深度（比如 1.2.3 是三级）

        // 如果当前匹配前有内容，先处理掉前面的内容和关闭旧 ol
        if (match.index > lastIndex) {
            closeAllOls();
            result += content.slice(lastIndex, match.index);
        }

        const li = `<li class="markdown-li">${text.trim()}</li>`;

        // 关闭比当前 level 深的 ol
        while (stack.length >= level) {
            result += '</ol>';
            stack.pop();
        }

        // 打开新的 ol（如果需要）
        if (stack.length < level) {
            for (let i = stack.length + 1; i <= level; i++) {
                result += '<ol class="markdown-ol">';
                stack.push(i);
            }
        }

        // 添加 li
        result += li;

        lastIndex = regex.lastIndex;
    }

    // 处理末尾剩余内容
    if (lastIndex < content.length) {
        closeAllOls();
        result += content.slice(lastIndex);
    } else {
        closeAllOls();
    }

    return result;
};