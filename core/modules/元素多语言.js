// 元素多语言支持模块
// 该模块处理HTML元素上的data-lang-*属性，根据当前语言显示对应内容

const elementLanguageModule = {
    init: function() {
        //console.log('[元素多语言] 模块初始化开始');

        /**
         * 根据当前语言更新所有带有data-lang属性的元素
         * @param {string} langCode - 语言代码
         */
        function updateElementLanguages(langCode) {
           // console.log('[元素多语言] updateElementLanguages函数被调用，参数:', langCode);

            // 查找所有带有data-lang-*属性的元素
            // 由于querySelector不支持属性前缀通配符，我们先获取所有元素再过滤
            const allElements = document.querySelectorAll('*');
            const elements = Array.from(allElements).filter(el => {
                return Array.from(el.attributes).some(attr => attr.name.startsWith('data-lang-'));
            });

           // console.log('[元素多语言] 找到带有多语言属性的元素数量:', elements.length);

            // 统一语言代码的大小写格式，确保匹配正确
            const normalizedLangCode = langCode.toLowerCase();
          //  console.log('[元素多语言] 标准化后的语言代码:', normalizedLangCode);

            elements.forEach(element => {
                // 获取所有data-lang属性
                const attributes = Array.from(element.attributes);
                const langAttributes = attributes.filter(attr => attr.name.startsWith('data-lang-'));

                //console.log('[元素多语言] 元素的多语言属性:', langAttributes.map(attr => ({name: attr.name, value: attr.value})));

                // 查找匹配当前语言的属性（忽略大小写）
                const matchingAttr = langAttributes.find(attr => {
                    const attrLangCode = attr.name.substring(10).toLowerCase(); // 'data-lang-'.length = 10
                    return attrLangCode === normalizedLangCode;
                });

               // console.log('[元素多语言] 匹配的属性:', matchingAttr);

                // 如果找到匹配的语言属性，则更新元素文本内容
                if (matchingAttr) {
                    // 检查元素类型以决定如何更新内容
                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        // 对于表单元素，更新value属性
                        element.value = matchingAttr.value;
                    } else if (element.tagName === 'IMG') {
                        // 对于图片元素，更新alt属性
                        element.alt = matchingAttr.value;
                    } else {
                        // 对于其他元素，更新textContent
                        // 清理多余的换行符，保留正常的换行
                        const cleanText = matchingAttr.value.replace(/\n\s*\n\s*\n/g, '\n\n');
                        element.textContent = cleanText;
                    }
                    //console.log('[元素多语言] 元素内容已更新为:', matchingAttr.value);
                } else if (langAttributes.length > 0) {
                    // 如果没有找到匹配的语言，使用第一个可用的语言作为后备
                    const fallbackAttr = langAttributes[0];
                    //console.log('[元素多语言] 使用后备语言:', fallbackAttr);

                    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                        element.value = fallbackAttr.value;
                    } else if (element.tagName === 'IMG') {
                        element.alt = fallbackAttr.value;
                    } else {
                        // 清理多余的换行符，保留正常的换行
                        const cleanText = fallbackAttr.value.replace(/\n\s*\n\s*\n/g, '\n\n');
                        element.textContent = cleanText;
                    }
                    //console.log('[元素多语言] 元素内容已更新为后备语言:', fallbackAttr.value);
                }
            });

            // 重新生成右侧边栏内容导航
            updateContentNavigation(langCode);

            // 更新导航菜单和头部链接的多语言内容
            updateNavigationAndHeaderLanguages(langCode);
        }

        /**
         * 更新导航菜单和头部链接的多语言内容
         * @param {string} langCode - 语言代码
         */
        function updateNavigationAndHeaderLanguages(langCode) {
            // 更新导航菜单中的多语言内容
            const navItems = document.querySelectorAll('.pfds-nav-item > a, .pfds-nav-group > a');
            navItems.forEach(item => {
                const langAttributes = Array.from(item.attributes).filter(attr => attr.name.startsWith('data-lang-'));
                if (langAttributes.length > 0) {
                    const normalizedLangCode = langCode.toLowerCase();
                    const matchingAttr = langAttributes.find(attr => {
                        const attrLangCode = attr.name.substring(10).toLowerCase();
                        return attrLangCode === normalizedLangCode;
                    });

                    if (matchingAttr) {
                        item.innerHTML = matchingAttr.value;
                    } else {
                        // 使用后备语言
                        item.innerHTML = langAttributes[0].value;
                    }
                }
            });

            // 更新头部链接中的多语言内容
            const headLinks = document.querySelectorAll('.pfds-header-link');
            headLinks.forEach(link => {
                const langAttributes = Array.from(link.attributes).filter(attr => attr.name.startsWith('data-lang-'));
                if (langAttributes.length > 0) {
                    const normalizedLangCode = langCode.toLowerCase();
                    const matchingAttr = langAttributes.find(attr => {
                        const attrLangCode = attr.name.substring(10).toLowerCase();
                        return attrLangCode === normalizedLangCode;
                    });

                    if (matchingAttr) {
                        link.innerHTML = matchingAttr.value;
                    } else {
                        // 使用后备语言
                        link.innerHTML = langAttributes[0].value;
                    }
                }
            });
        }

        /**
         * 重新生成右侧边栏内容导航
         * @param {string} langCode - 语言代码
         */
        function updateContentNavigation(langCode) {
           // console.log('[元素多语言] updateContentNavigation函数被调用，参数:', langCode);

            // 获取当前激活的页面
            const activePage = document.querySelector('.page-content.active');
            if (!activePage) {
               // console.log('[元素多语言] 没有找到激活的页面');
                return;
            }

            const pageId = activePage.id;
           // console.log('[元素多语言] 当前激活页面ID:', pageId);

            // 获取页面中的标题元素，包括h1, h2, h3
            const headers = activePage.querySelectorAll('h1, h2, h3');
           // console.log('[元素多语言] 找到标题元素数量:', headers.length);

            // 获取右侧导航列表元素
            const contentNavList = document.getElementById('pfds-contentNavList');
            if (!contentNavList) {
              //  console.log('[元素多语言] 没有找到右侧导航列表元素');
                return;
            }

            // 清空现有内容
            contentNavList.innerHTML = '';

            // 如果没有标题，则隐藏整个内容导航区域
            const contentNav = document.querySelector('.pfds-content-nav');
            if (headers.length === 0) {
                if (contentNav) {
                    // 检查是否为移动端，如果是则保持隐藏
                    const isMobile = window.matchMedia('(max-width: 979px)').matches;
                    contentNav.style.display = isMobile ? '' : 'none';
                }
                return;
            }

            // 显示内容导航区域（但移动端除外）
            if (contentNav) {
                const isMobile = window.matchMedia('(max-width: 979px)').matches;
                if (!isMobile) {
                    contentNav.style.display = 'block';
                }
            }

            // 为每个标题生成导航项
            headers.forEach((header, index) => {
                const level = parseInt(header.tagName.charAt(1));
                const headerId = `${pageId}-${header.id || 'header-' + index}`;
                header.id = headerId;

                const listItem = document.createElement('li');
                // 添加子项类名以支持样式区分
                if (level > 1) {
                    listItem.classList.add('sub-item');
                }
                const link = document.createElement('a');
                link.href = `#${headerId}`;
                link.setAttribute('data-target', headerId); // 添加目标属性用于高亮

                // 使用间距而不是树状符号来体现层级关系
                // 一级标题不缩进，二级标题开始缩进
                const indent = level > 1 ? '&nbsp;'.repeat((level - 1) * 6) : '';

                // 处理多语言标题
                let headerText = header.textContent;
               // console.log('[元素多语言] 处理标题元素:', header);

                // 检查是否有data-lang属性
                const langAttributes = Array.from(header.attributes).filter(attr => attr.name.startsWith('data-lang-'));
                //console.log('[元素多语言] 标题元素的多语言属性:', langAttributes.map(attr => ({name: attr.name, value: attr.value})));

                if (langAttributes.length > 0) {
                    // 查找匹配的语言属性（忽略大小写）
                    const normalizedLangCode = langCode.toLowerCase();
                    const matchingAttr = langAttributes.find(attr => {
                        const attrLangCode = attr.name.substring(10).toLowerCase(); // 'data-lang-'.length = 10
                        return attrLangCode === normalizedLangCode;
                    });

                    //console.log('[元素多语言] 匹配的属性:', matchingAttr);

                    if (matchingAttr) {
                        headerText = matchingAttr.value;
                    }
                }

                // 清理多余的换行符，保留正常的换行
                const cleanHeaderText = headerText.replace(/\n\s*\n\s*\n/g, '\n\n');
                link.innerHTML = `<span class="tree-symbol"></span>${indent}${cleanHeaderText}`;

                link.onclick = (e) => {
                    e.preventDefault();
                    window.pfdsScrollToAnchor(headerId);
                    // 更新活动状态
                    updateActiveNav(headerId);
                };

                listItem.appendChild(link);
                contentNavList.appendChild(listItem);
            });

            // 初始化活动状态
            setTimeout(updateActiveNav, 100);
        }

        /**
         * 更新导航链接的活动状态
         */
        function updateActiveNav() {
            //console.log('[元素多语言] updateActiveNav 开始执行');

            // 获取当前激活的页面
            const activePage = document.querySelector('.page-content.active');
            if (!activePage) {
                //console.warn('[元素多语言] 未找到激活的页面');
                return;
            }
           // console.log('[元素多语言] 当前激活页面:', activePage.id);

            // 获取所有标题元素
            const headers = activePage.querySelectorAll('h1, h2, h3');
           // console.log('[元素多语言] 找到标题元素数量:', headers.length);
            if (headers.length === 0) {
               // console.log('[元素多语言] 没有标题元素');
                return;
            }

            // 获取内容主区域
            const contentMain = document.querySelector('.pfds-content-main');
            if (!contentMain) {
               // console.warn('[元素多语言] 未找到内容主区域');
                return;
            }
           // console.log('[元素多语言] 内容主区域scrollTop:', contentMain.scrollTop);

            // 获取滚动位置
            const scrollTop = contentMain.scrollTop;

            // 查找当前可见的标题
            let currentHeader = null;
            let closestDistance = Infinity;

            headers.forEach(header => {
                const headerRect = header.getBoundingClientRect();
                const contentMainRect = contentMain.getBoundingClientRect();

                // 计算标题相对于内容主区域的位置
                const headerTop = headerRect.top - contentMainRect.top + scrollTop;

                // 计算标题距离视口顶部的距离
                const distanceToTop = Math.abs(headerTop - scrollTop);

                // 找到距离视口顶部最近的标题
               // console.log(`[元素多语言] 标题 "${header.textContent}" 距离顶部: ${distanceToTop}`);
                if (distanceToTop < closestDistance) {
                    closestDistance = distanceToTop;
                    currentHeader = header;
                }
            });

           // console.log('[元素多语言] 当前标题:', currentHeader ? currentHeader.textContent : '无');

            // 获取右侧导航链接
            const navLinks = document.querySelectorAll('.pfds-content-nav a');
           // console.log('[元素多语言] 右侧导航链接数量:', navLinks.length);

            // 移除所有激活状态
            navLinks.forEach(link => {
                link.classList.remove('active');
               // console.log('[元素多语言] 移除链接激活状态:', link.getAttribute('data-target'));
            });

            // 如果找到了当前标题，则高亮对应的导航链接
            if (currentHeader) {
                const headerId = currentHeader.id;
                //console.log('[元素多语言] 当前标题ID:', headerId);
                // 使用更精确的选择器
                const targetLink = document.querySelector(`.pfds-content-nav a[data-target="${headerId}"]`);
                //console.log('[元素多语言] 目标链接元素:', targetLink);
                if (targetLink) {
                    targetLink.classList.add('active');
                   // console.log('[元素多语言] 激活链接:', headerId);
                } else {
                    //console.warn('[元素多语言] 未找到目标链接');
                }
            }
        }

        /**
         * 处理滚动事件，高亮当前可见的标题
         */
        function handleScroll() {
           // console.log('[元素多语言] handleScroll 开始执行');
            // 使用requestAnimationFrame优化性能
            requestAnimationFrame(updateActiveNav);
        }

        /**
         * 初始化元素多语言功能
         */
        function initElementLanguage() {
           // console.log('[元素多语言] initElementLanguage函数被调用');

            // 监听语言切换事件
            document.addEventListener('languageChanged', function(e) {
                //console.log('[元素多语言] 接收到languageChanged事件:', e.detail);
                const langCode = e.detail.language;
                updateElementLanguages(langCode);
            });

            // 定义初始化函数
            function initializeCurrentLanguage() {
               // console.log('[元素多语言] initializeCurrentLanguage函数被调用');
                const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';
               // console.log('[元素多语言] 初始化语言:', savedLanguage);
                updateElementLanguages(savedLanguage);
            }

            // 页面加载完成后，根据当前语言初始化元素内容
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeCurrentLanguage);
            } else {
                // 如果文档已经加载完成，则立即执行初始化
                initializeCurrentLanguage();
            }

            // 绑定多语言切换事件
            bindMultilingualEvents();

            // 监听滚动事件，更新导航活动状态
            document.addEventListener('DOMContentLoaded', function() {
                const contentMain = document.querySelector('.pfds-content-main');
                if (contentMain) {
                   // console.log('[元素多语言] 为内容主区域添加滚动监听器');
                    // 清除之前的滚动监听器
                    contentMain.removeEventListener('scroll', handleScroll);

                    // 添加新的滚动监听器
                    contentMain.addEventListener('scroll', handleScroll);

                    // 初始化时也调用一次
                    setTimeout(handleScroll, 100);
                    //console.log('[元素多语言] 已安排初始化调用');
                }
            });

            // 监听页面切换事件
            window.addEventListener('showPage', function(e) {
               // console.log('[元素多语言] 接收到showPage事件:', e.detail);
                // 延迟执行以确保页面切换完成
                setTimeout(() => {
                    const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';
                    updateContentNavigation(savedLanguage);

                    // 重新添加滚动监听器
                    const contentMain = document.querySelector('.pfds-content-main');
                    if (contentMain) {
                       // console.log('[元素多语言] 页面切换后重新添加滚动监听器');
                        contentMain.removeEventListener('scroll', handleScroll);
                        contentMain.addEventListener('scroll', handleScroll);
                        setTimeout(handleScroll, 100);
                    }
                }, 100);
            });

            // 监听锚点滚动事件
            window.addEventListener('anchorScrolled', function(e) {
                //console.log('[元素多语言] 接收到anchorScrolled事件:', e.detail);
                // 延迟执行以确保滚动完成
                setTimeout(updateActiveNav, 200);
            });
        }

        /**
         * 绑定多语言切换事件
         */
        function bindMultilingualEvents() {
            // 多语言切换功能
            const multilingualToggle = document.querySelector('.pfds-multilingual');
            if (multilingualToggle) {
               // console.log('[元素多语言] 找到多语言切换元素');

                // 点击切换按钮显示/隐藏下拉菜单
                const toggleButton = multilingualToggle.querySelector('.pfds-multilingual-toggle');
                const dropdown = multilingualToggle.querySelector('.pfds-multilingual-dropdown');

               // console.log('[元素多语言] toggleButton:', toggleButton);
               // console.log('[元素多语言] dropdown:', dropdown);

                if (toggleButton && dropdown) {
                    toggleButton.addEventListener('click', function(e) {
                       // console.log('[元素多语言] 点击切换按钮');
                        e.stopPropagation();
                        e.preventDefault();
                        // 切换下拉菜单显示状态
                        const isDisplayed = dropdown.style.display === 'block';
                        dropdown.style.display = isDisplayed ? 'none' : 'block';
                       // console.log('[元素多语言] 下拉菜单显示状态:', dropdown.style.display);
                    });

                    // 点击选项时更新显示并隐藏下拉菜单
                    const options = multilingualToggle.querySelectorAll('.pfds-multilingual-option');
                   // console.log('[元素多语言] 找到语言选项数量:', options.length);

                    options.forEach(option => {
                        //console.log('[元素多语言] 语言选项:', {lang: option.getAttribute('data-lang'),name: option.getAttribute('data-name'),text: option.textContent});

                        option.addEventListener('click', function(e) {
                           // console.log('[元素多语言] 点击语言选项');
                            e.preventDefault();
                            e.stopPropagation();
                            const langCode = this.getAttribute('data-lang');
                            const name = this.getAttribute('data-name');

                            //console.log('[元素多语言] 选中的语言:', { langCode, name });

                            // 更新当前语言显示为语言代码（而不是语言名称）
                            const currentLang = multilingualToggle.querySelector('.pfds-multilingual-current');
                           // console.log('[元素多语言] currentLang元素:', currentLang);

                            if (currentLang) {
                               // console.log('[元素多语言] 更新前currentLang文本:', currentLang.textContent);
                                currentLang.textContent = langCode;
                               // console.log('[元素多语言] 更新后currentLang文本:', currentLang.textContent);
                            }

                            // 实际切换语言功能
                           // console.log('[元素多语言] 调用switchLanguage函数');
                            switchLanguage(langCode);

                            // 隐藏下拉菜单
                            dropdown.style.display = 'none';
                           // console.log('[元素多语言] 隐藏下拉菜单');
                        });
                    });

                    // 点击下拉菜单中的文字也可以切换语言
                    const dropdownTexts = multilingualToggle.querySelectorAll('.pfds-multilingual-dropdown span');
                    dropdownTexts.forEach(text => {
                        text.addEventListener('click', function(e) {
                            //console.log('[元素多语言] 点击下拉菜单文字');
                            // 找到包含这个文字的选项元素
                            const option = this.closest('.pfds-multilingual-option');
                            if (option) {
                                // 触发选项的点击事件
                                option.click();
                            }
                        });
                    });

                    // 点击其他地方隐藏下拉菜单
                    document.addEventListener('click', function(e) {
                        if (multilingualToggle && !multilingualToggle.contains(e.target)) {
                            dropdown.style.display = 'none';
                        }
                    });
                }
            }
        }

        // 语言切换功能实现
        function switchLanguage(langCode) {
            //console.log('[元素多语言] switchLanguage函数被调用，参数:', langCode);

            // 这里实现实际的语言切换逻辑
           // console.log('切换语言到:', langCode);

            // 保存用户选择的语言到本地存储
            localStorage.setItem('preferredLanguage', langCode);
           // console.log('[元素多语言] 语言已保存到localStorage');

            // 更新多语言切换按钮的显示
            updateMultilingualToggleDisplay(langCode);

            // 在实际项目中，这里可以:
            // 1. 加载对应语言的翻译文件
            // 2. 更新页面内容的语言
            // 3. 发送事件通知其他模块语言已切换
            // 4. 重新加载页面或动态更新内容

            // 示例: 触发自定义事件通知其他组件语言已切换
         //   console.log('[元素多语言] 触发languageChanged事件');
            document.dispatchEvent(new CustomEvent('languageChanged', {
                detail: {
                    language: langCode
                }
            }));

            // 如果需要页面刷新以应用语言更改，可以取消下面的注释
            // location.reload();
        }

        // 页面加载时恢复用户之前选择的语言
        document.addEventListener('DOMContentLoaded', function() {
          //  console.log('[元素多语言] 页面加载时恢复语言设置');
            const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';  // 添加默认语言
          //  console.log('[元素多语言] 从localStorage获取的语言:', savedLanguage);

            // 恢复语言显示
            const currentLang = document.querySelector('.pfds-multilingual-current');
           // console.log('[元素多语言] currentLang元素:', currentLang);

            if (currentLang) {
                // 显示语言代码而不是语言名称
               // console.log('[元素多语言] 更新currentLang文本为:', savedLanguage);
                currentLang.textContent = savedLanguage;
            }

            // 应用语言设置
          //  console.log('[元素多语言] 调用switchLanguage应用语言设置');
            switchLanguage(savedLanguage);
        });

        // 添加一个函数，在页面加载时确保多语言切换按钮显示正确的语言
        function updateMultilingualToggleDisplay(langCode) {
            const currentLang = document.querySelector('.pfds-multilingual-current');
            if (currentLang) {
                currentLang.textContent = langCode;
            }
        }

        // 监听页面切换事件
        window.addEventListener('showPage', function() {
            // 延迟执行以确保页面切换完成
            setTimeout(() => {
                const savedLanguage = localStorage.getItem('preferredLanguage') || '汉';
                updateContentNavigation(savedLanguage);

                // 重新添加滚动监听器
                const contentMain = document.querySelector('.pfds-content-main');
                if (contentMain) {
                    contentMain.removeEventListener('scroll', handleScroll);
                    contentMain.addEventListener('scroll', handleScroll);
                    setTimeout(handleScroll, 100);
                }
            }, 100);
        });

        // 监听锚点滚动事件
        window.addEventListener('anchorScrolled', function(e) {
           // console.log('[元素多语言] 接收到anchorScrolled事件:', e.detail);
            // 延迟执行以确保滚动完成
            setTimeout(updateActiveNav, 200);
        });

        // 初始化元素多语言功能
        initElementLanguage();
       // console.log('[元素多语言] 模块初始化完成');
    }
};

return elementLanguageModule;