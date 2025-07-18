export function initJsAutoLoad() {
    let currentScript = null;

    function loadPageScript(pageId) {
        // 移除之前加载的脚本（如果存在）
        if (currentScript) {
            currentScript.remove();
            currentScript = null;
        }

        // 构造新的 JS 路径
        const jsPath = `assets/js/script-${pageId}.js`;

        // 创建 script 标签
        const script = document.createElement('script');
        script.src = jsPath;

        // 添加自定义属性 mod="pageId"
        script.setAttribute('mod', pageId); // 使用非 data-* 属性

        // 保存引用以便后续移除
        currentScript = script;

        // 插入到 <body> 的底部
        document.body.appendChild(script);
    }

    // 监听页面切换事件（假设通过 showPage 切换）
    window.addEventListener('showPage', (e) => {
        loadPageScript(e.detail.pageId);
    });

    // 页面首次加载时也尝试加载当前 active 页面的脚本
    const activePage = document.querySelector('.page-content.active');
    if (activePage && activePage.id) {
        loadPageScript(activePage.id);
    }
}