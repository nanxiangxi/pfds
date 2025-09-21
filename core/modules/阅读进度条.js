// 阅读进度条模块
const progressBarModule = {
    init: function() {
        document.addEventListener('DOMContentLoaded', function() {
            const progressBar = document.getElementById('pfds-progressBar');
            const contentMain = document.querySelector('.pfds-content-main');

            function updateProgress() {
                // 获取当前活动页面
                const activePage = document.querySelector('.pfds-page-content.pfds-active');
                if (!activePage) return;

                // 获取活动页面的滚动容器
                const scrollContainer = activePage.closest('.pfds-content-main');
                if (!scrollContainer) return;

                // 计算滚动进度
                const scrollTop = scrollContainer.scrollTop;
                const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
                const progress = (scrollTop / scrollHeight) * 100;

                // 更新进度条宽度
                progressBar.style.width = isNaN(progress) ? '0%' : Math.min(Math.max(progress, 0), 100) + '%';
            }

            // 监听所有页面内容的滚动事件
            if (contentMain) {
                contentMain.addEventListener('scroll', updateProgress);
            }

            // 监听页面切换事件
            window.addEventListener('pfds-showPage', function(event) {
                // 重置进度条到0%
                if (progressBar) {
                    progressBar.style.width = '0%';
                }

                // 获取目标页面并滚动到顶部
                const targetPageId = event.detail.pageId;
                const targetPage = document.getElementById(targetPageId);
                if (targetPage) {
                    // 确保在下一帧滚动到顶部
                    requestAnimationFrame(() => {
                        const contentMain = targetPage.closest('.pfds-content-main');
                        if (contentMain) {
                            contentMain.scrollTop = 0;
                        }
                    });
                }
            });

            // 初始更新进度条
            updateProgress();
        });
    }
};

return progressBarModule;