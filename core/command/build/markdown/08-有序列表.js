// orderedList.js - 插件式有序列表解析器（保留非列表内容）+ 嵌套支持
module.exports = function parseOrderedList(content) {
    const lines = content.split('\n');
    let result = [];
    let listGroup = [];

    // 分组连续的有序列表行
    for (const line of lines) {
        const match = line.match(/^(\d+(?:\.\d+)*)[.)]\s+([^\n\r]+)/);

        if (match) {
            listGroup.push(line);
        } else {
            if (listGroup.length > 0) {
                // 处理一组有序列表
                result.push(generateNestedList(listGroup));
                listGroup = [];
            }
            result.push(line); // 非列表行保留
        }
    }

    // 处理末尾剩余的列表行
    if (listGroup.length > 0) {
        result.push(generateNestedList(listGroup));
    }

    return result.join('\n');
};

// 构建树状结构并生成嵌套 HTML
function generateNestedList(lines) {
    const tree = {};

    for (const line of lines) {
        const match = line.match(/^(\d+(?:\.\d+)*)[.)]\s+([^\n\r]+)/);
        if (!match) continue;

        const [, numberPart, text] = match;
        const path = numberPart.split('.').map(Number);
        let node = tree;

        for (let i = 0; i < path.length; i++) {
            const key = path[i];
            if (!node.children) node.children = {};
            if (!node.children[key]) node.children[key] = { value: null };
            node = node.children[key];

            if (i === path.length - 1) {
                node.value = text.trim();
            }
        }
    }

    function buildHtml(node) {
        if (!node.children) return '';

        const items = Object.entries(node.children).sort(([a], [b]) => a - b);
        let html = '<ol class="markdown-ol">';

        for (const [key, child] of items) {
            html += `<li class="markdown-li">${child.value || ''}`;
            if (child.children) {
                html += buildHtml(child);
            }
            html += '</li>';
        }

        html += '</ol>';
        return html;
    }

    return buildHtml(tree);
}