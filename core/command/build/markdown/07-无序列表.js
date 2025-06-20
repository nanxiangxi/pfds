// unorderedList.js - 插件式无序列表解析器（支持单行/多行 + 嵌套）
module.exports = function parseUnorderedList(content) {
    const result = [];

    // 拆分段落块（根据空行或非列表行分割）
    const blocks = splitIntoBlocks(content);

    for (const block of blocks) {
        if (isUnorderedListBlock(block)) {
            // 是无序列表块，进行解析
            result.push(generateNestedList(parseLinesFromBlock(block)));
        } else {
            // 非列表块保留原样
            result.push(block);
        }
    }

    return result.join('\n');
};

// 将文本拆分为独立的段落块（遇到空行或非列表行时分割）
function splitIntoBlocks(content) {
    const lines = content.split('\n');
    const blocks = [];
    let currentBlock = [];

    for (const line of lines) {
        const isListLine = /^(\*+)(\s+)/.test(line.trim());

        if (isListLine) {
            currentBlock.push(line);
        } else {
            if (currentBlock.length > 0) {
                // 把当前缓存的列表行合并成一个块
                blocks.push(currentBlock.join('\n'));
                currentBlock = [];
            }
            blocks.push(line); // 非列表行单独作为一个块
        }
    }

    if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
    }

    return blocks;
}

// 判断一个块是否是无序列表块
function isUnorderedListBlock(block) {
    return block.startsWith('*');
}

// 解析块中的列表项（支持单行多个列表项）
function parseLinesFromBlock(block) {
    const matches = block.match(/(\*+\s+[^*\n\r]+)/g) || [];
    return matches.map(match => match.trim());
}

// 构建树状结构并生成嵌套 HTML
function generateNestedList(lines) {
    const root = { children: [] };
    const stack = [root];

    for (const line of lines) {
        const match = line.match(/^(\*+)(\s+)(.+)$/);
        if (!match) continue;

        const stars = match[1];
        const level = stars.length;
        const text = match[3].trim();

        // 确保层级正确：如果当前栈太深，就弹出
        while (stack.length > level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];

        const newItem = {
            text,
            children: []
        };

        parent.children.push(newItem);
        stack.push(newItem);
    }

    function buildHtml(items) {
        if (!items || items.length === 0) return '';

        let html = '<ul class="markdown-ul">';
        for (const item of items) {
            html += `<li class="markdown-li">${item.text}`;
            html += buildHtml(item.children);
            html += '</li>';
        }
        html += '</ul>';
        return html;
    }

    return buildHtml(root.children);
}