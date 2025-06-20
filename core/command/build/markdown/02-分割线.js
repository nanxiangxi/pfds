module.exports = function(content) {
    // 使用正则表达式替换 '---' 为单横线分割器
    content = content.replace(/^\s*---+\s*$/gm, '<hr class="side-nav-divider">');

    // 使用正则表达式替换 '===' 为双横线分割器
    content = content.replace(/^\s*={3,}\s*$/gm, '<hr class="side-nav-divider-double">');

    return content;
};