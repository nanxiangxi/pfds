module.exports = function(content) {
    // 使用正则表达式匹配 {no?} 和 {/no?} 之间的内容（支持多行），并替换为 <div data-no-search>...</div>
    content = content.replace(/\{no\?}(.*?)\{\/no\?\}/gs, function(_, innerContent) {
        return '<div data-no-search>' + innerContent.trim() + '</div>';
    });

    return content;
};