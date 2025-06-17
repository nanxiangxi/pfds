# 📚 PFDS - 纯前端文档系统（Pure Frontend Document System）

[![npm version](https://img.shields.io/npm/v/my-pfds)](https://www.npmjs.com/package/my-pfds)
[![License](https://img.shields.io/npm/l/pfds-init)](https://github.com/nanxiangxi/pfds/blob/main/LICENSE)

> 快速完成文档编写，支持热更新，全局搜索，一键部署等功能。

PFDS 是一个基于纯前端技术构建的文档系统，无需后端服务即可快速搭建本地文档网站。适合用于项目说明、API 文档、教程指南等轻量级场景。使用简单的命令即可初始化、调试和部署文档站点。

---

## 📦 版本更新日志

### **当前版本：v1.0.12**（发布日期：2025年6月18日）

#### ✨ 新增功能
- 新增部分MakrDown语法支持

#### 🔧 优化改进
- 优化构筑文件可维护性
- 优化代码结构

#### 🐛 Bug 修复
- 产生BUG：这个版本的markdown解释器写的非常差，我认为存在挺多bug的，我会在后续逐渐修复，如果您有能力的话欢迎出修改意见或者代码帮助我。

---


## 🌟 核心特性

| ✨ 特性 | 描述 |
|--------|------|
| **🚀 热更新开发** | 实时预览修改内容，提升文档编写效率 |
| **🎨 主题自由切换** | 提供默认白/深色主题，支持自定义 CSS 样式 |
| **📦 一键部署** | 生成静态 HTML 文件，轻松部署到 GitHub Pages/Vercel 等平台 |
| **📁 自动化导航** | 根据目录结构自动生成侧边栏和导航菜单 |

---

## 📦 快速开始

### 1. 安装方式  [windows环境下PowerShell，而非cmd]
```bash
# 通过 npx 直接使用
npx pfds-init@latest
```
### 2. 启动开发服务器
```bash
pfds dev
```
🚀 访问 [http://localhost:309](http://localhost:309) 查看实时预览

### 3. 构建生产环境
```bash
pfds build
```
📦 静态文件输出到 `output/` 目录

---

## 🧱 项目结构
```bash
my-project/
├──pfds.js               # pfds的执行js
├── output/              # 编译输出目录
│   ├── index.html       # 编译产物
│   └── assets/          # 静态资源
│         ├── js/
│         └── css/
├── dev/                 # 开发目录
│   ├──pfds.json         # 入口配置文件
│   ├── router.json      # 路由配置文件
│   ├── head.json        # 头部配置文件
│   ├── config.js        # 系统配置
│   ├── template/        # 模板目录
│   │   └── main.html    # 主模板
│   └── assets/          # 静态资源
│   │   ├── js/
│   │   └── css/
│   └── views/           # 视图文件目录
│       └── home.html    # 示例视图文件
└── core/                # 核心JS模块
│   ├── build.js         # 构建脚本
│   └── css/             # 静态资源
│    |    ├── dark.css   #黑暗主题的css
│    |    └── bright.css #明亮主题的css
│   └── modules/         # 功能模块
│      ├── search.js
│      ├── navigation.js
│      └── ...其他模块
```

---

## ⚙️ 配置指南

```javascript
// pfds.json 示例配置
{
    "siteTitle": "Pfds文档系统",
    "theme": "dark",
    "template": "main.html"
}
```

---

## 🎨 主题与样式

### 内置主题
- `default`: 🌞 浅色模式（默认）
- `dark`: 🌙 深色模式（暗黑系开发者友好）

### 自定义主题
1. 在 `core/themes/` 目录添加自定义 CSS 文件
2. 通过配置文件选择即可

---

## 🤝 贡献指南

欢迎提交 Issues 和 Pull Requests！
这个版本开始代码结构相当简单，我相信大家都可以轻松地修改和扩展，期待贡献。


---

## 📬 联系我们

如有问题或建议：
- 提交 GitHub Issue
- 邮件联系：2286718577@qq.com

---

❤️ 感谢使用 PFDS！希望它能助您高效管理文档！🎉