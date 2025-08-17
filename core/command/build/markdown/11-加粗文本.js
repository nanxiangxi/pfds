// boldText.js - 支持**内容**加粗语法
module.exports = function (content) {
    // 匹配 **内容** 格式并替换为 <strong> 标签
    const pattern = /\*\*(.*?)\*\*/g;
    
    return content.replace(pattern, (match, innerContent) => {
        return `<strong>${innerContent}</strong>`;
    });
};