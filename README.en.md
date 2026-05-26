# JiShan Backstage Management System

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

## 📌 Project Overview

**JiShan Backstage Management System** is a professional, classic enterprise-grade dashboard designed for the operations team of the "JiShan" App. Built with the cutting-edge frontend technology stack **Vue 3 + TypeScript + Vite + Element Plus + Pinia**, the system layout and user experience strictly align with the classic **Element Plus Admin** framework design.

To facilitate zero-dependency offline demonstration and rapid deployment, the system features a built-in **fully local frontend memory-based Mock database** with synchronous reactive flows. Actions like banning accounts, offlining content, deleting comments, or modifying agreements take effect instantly across all screens, offering a highly responsive, "living" system experience.

---

## ✨ Key Features

* 🗂 **Multi-Tab Navigation (Tags View)**: Fully replicates the horizontal page tabs from `element-plus-admin`, supporting dynamic tab insertion, smooth switching, individual closing, and a convenient "Close Other Tabs" action.
* 📊 **Analysis Dashboard (Dashboard Analysis)**: Displays 4 core business metrics card indicators (complete with Day/Week/Month/Year badges and trend percentage indicators) alongside a high-fidelity **SVG-rendered Traffic & Publishing Trend Chart** representing active users and content output curves.
* 👥 **User Audit & Control (User List)**: Offers multi-criteria search (User ID, nickname, phone number, account status). Supports instant one-click banning/unbanning and a details drawer revealing specific business metrics (content counts, comments count, total likes received).
* 📝 **Content Regulation (Content List)**: Displays published content with photo grids supporting zoomable previews. Supports one-click offlining (taking posts offline) and restoration.
* 💬 **Comment Sentiment Control (Comment List)**: Features page-to-page query filtering where operators can inspect comments of a specific post, supporting fast comment deletion with automatic posts comments count updates.
* 📜 **Agreement Real-Time Editor (Agreement Edit)**: Provides double-pane split workspaces for privacy policies and user terms. Supports rich HTML text editor configuration, and features a mobile phone layout frame on the right side for immediate visual previews.
* 🔒 **Secure Navigation Guards (Auth Guard)**: Built-in route guards checking `Bearer Token` storage. Unauthorized users attempting to bypass the login portal are automatically intercepted and routed back to `/login`.

---

## 🛠 Technology Stack

* **Core Framework**: Vue 3 (Composition API, `<script setup>`)
* **Build Tool**: Vite 8.0 (instant hot module replacement and lightning-fast packaging)
* **Development Language**: TypeScript 6.0 (strong type safety and auto-completion)
* **UI Components**: Element Plus (configured with Chinese localization)
* **State Management**: Pinia 3.0 (lightweight reactive state store)
* **Router Management**: Vue Router 4 (nested layouts, dynamic breadcrumbs tracking)
* **API Handlers**: Axios (with pre-built interceptors and an `ENABLE_MOCK` toggle, ready for rapid backend API integrations)
* **Styling System**: Vanilla CSS & CSS Variables (enterprise gray, white, and classic blue accents)

---

## 📂 Project Directory Structure

```text
src/
├── main.ts               # App entry (configures Element Plus, Pinia, and registers icon components globally)
├── App.vue               # Root component (locale provider wrapper ensuring zh-cn context)
├── style.css             # Global stylesheet (redefines Card shadows, Table hovers, custom enterprise themes)
├── router/
│   └── index.ts          # Vue Router configurations (includes navigation guards, route metadata breadcrumbs)
├── store/
│   ├── auth.ts           # Authentication Pinia store (caches session Token, admin usernames)
│   └── mockData.ts       # Core mock database store (synchronously executes local CRUD operations)
└── views/
    ├── login/
    │   └── Index.vue     # Glassmorphic Login page (credentials validation, robust form styling)
    ├── layout/
    │   └── Index.vue     # Main structural layout (collapsible sidebar, breadcrumbs navbar, dynamic page Tabs)
    ├── dashboard/
    │   └── Index.vue     # Analysis Dashboard (displays stat cards, interactive SVG charts, top contents)
    ├── user/
    │   └── List.vue      # User Management list (filters, lock/unlock triggers, details drawer)
    ├── content/
    │   └── List.vue      # Content regulation list (image carousels, offline/restore triggers, post details)
    ├── comment/
    │   └── List.vue      # Comment moderation list (post ID filters, fast deletions, inter-module linkages)
    └── agreement/
        ├── Privacy.vue   # Privacy Agreement config (HTML text editor, split mobile layout previewer)
        └── User.vue      # User Agreement config (HTML text editor, split mobile layout previewer)
```

---

## 🚀 Getting Started

### 1. Installation
In your terminal, navigate to the project directory and run the following command to install dependencies:
```bash
pnpm install
```

### 2. Launch Local Dev Server
Start the Vite local development server:
```bash
pnpm dev
```
Once launched, open the printed localhost URL (normally `http://localhost:5173/`) in your browser.

### 🔑 Default Credentials
* **Default Username**: `admin`
* **Default Password**: `123456`

### 3. Production Build & Bundling
Compile and bundle the project assets for production deployment:
```bash
pnpm run build
```
Once completed, the build outputs will be saved in the `dist/` directory, ready to be deployed directly to your static hosting servers (e.g., Nginx, Vercel).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
