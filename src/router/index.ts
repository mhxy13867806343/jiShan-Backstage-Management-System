import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'

import { useMenuStore } from '@/store/menu'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: { title: '后台登录 - 即闪管理系统', guestOnly: true }
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/views/layout/Index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'account/profile',
        name: 'AccountProfile',
        component: () => import('@/views/account/Profile.vue'),
        meta: { title: '个人信息', breadcrumbs: ['个人中心', '个人信息'] }
      },
      {
        path: 'account/settings',
        name: 'AccountSettings',
        component: () => import('@/views/account/Settings.vue'),
        meta: { title: '安全设置', breadcrumbs: ['个人中心', '安全设置'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Route Guards
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const menuStore = useMenuStore()
  
  // Set window title
  if (to.meta.title) {
    document.title = (to.meta.title as string) + ' - 即闪'
  } else {
    document.title = '即闪后台管理系统'
  }

  const isAuth = authStore.isAuthenticated()

  if (isAuth) {
    if (to.name === 'Login') {
      next({ path: '/dashboard' })
    } else {
      // Dynamic routes loading
      if (!menuStore.isRoutesLoaded) {
        await menuStore.generateRoutes(router)
        await menuStore.fetchMenuTree()
        // Retry navigation with newly registered routes
        next({ ...to, replace: true })
      } else {
        next()
      }
    }
  } else {
    // If not authenticated, guestOnly pages (like login) are allowed, otherwise redirect to login
    if (to.meta.guestOnly) {
      next()
    } else {
      next({ name: 'Login' })
    }
  }
})

export default router
