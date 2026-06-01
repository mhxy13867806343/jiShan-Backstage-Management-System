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

        <!-- App Simulator -->
        <el-menu-item index="/simulator">
          <el-icon><Smartphone /></el-icon>
          <template #title>App 仿真模拟</template>
        </el-menu-item>

        <!-- Account Management -->
        <el-menu-item index="/account">
          <el-icon><UserFilled /></el-icon>
          <template #title>账号管理</template>
        </el-menu-item>

        <!-- Announcement Management -->
        <el-sub-menu index="/announcement">
          <template #title>
            <el-icon><Bell /></el-icon>
            <span>公告管理</span>
          </template>
          <el-menu-item index="/announcement/single">
            <el-icon><Promotion /></el-icon>
            <span>单公告</span>
          </el-menu-item>
          <el-menu-item index="/announcement/list">
            <el-icon><List /></el-icon>
            <span>公告列表</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- Version Management -->
        <el-menu-item index="/version">
          <el-icon><Upload /></el-icon>
          <template #title>版本管理</template>
        </el-menu-item>

        <!-- System Configurations Submenu -->
        <el-sub-menu index="/system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统配置</span>
          </template>
          <el-menu-item index="/tag">
            <el-icon><PriceTag /></el-icon>
            <span>标签管理</span>
          </el-menu-item>
          <el-menu-item index="/region">
            <el-icon><Location /></el-icon>
            <span>地区管理</span>
          </el-menu-item>
          <el-menu-item index="/dict">
            <el-icon><Memo /></el-icon>
            <span>字典管理</span>
          </el-menu-item>
          <el-menu-item index="/message">
            <el-icon><Message /></el-icon>
            <span>系统消息</span>
          </el-menu-item>
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
          <el-popover
            placement="bottom-end"
            :width="320"
            trigger="click"
            popper-class="notification-popover"
          >
            <template #reference>
              <div class="action-item">
                <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge-item" type="danger">
                  <el-icon class="action-icon"><Bell /></el-icon>
                </el-badge>
              </div>
            </template>
            <div class="notification-box">
              <div class="notification-title">
                <span>消息通知</span>
                <div class="title-right" style="display: flex; align-items: center; gap: 8px;">
                  <el-button 
                    v-if="unreadCount > 0" 
                    type="primary" 
                    link 
                    size="small" 
                    @click.stop="handleMarkAllRead"
                    style="font-size: 12px; font-weight: 500;"
                  >
                    全部已读
                  </el-button>
                  <el-tag size="small" :type="unreadCount > 0 ? 'danger' : 'info'">
                    {{ unreadCount > 0 ? `${unreadCount} 条未读` : '已读完' }}
                  </el-tag>
                </div>
              </div>
              <div class="notification-list">
                <div 
                  class="notification-item" 
                  v-for="item in notifications" 
                  :key="item.id" 
                  @click="handleNotificationClick(item)"
                >
                  <div class="notification-dot" :class="{ 'unread': item.unread }"></div>
                  <div class="notification-content">
                    <div class="notification-text">{{ item.title }}</div>
                    <div class="notification-time">{{ item.time }}</div>
                  </div>
                </div>
              </div>
              <div class="notification-footer">
                <el-button type="primary" link @click="gotoMessageCenter">查看全部消息</el-button>
              </div>
            </div>
          </el-popover>

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
            <!-- keep-alive 缓存已访问过的页面，避免页签切换时重复 mount 导致接口被重复调用 -->
            <keep-alive :max="10">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
    
    <!-- System Message Detail Dialog -->
    <el-dialog
      v-model="msgDialogVisible"
      title="系统消息详情"
      width="500px"
      destroy-on-close
      class="msg-detail-dialog"
    >
      <div class="msg-detail-body">
        <div class="msg-detail-header">
          <el-tag :type="getTypeTag(selectedMsg.type)" effect="light" class="msg-type-tag">
            {{ getTypeLabel(selectedMsg.type) }}
          </el-tag>
          <span class="msg-time">{{ selectedMsg.pubTime }}</span>
        </div>
        <h3 class="msg-title">{{ selectedMsg.title }}</h3>
        <el-divider style="margin: 12px 0;" />
        <div class="msg-content">{{ selectedMsg.content }}</div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="msgDialogVisible = false">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminApi } from '@/api/admin'

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

// ── Notifications ────────────────────────────────────────────────
const notifications = ref<any[]>([])
const unreadCount = ref(0)

const fetchNotifications = async () => {
  try {
    const result = await adminApi.getNotifications()
    const list = result.list || []
    
    // 过滤掉草稿状态的消息，只展示和计算已发布的消息
    const nonDraftList = list.filter((item: any) => item.status !== 'draft' && item.status !== '0')
    
    // 重新计算未读的已发布消息数
    unreadCount.value = nonDraftList.filter((item: any) => item.unread).length
    
    // 只获取前 3 条非草稿数据，其他的数据直接跳过/忽略
    const topList = nonDraftList.slice(0, 3)
    
    notifications.value = topList.map((item: any) => {
      let timeStr = item.time
      if (timeStr && timeStr !== '--') {
        try {
          const now = new Date()
          const pubDate = new Date(timeStr.replace(/-/g, '/').replace('T', ' '))
          const diffMs = now.getTime() - pubDate.getTime()
          const diffMins = Math.floor(diffMs / (1000 * 60))
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          
          if (diffMins < 60) {
            timeStr = diffMins <= 0 ? '刚刚' : `${diffMins}分钟前`
          } else if (diffHours < 24) {
            timeStr = `${diffHours}小时前`
          } else if (diffDays < 7) {
            timeStr = `${diffDays}天前`
          } else {
            timeStr = timeStr.substring(5, 16)
          }
        } catch (e) {
          // Fallback
        }
      } else {
        timeStr = '刚刚'
      }

      return {
        id: item.id,
        title: item.title,
        type: item.type,
        content: item.content,
        time: timeStr,
        unread: item.unread
      }
    })
  } catch (err) {
    console.error('获取系统消息通知失败', err)
  }
}

onMounted(() => {
  fetchNotifications()
})

const msgDialogVisible = ref(false)
const selectedMsg = ref<any>({
  title: '',
  type: '',
  content: '',
  pubTime: ''
})

const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    notification: '系统通知',
    announcement: '平台公告',
    alert: '安全警示',
    antifraud: '防骗预警'
  }
  return map[type] || type
}

const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    notification: 'info',
    announcement: 'success',
    alert: 'warning',
    antifraud: 'danger'
  }
  return map[type] || 'info'
}

const handleNotificationClick = async (item: any) => {
  const wasUnread = item.unread
  
  try {
    // 获取通知详情，并由后端按当前 admin 标记为已读
    const detail = await adminApi.getNotificationDetail(item.id)
    item.unread = false
    if (wasUnread) {
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    }
    selectedMsg.value = {
      title: detail.title,
      type: detail.type,
      content: detail.content,
      pubTime: detail.pubTime
    }
    msgDialogVisible.value = true
  } catch (err) {
    console.error('获取系统消息详情失败', err)
    // Fallback
    selectedMsg.value = {
      title: item.title,
      type: 'notification',
      content: '获取具体内容失败，请稍后前往系统消息中心查看。',
      pubTime: item.time
    }
    msgDialogVisible.value = true
  }
}

const handleMarkAllRead = async () => {
  try {
    await adminApi.markAllNotificationsRead()
    notifications.value.forEach(n => {
      n.unread = false
    })
    unreadCount.value = 0
    ElMessage.success('已全部标记为已读')
  } catch (err) {
    console.error('标记全部已读失败', err)
  }
}

const gotoMessageCenter = () => {
  router.push('/message')
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

/* ── Notification Popover styles ── */
.notification-box {
  display: flex;
  flex-direction: column;
}

.notification-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 4px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-weight: 600;
  color: var(--text-main, #303133);
}

.notification-list {
  display: flex;
  flex-direction: column;
  max-height: 280px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 6px;
  cursor: pointer;
  border-bottom: 1px solid #f9f9f9;
  transition: background 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: transparent;
  flex-shrink: 0;
  margin-top: 6px;
}

.notification-dot.unread {
  background-color: #ff4d4f;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-text {
  font-size: 13px;
  line-height: 1.4;
  color: #606266;
}

.notification-item:hover .notification-text {
  color: var(--primary, #5856d6);
}

.notification-time {
  font-size: 11px;
  color: #c0c4cc;
}

.notification-footer {
  display: flex;
  justify-content: center;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  margin-top: 4px;
}

/* Msg Detail Dialog Styles */
.msg-detail-body {
  padding: 8px 4px;
}

.msg-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.msg-type-tag {
  font-weight: 600;
  border-radius: 4px;
}

.msg-time {
  font-size: 12px;
  color: #909399;
}

.msg-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin: 12px 0 8px;
  line-height: 1.5;
}

.msg-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-top: 16px;
  background-color: #f8f9fa;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid #f1f3f5;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>

<style>
/* Unscoped Popover styles for notifications */
.el-popover.notification-popover {
  padding: 12px !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

/* Unscoped Msg Detail Dialog Styles */
.el-dialog.msg-detail-dialog {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12) !important;
}

.el-dialog.msg-detail-dialog .el-dialog__header {
  padding: 16px 20px 12px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  margin-right: 0 !important;
}

.el-dialog.msg-detail-dialog .el-dialog__title {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #303133 !important;
}

.el-dialog.msg-detail-dialog .el-dialog__body {
  padding: 20px !important;
}

.el-dialog.msg-detail-dialog .el-dialog__footer {
  padding: 12px 20px 16px !important;
  border-top: 1px solid #f0f0f0 !important;
}
</style>
