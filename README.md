# 即闪后台管理系统 (JiShan Backstage Management System)

<p align="center">
  <a href="https://vuejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/vue-3.5.x-green.svg" alt="vue">
  </a>
  <a href="https://www.typescriptlang.org/" target="_blank">
    <img src="https://img.shields.io/badge/typescript-6.0.x-blue.svg" alt="typescript">
  </a>
  <a href="https://vite.dev/" target="_blank">
    <img src="https://img.shields.io/badge/vite-8.0.x-orange.svg" alt="vite">
  </a>
  <a href="https://element-plus.org/" target="_blank">
    <img src="https://img.shields.io/badge/element--plus-2.14.x-blue.svg" alt="element-plus">
  </a>
  <a href="https://pinia.vuejs.org/" target="_blank">
    <img src="https://img.shields.io/badge/pinia-3.0.x-yellow.svg" alt="pinia">
  </a>
  <a href="https://opensource.org/licenses/MIT" target="_blank">
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="license">
  </a>
</p>

## 📌 项目简介

**即闪后台管理系统**是一款专为“即闪”App 运营团队打造的经典企业级后台监管与运营分析大屏。项目采用当前最主流的前端黄金技术栈 **Vue 3 + TypeScript + Vite + Element Plus + Pinia** 构建，设计深度契合标准的 **Element Plus Admin** 经典风格。

为便于零依赖快速演示与离线部署，系统内置了强大的**纯前端内存级 Mock 数据仓库**与同步状态机，所有封禁、下架、删除、保存修改等操作均能跨页面实时联动，具有极佳的“活体交互感”。

---

## ✨ 核心功能特色

* 🗂 **多页签导航栏 (Tags View)**：全面复刻 `element-plus-admin` 水平页签系统，支持页签的自动载入、平滑切换、独立关闭，以及一键“关闭其他”页签。
* 📊 **分析大看板 (Dashboard Analysis)**：包含 4 大统计卡片（展示日/周/月/年数据及同环比走势）以及由高精度 SVG 动态绘制的**流量与发布趋势混合折线柱状图表**。
* 👥 **业务用户审查 (User List)**：支持用户ID、昵称、手机号、账号状态多维度联合模糊检索，支持一键封禁/解禁，以及用于展示详细业务统计指标（发布数、获赞数等）的侧抽屉。
* 📝 **发布内容监管 (Content List)**：内容列表支持多图轮播及点击放大预览，支持一键执行下架封锁或上架恢复操作。
* 💬 **评论舆情管理 (Comment List)**：支持关联特定文章内容ID进行精确穿梭筛选与过滤，支持快捷删除违规言论，对应文章评论数自动联动扣减。
* 📜 **协议实时配置 (Agreement Edit)**：提供隐私政策与服务协议的双栏编辑区，支持 HTML 格式实时排版编译，右侧内置模拟移动端真机屏幕进行秒级前台效果预览。
* 🔒 **健壮路由守卫 (Auth Guard)**：内置基于 `Bearer Token` 的路由防跨越机制，未登录状态直接访问后台路由将强制拦截并重定向回登录页。

---

## 🛠 技术栈概览

* **核心框架**：Vue 3 (Composition API, `<script setup>`)
* **构建工具**：Vite 8.0 (秒级热重载与编译打包)
* **开发语言**：TypeScript 6.0 (强类型安全保障)
* **UI 组件库**：Element Plus (中文国际化包配置)
* **状态管理**：Pinia 3.0 (本地持久化状态机)
* **路由管理**：Vue Router 4 (嵌套路由与多层级动态面包屑)
* **网路请求**：Axios (内置拦截器，预留 ENABLE_MOCK 开关，可一键对接真实后端 API)
* **样式系统**：Vanilla CSS 与 CSS Variables (符合 Web 界面设计规范的企业级灰白蓝配色)

---

## 📂 项目目录结构

```text
src/
├── main.ts               # 项目入口 (全局注入 Element Plus, 注册图标组件与 Pinia)
├── App.vue               # 根组件 (包裹配置 locale 确保全中文环境)
├── style.css             # 全局样式系统 (重写 Element 卡片阴影、表格 hover、定义灰白主色调)
├── router/
│   └── index.ts          # 路由配置 (含前置登录拦截守卫、各页面动态面包屑配置)
├── store/
│   ├── auth.ts           # 鉴权状态管理 (存储登录 Token、管理员身份信息)
│   └── mockData.ts       # 核心内存 Mock 数据仓库 (100% 同步 CRUD 数据处理服务)
├── utils/
│   └── request.ts        # Axios 请求封装 (内置 Mock 拦截与延迟模拟，开启 ENABLE_MOCK)
└── views/
    ├── login/
    │   └── Index.vue     # 后台登录页面 (高强度毛玻璃质感、表单校验)
    ├── layout/
    │   └── Index.vue     # 页签导航主布局 (Collapsible 侧边栏、Header 工具栏、Tags View 水平页签栏)
    ├── dashboard/
    │   └── Index.vue     # 数据分析看板 (4 大统计卡片与 SVG 折线柱状混合图表、热度榜单)
    ├── user/
    │   └── List.vue      # 业务用户管理 (多参数联合过滤、一键启禁用、详情侧抽屉)
    ├── content/
    │   └── List.vue      # 内容发布监管 (图文排版概要、多图放大预览、下架/恢复控制)
    ├── comment/
    │   └── List.vue      # 评论监管中心 (评论列表、删除操作、文章ID跨页面穿梭筛选)
    └── agreement/
        ├── Privacy.vue   # 隐私协议配置 (双栏分屏、HTML 源代码实时编辑与真机效果预览)
        └── User.vue      # 用户服务协议 (双栏分屏、HTML 源代码实时编辑与真机效果预览)
```

---

## 🚀 快速启动指南

### 1. 本地依赖安装
请在终端中确保处于项目根目录，运行命令安装所需依赖：
```bash
pnpm install
```

### 2. 启动开发服务器
启动本地热重载调试服务器：
```bash
pnpm dev
```
启动成功后，在浏览器中打开命令行输出的本地链接（默认为 `http://localhost:5173/`）即可进行访问。

### 🔑 登录测试账号
* **默认管理员用户名**：`admin`
* **安全密码**：`123456`

### 3. 生产环境编译打包
将项目编译并压缩为生产可用的静态资源包：
```bash
pnpm run build
```
打包成功后，会在根目录下生成 `dist/` 目录，直接将其部署至 Nginx 即可完成发布。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 许可证开源。
