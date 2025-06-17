const { shared } = require('./context');

module.exports = async () => {
    shared.logger.stepStart('导航生成');

    let navHTML = '<ul>\n';
    shared.routes.forEach((route, index) => {
        const activeClass = index === 0 ? 'active' : '';
        navHTML += `    <li><a href="#" onclick="showPage('${route.id}')" id="nav-${route.id}" class="${activeClass}">${route.title}</a></li>\n`;
    });
    navHTML += '</ul>';

    shared.navHTML = navHTML;
    shared.logger.subStep('导航结构构建完成', 'success');
    shared.logger.stepEnd('导航生成');
};
