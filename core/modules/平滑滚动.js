// 平滑滚动模块
const smoothScrollModule = {
    init: function() {
        window.scrollToSection = function(sectionId) {
            const section = document.getElementById(sectionId);
            if (section) {
                section.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        };
    }
};

return smoothScrollModule;