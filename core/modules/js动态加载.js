export function initJsAutoLoad() {
    let currentPageId = null;
    const pageFunctionsMap = {}; // 存储每个页面定义的函数名

    // 沙箱执行 JS
    function executeInSandbox(code, pageId) {
        const definedFunctions = [];

        // 替换 function 声明语法，收集函数名
        const wrappedCode = code
            .replace(/function\s+([a-zA-Z_$][\w_$]*)/g, (match, funcName) => {
                definedFunctions.push(funcName);
                return `window["${funcName}"] = function`;
            });

        // 在沙箱中执行
        try {
            eval(wrappedCode);
        } catch (e) {
            console.error(`Error executing script for page ${pageId}:`, e);
        }

        // 保存当前页面定义的函数名
        pageFunctionsMap[pageId] = definedFunctions;
    }

    // 卸载旧页面的函数
    function unloadPageFunctions() {
        if (!currentPageId || !pageFunctionsMap[currentPageId]) return;

        pageFunctionsMap[currentPageId].forEach(funcName => {
            if (window[funcName]) {
                delete window[funcName];
            }
        });

        delete pageFunctionsMap[currentPageId];
    }

    // 加载页面脚本
    function loadPageScript(pageId) {
        if (currentPageId === pageId) return;

        // 1. 卸载旧页面函数
        unloadPageFunctions();

        // 2. 设置当前页面 ID
        currentPageId = pageId;

        // 3. 加载 JS 文件
        fetch(`assets/js/script-${pageId}.js`)
            .then(res => {
                if (!res.ok) throw new Error(`Failed to load script for page ${pageId}`);
                return res.text();
            })
            .then(code => {
                // 4. 在沙箱中执行 JS
                executeInSandbox(code, pageId);
            })
            .catch(err => {
                console.error(err);
            });
    }

    // 监听页面切换事件
    window.addEventListener('showPage', (e) => {
        const newPageId = e.detail.pageId;
        if (newPageId) {
            loadPageScript(newPageId);
        }
    });

    // 首次加载
    const activePage = document.querySelector('.page-content.active');
    if (activePage && activePage.id) {
        loadPageScript(activePage.id);
    }
}