const { shared } = require('./context');

module.exports = async () => {
    shared.logger.stepStart('导航生成');

    let navHTML = '<ul>\n';

    if (!Array.isArray(shared.routes)) {
        shared.logger.subStep('shared.routes 不存在或不是数组', 'error');
        shared.navHTML = '';
        shared.logger.stepEnd('导航生成');
        return;
    }

    shared.routes.forEach((item, index) => {
        const isGrouped = item.items && Array.isArray(item.items);

        if (isGrouped) {
            // 分组项
            const groupId = `group-${index}`;
            const groupActiveClass = item.open ? 'pfds-active' : '';

            navHTML += `
<li class="pfds-nav-group">
  <a href="javascript:void(0)" class="pfds-nav-group-toggle">
    ${item.group}
    <span class="pfds-toggle-icon ${groupActiveClass}"><i class="icon-left"></i></span>
  </a>
  <ul class="pfds-nav-group-content ${groupActiveClass}" id="${groupId}-content">`;

            item.items.forEach((route, itemIndex) => {
                const activeClass = index === 0 && itemIndex === 0 ? 'pfds-active' : '';
                navHTML += `
    <li class="pfds-nav-item">
      <a href="#" onclick="pfdsShowPage('${route.id}')" id="pfds-nav-${route.id}" class="${activeClass}" data-page-id="${route.id}">
        ${route.title}
      </a>
    </li>`;
            });

            navHTML += `
  </ul>
</li>`;
        } else {
            // 非分组项
            const activeClass = index === 0 ? 'pfds-active' : '';
            navHTML += `
<li class="pfds-nav-item">
  <a href="#" onclick="pfdsShowPage('${item.id}')" id="pfds-nav-${item.id}" class="${activeClass}" data-page-id="${item.id}">
    ${item.title}
  </a>
</li>`;
        }
    });
    navHTML += '</ul>';
    shared.navHTML = navHTML;
    shared.logger.subStep('主导航结构构建完成', 'success');

    // 生成头部链接
    if (!shared.config?.head || !Array.isArray(shared.config.head)) {
        shared.logger.subStep('shared.config.head 不存在或不是数组', 'error');
        shared.headLinksHTML = '';
        shared.logger.subStep('头部链接构建中断', 'warn');
        shared.logger.stepEnd('导航生成');
        return;
    }

    let headLinksHTML = '';

    try {
        headLinksHTML = shared.config.head
            .map((link) => {
                const iconHTML = link.icon ? `<i class="${link.icon}"></i>` : '';
                const hasChildren = link.children && Array.isArray(link.children) && link.children.length > 0;

                if (hasChildren) {
                    const childrenHTML = `
<ul class="pfds-submenu">
${link.children.map((child) => {
                        const childUrl = child.url || 'javascript:void(0)';
                        return `<li><a href="${childUrl}" target="_blank">${child.title || '未知子菜单'}</a></li>`;
                    }).join('\n')}
</ul>`;

                    return `
<li class="pfds-nav-item pfds-has-submenu">
  <a href="javascript:void(0)" class="pfds-submenu-toggle">
    ${iconHTML}
    <span>${link.title || '无标题'}</span>
  </a>
  ${childrenHTML}
</li>`;
                } else {
                    const linkUrl = link.url || 'javascript:void(0)';
                    return `
<li class="pfds-nav-item">
  <a href="${linkUrl}" target="_blank">
    ${iconHTML}
    <span>${link.title || '无标题'}</span>
  </a>
</li>`;
                }
            })
            .join('\n');

        shared.headLinksHTML = headLinksHTML;
        shared.logger.subStep('头部链接构建完成', 'success');
    } catch (err) {
        shared.logger.subStep(`头部链接生成过程中发生错误: ${err.message}`, 'error');
        shared.headLinksHTML = '';
    }

    shared.logger.stepEnd('导航生成');
};