const path = require('path');
const fs = require('fs').promises;
const { CONFIG, shared, utils } = require('./context');
const applyScopedJS = require('./views/script');
const applyScopedCSS = require('./views/css');
const parsePMD = require('./pmd/parser');

module.exports = async () => {
    shared.logger.stepStart('处理视图');
    
    let viewsHTML = '';
    
    // 用于记录哪些页面需要动态加载JS和CSS
    const dynamicLoadMarkers = {
        js: new Set(),
        css: new Set()
    };
    
    // 从路由配置中获取所有视图文件
    const viewFiles = [];
    for (const route of shared.routes) {
        if (route.items && Array.isArray(route.items)) {
            route.items.forEach(item => {
                if (item.file) {
                    viewFiles.push({ ...item, isGrouped: true, group: route.group });
                }
            });
        } else if (route.file) {
            viewFiles.push({ ...route, isGrouped: false });
        }
    }
    
    // 标记是否为第一个页面
    let firstPage = true;
    
    for (const route of viewFiles) {
        const filePath = path.join(CONFIG.DEV_DIR, 'views', route.file);
        if (!(await utils.existsSync(filePath))) {
            throw new Error(`视图文件不存在: ${filePath}`);
        }
        
        let content = await utils.readFile(filePath, 'utf-8');
        const pageId = route.id;
        
        shared.logger.subStep(`处理页面: ${pageId}`);
        console.log(`[构建诊断] 处理页面: ${pageId}`);
        
        // 获取文件最后修改时间
        const fileStat = await fs.stat(filePath);
        const lastModified = new Date(fileStat.mtime).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).replace(/\//g, '-');
        
        /*----------------------------------------PMD解析开始----------------------------------------*/
        content = parsePMD(content);
        /*----------------------------------------PMD解析结束----------------------------------------*/
        
        /*----------------------------------------CSS作用域开始----------------------------------------*/
        const viewScopeClass = `view-scope-${pageId}`;
        const initCssAutoLoad = shared.config.initCssAutoLoad === true;
        content = await applyScopedCSS(content, viewScopeClass, pageId, initCssAutoLoad);
        /*----------------------------------------CSS作用域结束----------------------------------------*/
        
        /*----------------------------------------JS作用域开始----------------------------------------*/
        const initJsAutoLoad = shared.config.initJsAutoLoad === true;
        content = await applyScopedJS(content, pageId, initJsAutoLoad);
        /*----------------------------------------JS作用域结束----------------------------------------*/
        
        // 检查是否生成了JS或CSS文件，如果有则添加标记
        const jsFilePath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js', `script-${pageId}.js`);
        const cssFilePath = path.join(CONFIG.OUTPUT_DIR, 'assets', 'css', `css-${pageId}.css`);
        
        console.log(`[构建诊断] 检查JS文件是否存在: ${jsFilePath}`);
        let hasJS = false;
        if (await utils.existsSync(jsFilePath)) {
            const jsContent = await utils.readFile(jsFilePath, 'utf-8');
            console.log(`[构建诊断] JS文件内容长度: ${jsContent.length}`);
            if (jsContent.trim()) {
                dynamicLoadMarkers.js.add(pageId);
                hasJS = true;
                console.log(`[构建诊断] 添加JS标记: ${pageId}`);
            }
        }
        
        console.log(`[构建诊断] 检查CSS文件是否存在: ${cssFilePath}`);
        let hasCSS = false;
        if (await utils.existsSync(cssFilePath)) {
            const cssContent = await utils.readFile(cssFilePath, 'utf-8');
            console.log(`[构建诊断] CSS文件内容长度: ${cssContent.length}`);
            if (cssContent.trim()) {
                dynamicLoadMarkers.css.add(pageId);
                hasCSS = true;
                console.log(`[构建诊断] 添加CSS标记: ${pageId}`);
            }
        }
        
        // 计算上一页和下一页
        const currentPageIndex = viewFiles.findIndex(r => r.id === pageId);
        const prevPage = currentPageIndex > 0 ? viewFiles[currentPageIndex - 1] : null;
        const nextPage = currentPageIndex < viewFiles.length - 1 ? viewFiles[currentPageIndex + 1] : null;
        
        // 将更新时间添加到内容末尾
        content = content.trim() + `\n<div class="update-time">最后更新时间: ${lastModified}</div>`;
        
        // 添加分割线和导航按钮
        let bottomNavigation = '<hr class="page-divider">';
        bottomNavigation += '<div class="page-navigation">';
        
        // 左侧上一页按钮
        if (prevPage) {
            const prevPageTitle = prevPage.isGrouped ? `${prevPage.group} - ${prevPage.title}` : prevPage.title;
            bottomNavigation += `
            <div class="nav-link prev-link" onclick="pfdsShowPage('${prevPage.id}')">
                <i class="icon-right"></i>
                <span class="nav-text">${prevPageTitle}</span>
            </div>`;
        } else {
            bottomNavigation += `
            <div class="nav-link prev-link disabled">
                <i class="icon-right"></i>
                <span class="nav-text">已经是第一页</span>
            </div>`;
        }
        
        // 右侧下一页按钮
        if (nextPage) {
            const nextPageTitle = nextPage.isGrouped ? `${nextPage.group} - ${nextPage.title}` : nextPage.title;
            bottomNavigation += `
            <div class="nav-link next-link" onclick="pfdsShowPage('${nextPage.id}')">
                <span class="nav-text">${nextPageTitle}</span>
                <i class="icon-left"></i>
            </div>`;
        } else {
            bottomNavigation += `
            <div class="nav-link next-link disabled">
                <span class="nav-text">已经是最后一页</span>
                <i class="icon-left"></i>
            </div>`;
        }
        
        bottomNavigation += '</div>';
        
        // 将底部导航添加到内容末尾
        content = content + '\n' + bottomNavigation;
        
        // 包裹视图内容
        const className = firstPage 
            ? `page-content active ${viewScopeClass}`
            : `page-content ${viewScopeClass}`;
            
        // 添加data-css和data-js属性到页面容器元素上
        const dataAttributes = `data-css="${hasCSS}" data-js="${hasJS}"`;
        content = `<div id="${pageId}" class="${className}" ${dataAttributes}>\n${content.trim()}\n</div>`;
        
        viewsHTML += content + '\n\n';
        
        // 第一个页面处理完毕后设置firstPage为false
        if (firstPage) {
            firstPage = false;
        }
        
        shared.logger.subStep(`页面处理完成: ${pageId}`, 'success');
    }
    
    // 保存标记信息供其他模块使用
    shared.dynamicLoadMarkers = dynamicLoadMarkers;
    
    // 处理公共JS
    const assetsJSDir = path.join(CONFIG.OUTPUT_DIR, 'assets', 'js');
    const publicFilePath = path.join(assetsJSDir, 'public-script.js');
    
    // 确保目录存在
    if (!(await utils.existsSync(assetsJSDir))) {
        await utils.mkdir(assetsJSDir, { recursive: true });
    }
    
    // 写入公共JS文件（无论是否为空）
    await utils.writeFile(publicFilePath, shared.publicJS || '');
    
    // 输出日志
    if (shared.publicJS && shared.publicJS.trim()) {
        shared.logger.subStep(`公共 JS 已写入: public-script.js`, 'success');
        console.log(`[构建诊断] 公共JS内容长度: ${shared.publicJS.length}`);
    } else {
        shared.logger.subStep(`公共 JS 文件已创建（空文件）: public-script.js`, 'info');
        console.log(`[构建诊断] 公共JS内容为空`);
    }
    
    shared.viewsHTML = viewsHTML;
    shared.logger.stepEnd('视图处理');
};