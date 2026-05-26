<template>
  <el-container class="layout-container">
    <!-- Left Collapsible Sidebar (Ant Design Dark Color: #001529) -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar-aside">
      <div class="sidebar-logo">
        <el-icon class="logo-icon"><Platform /></el-icon>
        <span v-show="!isCollapse" class="logo-text">即闪后台管理</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#001529"
        text-color="#a6adb4"
        active-text-color="#ffffff"
        router
        :collapse-transition="true"
      >
        <!-- Dashboard -->
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>数据看板</template>
        </el-menu-item>

        <!-- User Management -->
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <template #title>用户管理</template>
        </el-menu-item>

        <!-- Content Management -->
        <el-menu-item index="/content">
          <el-icon><Document /></el-icon>
          <template #title>内容管理</template>
        </el-menu-item>

        <!-- Comment Management -->
        <el-menu-item index="/comment">
          <el-icon><ChatLineSquare /></el-icon>
          <template #title>评论管理</template>
        </el-menu-item>

        <!-- Agreement Management -->
        <el-sub-menu index="/agreement">
          <template #title>
            <el-icon><Reading /></el-icon>
            <span>协议管理</span>
          </template>
          <el-menu-item index="/agreement/privacy">
            <el-icon><Lock /></el-icon>
            <span>隐私协议</span>
          </el-menu-item>
          <el-menu-item index="/agreement/user">
            <el-icon><Checked /></el-icon>
            <span>用户协议</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
      
      <!-- Toggle collapse footer -->
      <div class="sidebar-footer" @click="isCollapse = !isCollapse">
        <el-icon>
          <component :is="isCollapse ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>
    </el-aside>

    <el-container class="main-container">
      <!-- Top Header (Standard Corporate Clean white) -->
      <el-header class="layout-header">
        <div class="header-left">
          <div class="collapse-btn-box" @click="isCollapse = !isCollapse">
            <el-icon class="collapse-icon">
              <component :is="isCollapse ? 'Expand' : 'Fold'" />
            </el-icon>
          </div>
          <el-breadcrumb separator="/" class="header-breadcrumb">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
              {{ item }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <!-- Notification -->
          <el-tooltip content="消息通知" placement="bottom">
            <div class="action-item">
              <el-badge :value="3" class="badge-item" type="danger">
                <el-icon class="action-icon"><Bell /></el-icon>
              </el-badge>
            </div>
          </el-tooltip>

          <!-- Fullscreen toggle -->
          <el-tooltip content="全屏切换" placement="bottom">
            <div class="action-item" @click="toggleFullScreen">
              <el-icon class="action-icon"><FullScreen /></el-icon>
            </div>
          </el-tooltip>

          <!-- Admin dropdown -->
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="admin-profile">
              <el-avatar 
                :size="28" 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" 
              />
              <span class="admin-name">{{ adminName }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile" disabled>个人信息</el-dropdown-item>
                <el-dropdown-item command="settings" disabled>安全设置</el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Multi-tab Tags View Bar (页签导航栏) -->
      <div class="tags-view-container">
        <div class="tags-view-scroll-wrapper">
          <div 
            v-for="(tag, idx) in tagsList" 
            :key="tag.path" 
            class="tags-view-item"
            :class="{ 'active': activeMenu === tag.path }"
            @click="router.push(tag.path)"
          >
            <span class="tag-dot" v-show="activeMenu === tag.path"></span>
            <span class="tag-title">{{ tag.title }}</span>
            <el-icon 
              v-if="tag.path !== '/dashboard'" 
              class="tag-close-icon"
              @click.stop="closeSelectedTag(idx, tag.path)"
            >
              <Close />
            </el-icon>
          </div>
        </div>
        <div class="tags-close-other" @click="closeOtherTags">
          <el-button size="small" type="primary" plain>关闭其他页签</el-button>
        </div>
      </div>

      <!-- Main Content Area -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

interface TagItem {
  name: string
  path: string
  title: string
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isCollapse = ref(false)
const adminName = computed(() => authStore.adminName || '管理员')

// Active menu path matching current route
const activeMenu = computed(() => {
  return route.path
})

// Dynamic breadcrumbs based on route metadata
const breadcrumbs = computed(() => {
  return (route.meta.breadcrumbs as string[]) || []
})

// Multi-tabs array: Default with Dashboard
const tagsList = ref<TagItem[]>([
  { name: 'Dashboard', path: '/dashboard', title: '数据看板' }
])

// Watch route changes to dynamically add tabs
watch(
  () => route.path,
  (path) => {
    if (path === '/login') return
    const isExist = tagsList.value.some((item) => item.path === path)
    if (!isExist) {
      tagsList.value.push({
        name: route.name as string,
        path: path,
        title: (route.meta.title as string) || '新标签页'
      })
    }
  },
  { immediate: true }
)

// Close a single tag tab
const closeSelectedTag = (index: number, path: string) => {
  tagsList.value.splice(index, 1)
  
  // If we closed the currently active tab, we must route somewhere else
  if (activeMenu.value === path) {
    const lastTag = tagsList.value[tagsList.value.length - 1]
    if (lastTag) {
      router.push(lastTag.path)
    } else {
      router.push('/')
    }
  }
}

// Close other tags
const closeOtherTags = () => {
  tagsList.value = tagsList.value.filter(
    (tag) => tag.path === '/dashboard' || tag.path === activeMenu.value
  )
  ElMessage.success('其他页签已成功关闭')
}

// Handle dropdown command actions
const handleCommand = (command: string) => {
  if (command === 'logout') {
    ElMessageBox.confirm(
      '确定要退出即闪后台管理系统吗？',
      '提示',
      {
        confirmButtonText: '确定退出',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    ).then(() => {
      authStore.logout()
      ElMessage.success('已成功退出登录')
      router.push('/login')
    }).catch(() => {})
  }
}

// Toggle HTML Fullscreen
const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch((err) => {
      ElMessage.error(`全屏失败: ${err.message}`)
    })
  } else {
    document.exitFullscreen()
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* Sidebar Styling - Clean Ant Design Dark Theme (#001529) */
.sidebar-aside {
  background-color: #001529;
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  box-shadow: 2px 0 8px rgba(0, 21, 41, 0.15);
  z-index: 100;
}

.sidebar-logo {
  height: 50px; /* Standard compact header height */
  display: flex;
  align-items: center;
  padding: 0 16px;
  background-color: #002140; /* Logo background slightly darker */
  color: white;
  overflow: hidden;
  white-space: nowrap;
}

.logo-icon {
  font-size: 20px;
  color: #1890ff;
  margin-right: 8px;
}

.logo-text {
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.5px;
  color: #ffffff;
}

.sidebar-menu {
  border-right: none !important;
  flex-grow: 1;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 48px !important;
  line-height: 48px !important;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important; /* Element blue highlight color */
  color: #ffffff !important;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #001529;
  color: #a6adb4;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
}

.sidebar-footer:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.05);
}

/* Header & Main Container Styling - Standard Clean White */
.main-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5; /* AntD/Ele Admin standard page backdrop */
}

.layout-header {
  height: 50px !important; /* Standard Ele Admin header height */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background-color: #ffffff;
  border-bottom: 1px solid #f0f0f0;
  z-index: 90;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn-box {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #000000d9;
  font-size: 18px;
  transition: color 0.3s;
}

.collapse-btn-box:hover {
  color: #1890ff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-item {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #000000d9;
  transition: all 0.2s ease;
}

.action-item:hover {
  background-color: #f5f5f5;
  color: #1890ff;
}

.action-icon {
  font-size: 16px;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.admin-profile:hover {
  background-color: #f5f5f5;
}

.admin-name {
  font-weight: 500;
  font-size: 13px;
  color: #000000d9;
}

/* Dynamic Tags View Bar styling (水平页签页导航) */
.tags-view-container {
  height: 34px;
  width: 100%;
  background: #ffffff;
  border-bottom: 1px solid #d8dce5;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}

.tags-view-scroll-wrapper {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  flex-grow: 1;
}

/* Hide scrollbar for layout tags view */
.tags-view-scroll-wrapper::-webkit-scrollbar {
  display: none;
}

.tags-view-item {
  display: inline-flex;
  align-items: center;
  height: 26px;
  line-height: 26px;
  border: 1px solid #d8dce5;
  color: #495060;
  background: #fff;
  padding: 0 8px;
  font-size: 12px;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  gap: 4px;
}

.tags-view-item:hover {
  color: #1890ff;
  border-color: rgba(24, 144, 255, 0.4);
}

.tags-view-item.active {
  background-color: #1890ff;
  color: #fff;
  border-color: #1890ff;
}

.tag-dot {
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
  display: inline-block;
}

.tag-close-icon {
  font-size: 10px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
}

.tag-close-icon:hover {
  background-color: #b4bccc;
  color: #fff;
}

.tags-close-other {
  flex-shrink: 0;
  margin-left: 10px;
}

/* Main content viewport layout */
.layout-main {
  flex-grow: 1;
  padding: 20px !important; /* Standard padding */
  overflow-y: auto;
}

/* Fade transform Page Transition */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
