import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Index.vue'),
    meta: { title: '后台登录 - 即闪管理系统', guestOnly: true }
  },
  {
    path: '/',
    component: () => import('@/views/layout/Index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/Index.vue'),
        meta: { title: '数据看板', icon: 'LayoutDashboard', breadcrumbs: ['控制台', '数据看板'] }
      },
      {
        path: 'user',
        name: 'UserList',
        component: () => import('@/views/user/List.vue'),
        meta: { title: '用户管理', icon: 'Users', breadcrumbs: ['运营管理', '用户列表'] }
      },
      {
        path: 'content',
        name: 'ContentList',
        component: () => import('@/views/content/List.vue'),
        meta: { title: '内容管理', icon: 'FileText', breadcrumbs: ['内容监管', '内容列表'] }
      },
      {
        path: 'comment',
        name: 'CommentList',
        component: () => import('@/views/comment/List.vue'),
        meta: { title: '评论管理', icon: 'MessageSquare', breadcrumbs: ['内容监管', '评论列表'] }
      },
      {
        path: 'simulator',
        name: 'AppSimulator',
        component: () => import('@/views/simulator/Index.vue'),
        meta: { title: 'App 仿真模拟', icon: 'Smartphone', breadcrumbs: ['运营管理', 'App 仿真模拟'] }
      },
      {
        path: 'tag',
        name: 'TagList',
        component: () => import('@/views/tag/List.vue'),
        meta: { title: '标签管理', icon: 'PriceTag', breadcrumbs: ['系统配置', '标签管理'] }
      },
      {
        path: 'region',
        name: 'RegionList',
        component: () => import('@/views/region/List.vue'),
        meta: { title: '地区管理', icon: 'Location', breadcrumbs: ['系统配置', '地区管理'] }
      },
      {
        path: 'dict',
        name: 'DictList',
        component: () => import('@/views/dict/List.vue'),
        meta: { title: '字典管理', icon: 'Memo', breadcrumbs: ['系统配置', '字典管理'] }
      },
      {
        path: 'message',
        name: 'SysMessage',
        component: () => import('@/views/message/List.vue'),
        meta: { title: '系统消息', icon: 'Message', breadcrumbs: ['系统配置', '系统消息'] }
      },
      {
        path: 'agreement/privacy',
        name: 'PrivacyAgreement',
        component: () => import('@/views/agreement/Privacy.vue'),
        meta: { title: '隐私协议', icon: 'ShieldCheck', breadcrumbs: ['系统配置', '隐私协议管理'] }
      },
      {
        path: 'agreement/user',
        name: 'UserAgreement',
        component: () => import('@/views/agreement/User.vue'),
        meta: { title: '用户协议', icon: 'FileSignature', breadcrumbs: ['系统配置', '用户协议管理'] }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Route Guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Set window title
  if (to.meta.title) {
    document.title = (to.meta.title as string) + ' - 即闪'
  } else {
    document.title = '即闪后台管理系统'
  }

  const isAuth = authStore.isAuthenticated()

  if (to.meta.guestOnly && isAuth) {
    next({ name: 'Dashboard' })
  } else if (!to.meta.guestOnly && !to.meta.guest && !isAuth) {
    next({ name: 'Login' })
  } else {
    next()
  }
})

export default router
