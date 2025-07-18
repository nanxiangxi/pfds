export function initJsIsolation() {
    function createSandboxDocument(targetId) {
        return {
            getElementById: function (id) {
                if (id === targetId) {
                    return {
                        get textContent() {
                            const el = document.getElementById(id);
                            return el ? el.textContent : '';
                        },
                        set textContent(val) {
                            const el = document.getElementById(id);
                            if (el) el.textContent = val;
                        }
                    };
                }
                return null;
            }
        };
    }

    function executeIsolatedScript(scriptElement) {
        const targetId = scriptElement.getAttribute('mod');
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.warn(`目标元素 #${targetId} 不存在，脚本暂不执行`);
            return false;
        }

        if (scriptElement.dataset.executed) return true;
        scriptElement.dataset.executed = 'true';

        const src = scriptElement.getAttribute('src');
        if (!src) {
            console.warn('该脚本未指定 src 属性，跳过执行');
            return false;
        }

        const finalUrl = new URL(src, location.href).href;

        if (scriptElement._fetchPromise) {
            return scriptElement._fetchPromise;
        }

        const fetchPromise = fetch(finalUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.text();
            })
            .then(code => {
                try {
                    const sandboxDoc = createSandboxDocument(targetId);
                    const func = new Function('document', 'console', code);
                    func(sandboxDoc, {
                        log: (...args) => console.log('[sandbox]', ...args),
                        warn: (...args) => console.warn('[sandbox]', ...args),
                        error: (...args) => console.error('[sandbox]', ...args)
                    });
                } catch (e) {
                    console.error(`执行脚本 #${targetId} 出错：`, e);
                }
            })
            .catch(e => {
                console.error(`加载脚本 ${finalUrl} 出错：`, e);
            });

        scriptElement._fetchPromise = fetchPromise;
        return fetchPromise;
    }

    function initIsolatedScripts() {
        document.querySelectorAll('script[mod][src]').forEach(script => {
            executeIsolatedScript(script);
        });
    }

    const observer = new MutationObserver(mutations => {
        initIsolatedScripts();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('DOMContentLoaded', initIsolatedScripts);
}