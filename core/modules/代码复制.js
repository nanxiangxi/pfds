// 代码复制模块
const codeCopyModule = {
    init: function() {
        window.copyCode = function(button) {
            const pre = button.closest('pre');
            const code = pre.querySelector('code').innerText;

            navigator.clipboard.writeText(code).then(() => {
                const icon = button.querySelector('i');
                const original = icon.className;
                icon.className = 'icon-check'; // 你可以定义 icon-check 显示为 ✔ 图标
                
                // 显示成功消息
                showMessage('代码复制成功！', 'success');
                
                setTimeout(() => {
                    icon.className = original;
                }, 1500);
            }).catch(err => {
                showMessage('复制失败: ' + err.message, 'error');
            });
        };

        // 创建消息提示框元素
        createMessageContainer();
    }
};

// 创建消息提示框容器
function createMessageContainer() {
    if (document.getElementById('copy-message')) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.id = 'copy-message';
    messageDiv.className = 'custom-message';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 6px 28px;
        border-radius: 10px;
        font-size: 16px;
        z-index: 9999;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        font-family: 'Segoe UI', sans-serif;
        border: 2px solid transparent;
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;
        opacity: 0;
        min-width: 150px;
        text-align: center;
        /* 深色主题默认样式 */
        color: #e8f5e9;
        background-color: rgba(255, 255, 255, 0.1);
    `;
    
    // 监听主题变化
    const observer = new MutationObserver(() => {
        applyThemeStyles(messageDiv);
    });
    
    observer.observe(document.body, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // 初始应用主题样式
    applyThemeStyles(messageDiv);
    
    document.body.appendChild(messageDiv);
}

// 应用主题样式
function applyThemeStyles(element) {
    if (document.body.classList.contains('light-theme')) {
        // 浅色主题样式
        element.style.color = '#212529';
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
    } else {
        // 深色主题样式
        element.style.color = '#e8f5e9';
        element.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }
}

// 显示消息提示框
function showMessage(text, type) {
    const messageDiv = document.getElementById('copy-message');
    if (!messageDiv) return;
    
    // 应用主题样式
    applyThemeStyles(messageDiv);
    
    // 设置消息文本
    messageDiv.textContent = text;
    
    // 根据类型设置边框颜色
    if (type === 'success') {
        messageDiv.style.borderColor = '#a5d6a7';
    } else {
        messageDiv.style.borderColor = '#ef9a9a';
    }
    
    // 显示消息（触发动画）
    messageDiv.style.opacity = '1';
    
    // 2秒后隐藏消息
    setTimeout(() => {
        messageDiv.style.opacity = '0';
    }, 2000);
}

return codeCopyModule;