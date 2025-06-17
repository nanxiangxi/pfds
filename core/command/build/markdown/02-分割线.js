module.exports = function(content) {
    return content.replace(/^\s*---+\s*$/gm, '<hr class="side-nav-divider">');
};
