export function copyCode(button) {
    const pre = button.closest('pre');
    const code = pre.querySelector('code').innerText;

    navigator.clipboard.writeText(code).then(() => {
        const icon = button.querySelector('i');
        const original = icon.className;
        icon.className = 'icon-check'; // 你可以定义 icon-check 显示为 ✔ 图标
        setTimeout(() => {
            icon.className = original;
        }, 1500);
    }).catch(err => {
        alert('复制失败: ' + err.message);
    });
}

export function initCopyCode() {
    window.copyCode = copyCode;
}