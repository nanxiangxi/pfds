module.exports = function(content) {
    return content.replace(/^(#{1,6})\s+(.+)$/gm, (match, hashes, title) => {
        const level = hashes.length;
        const cleanTitle = title.trim();

        if (level >= 1 && level <= 6) {
            if (level === 1) {
                return `<h1>${cleanTitle}</h1>`;
            } else if (level === 2 || level === 3) {
                return `<h${level}><span class="green-pound">#</span> ${cleanTitle}</h${level}>`;
            } else {
                return `<h${level}>${cleanTitle}</h${level}>`;
            }
        }

        return match;
    });
};