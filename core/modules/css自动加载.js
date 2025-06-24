export function initCssAutoLoad() {
    let currentCssLink = null;

    function loadPageCss(pageId) {
        // 移除旧的 CSS 文件
        if (currentCssLink) {
            currentCssLink.remove();
            currentCssLink = null;
        }

        // 构造新的 CSS 路径
        const cssPath = `assets/css/css-${pageId}.css`;

        // 创建 link 标签
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;

        // 保存引用以便下次移除
        currentCssLink = link;

        // 插入到 head 中
        document.head.appendChild(link);
    }

    // 监听页面切换事件（假设通过 showPage 切换）
    window.addEventListener('showPage', (e) => {
        loadPageCss(e.detail.pageId);
    });

    // 页面首次加载时也尝试加载当前 active 页面的样式
    const activePage = document.querySelector('.page-content.active');
    if (activePage && activePage.id) {
        loadPageCss(activePage.id);
    }
}