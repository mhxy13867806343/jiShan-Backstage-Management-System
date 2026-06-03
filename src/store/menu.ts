import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi, type ApiMenuItem } from '@/api/admin'
import type { Router, RouteRecordRaw } from 'vue-router'

export const useMenuStore = defineStore('menu', () => {
  const menuTree = ref<ApiMenuItem[]>([])
  const isRoutesLoaded = ref(false)

  // Fetch the nested menu tree for the layout sidebar (only active items)
  const fetchMenuTree = async (force = false) => {
    try {
      if (!force) {
        const cached = localStorage.getItem('admin_menu_tree')
        if (cached) {
          try {
            menuTree.value = JSON.parse(cached)
            console.log('--- [debug] Loaded menu tree from localStorage cache')
            return
          } catch (e) {
            console.error('Failed to parse cached menu tree:', e)
          }
        }
      }

      const res = await adminApi.getMenuTree({ onlyActive: true })
      
      // Cosmic array resolver: Handles array directly, res.list, res.data.list, or res.data
      const list = Array.isArray(res) 
        ? res 
        : (Array.isArray((res as any)?.list) 
            ? (res as any).list 
            : (Array.isArray((res as any)?.data?.list) 
                ? (res as any).data.list 
                : (Array.isArray((res as any)?.data) 
                    ? (res as any).data 
                    : [])))

      menuTree.value = list as ApiMenuItem[]

      // Robust auto-injection: If role is superadmin, guarantee Menu Management availability
      const role = (res as any)?.data?.role || (res as any)?.role || ''
      if (role === 'superadmin') {
        const hasMenuNode = (nodes: ApiMenuItem[]): boolean => {
          for (const node of nodes) {
            if (node.path === '/menu' || node.path === 'menu' || node.path?.endsWith('/menu')) {
              return true
            }
            if (node.children && node.children.length > 0) {
              if (hasMenuNode(node.children)) return true
            }
          }
          return false
        }

        if (!hasMenuNode(menuTree.value)) {
          // Find "系统配置" node (path: /system) to nest Menu Management under it
          let systemNode: ApiMenuItem | null = null
          const findSystemNode = (nodes: ApiMenuItem[]) => {
            for (const node of nodes) {
              if (node.path === '/system' || node.path === 'system' || node.path?.endsWith('/system')) {
                systemNode = node
                return
              }
              if (node.children && node.children.length > 0) {
                findSystemNode(node.children)
                if (systemNode) return
              }
            }
          }
          
          findSystemNode(menuTree.value)

          const menuManagerNode: ApiMenuItem = {
            menuId: 'menu_menu_management',
            parentId: systemNode ? (systemNode as any).menuId : null,
            title: '菜单管理',
            name: 'MenuList',
            path: '/menu',
            component: 'menu/List.vue',
            icon: 'Grid',
            sort: 99,
            status: 'active',
            breadcrumbs: ['系统配置', '菜单管理'],
            children: []
          }

          if (systemNode) {
            if (!(systemNode as any).children) {
              (systemNode as any).children = []
            }
            (systemNode as any).children.push(menuManagerNode)
            console.log('--- [debug] Auto-injected Menu Management under System Config')
          } else {
            menuTree.value.push(menuManagerNode)
            console.log('--- [debug] Auto-injected Menu Management as top-level menu')
          }
        }

        // Auto-inject Log Management node
        const hasLogNode = (nodes: ApiMenuItem[]): boolean => {
          for (const node of nodes) {
            if (node.path === '/log/list' || node.path === 'log/list' || node.path?.endsWith('/log/list')) {
              return true
            }
            if (node.children && node.children.length > 0) {
              if (hasLogNode(node.children)) return true
            }
          }
          return false
        }

        if (!hasLogNode(menuTree.value)) {
          let systemNode: ApiMenuItem | null = null
          const findSystemNode = (nodes: ApiMenuItem[]) => {
            for (const node of nodes) {
              if (node.path === '/system' || node.path === 'system' || node.path?.endsWith('/system')) {
                systemNode = node
                return
              }
              if (node.children && node.children.length > 0) {
                findSystemNode(node.children)
                if (systemNode) return
              }
            }
          }
          
          findSystemNode(menuTree.value)

          const logManagerNode: ApiMenuItem = {
            menuId: 'menu_log_management',
            parentId: systemNode ? (systemNode as any).menuId : null,
            title: '日志管理',
            name: 'LogList',
            path: '/log/list',
            component: 'log/List.vue',
            icon: 'DocumentCopy',
            sort: 100,
            status: 'active',
            breadcrumbs: ['系统配置', '日志管理'],
            children: []
          }

          if (systemNode) {
            if (!(systemNode as any).children) {
              (systemNode as any).children = []
            }
            (systemNode as any).children.push(logManagerNode)
            console.log('--- [debug] Auto-injected Log Management under System Config')
          } else {
            menuTree.value.push(logManagerNode)
            console.log('--- [debug] Auto-injected Log Management as top-level menu')
          }
        }

        // Auto-inject Package Management node
        const hasPackageNode = (nodes: ApiMenuItem[]): boolean => {
          for (const node of nodes) {
            if (node.path === '/package/list' || node.path === 'package/list' || node.path?.endsWith('/package/list')) {
              return true
            }
            if (node.children && node.children.length > 0) {
              if (hasPackageNode(node.children)) return true
            }
          }
          return false
        }

        if (!hasPackageNode(menuTree.value)) {
          let systemNode: ApiMenuItem | null = null
          const findSystemNode = (nodes: ApiMenuItem[]) => {
            for (const node of nodes) {
              if (node.path === '/system' || node.path === 'system' || node.path?.endsWith('/system')) {
                systemNode = node
                return
              }
              if (node.children && node.children.length > 0) {
                findSystemNode(node.children)
                if (systemNode) return
              }
            }
          }
          
          findSystemNode(menuTree.value)

          const packageNode: ApiMenuItem = {
            menuId: 'menu_package_management',
            parentId: systemNode ? (systemNode as any).menuId : null,
            title: '安装包管理',
            name: 'PackageList',
            path: '/package/list',
            component: 'package/List.vue',
            icon: 'UploadFilled',
            sort: 101,
            status: 'active',
            breadcrumbs: ['系统配置', '安装包管理'],
            children: []
          }

          if (systemNode) {
            if (!(systemNode as any).children) {
              (systemNode as any).children = []
            }
            (systemNode as any).children.push(packageNode)
            console.log('--- [debug] Auto-injected Package Management under System Config')
          } else {
            menuTree.value.push(packageNode)
            console.log('--- [debug] Auto-injected Package Management as top-level menu')
          }
        }

        // Auto-inject Blacklist Management node
        const hasBlacklistNode = (nodes: ApiMenuItem[]): boolean => {
          for (const node of nodes) {
            if (node.path === '/blacklist/list' || node.path === 'blacklist/list' || node.path?.endsWith('/blacklist/list')) {
              return true
            }
            if (node.children && node.children.length > 0) {
              if (hasBlacklistNode(node.children)) return true
            }
          }
          return false
        }

        if (!hasBlacklistNode(menuTree.value)) {
          let systemNode: ApiMenuItem | null = null
          const findSystemNode = (nodes: ApiMenuItem[]) => {
            for (const node of nodes) {
              if (node.path === '/system' || node.path === 'system' || node.path?.endsWith('/system')) {
                systemNode = node
                return
              }
              if (node.children && node.children.length > 0) {
                findSystemNode(node.children)
                if (systemNode) return
              }
            }
          }
          
          findSystemNode(menuTree.value)

          const blacklistNode: ApiMenuItem = {
            menuId: 'menu_blacklist_management',
            parentId: systemNode ? (systemNode as any).menuId : null,
            title: '黑名单管理',
            name: 'BlacklistList',
            path: '/blacklist/list',
            component: 'blacklist/List.vue',
            icon: 'CircleCloseFilled',
            sort: 102,
            status: 'active',
            breadcrumbs: ['系统配置', '黑名单管理'],
            children: []
          }

          if (systemNode) {
            if (!(systemNode as any).children) {
              (systemNode as any).children = []
            }
            (systemNode as any).children.push(blacklistNode)
            console.log('--- [debug] Auto-injected Blacklist Management under System Config')
          } else {
            menuTree.value.push(blacklistNode)
            console.log('--- [debug] Auto-injected Blacklist Management as top-level menu')
          }
        }
      }

      // ─────────────────────────────────────────────────────────────────
      // Dynamic Grouping of Operations Menus
      // ─────────────────────────────────────────────────────────────────
      const operationsChildrenKeys = ['menu_user', 'menu_simulator', 'menu_like', 'menu_share']
      const operationsChildrenPaths = ['/user', '/simulator', '/like', '/share', '/like/list', '/share/list']

      let operationsNode: ApiMenuItem | null = null
      
      const findOperationsNode = (nodes: ApiMenuItem[]): ApiMenuItem | null => {
        for (const node of nodes) {
          if (node.path === '/operations' || node.title === '运营管理' || node.menuId === 'menu_operations') {
            return node
          }
          if (node.children && node.children.length > 0) {
            const found = findOperationsNode(node.children)
            if (found) return found
          }
        }
        return null
      }
      
      operationsNode = findOperationsNode(menuTree.value)
      
      if (!operationsNode) {
        operationsNode = {
          menuId: 'menu_operations',
          parentId: null,
          title: '运营管理',
          name: 'Operations',
          path: '/operations',
          component: '',
          icon: 'Share',
          sort: 2,
          status: 'active',
          breadcrumbs: ['运营管理'],
          children: []
        }
      }
      
      const childrenToNest: ApiMenuItem[] = []
      const remainingRootNodes: ApiMenuItem[] = []
      
      menuTree.value.forEach(node => {
        const shouldNest = operationsChildrenKeys.includes(node.menuId) || 
                           operationsChildrenPaths.includes(node.path || '') ||
                           node.title === '点赞管理' || node.title === '分享管理'
        
        if (shouldNest) {
          node.parentId = 'menu_operations'
          node.breadcrumbs = ['运营管理', node.title]
          childrenToNest.push(node)
        } else {
          remainingRootNodes.push(node)
        }
      })
      
      if (childrenToNest.length > 0) {
        childrenToNest.sort((a, b) => (a.sort || 0) - (b.sort || 0))
        operationsNode.children = childrenToNest
        
        remainingRootNodes.push(operationsNode)
        remainingRootNodes.sort((a, b) => (a.sort || 0) - (b.sort || 0))
        menuTree.value = remainingRootNodes
      }


      // Cache the result in localStorage
      localStorage.setItem('admin_menu_tree', JSON.stringify(menuTree.value))
      console.log('--- [debug] Cached fetched menu tree in localStorage')
    } catch (err) {
      console.error('Failed to fetch menu tree:', err)
    }
  }

  // Fetch and register routes dynamically
  const generateRoutes = async (router: Router) => {
    if (isRoutesLoaded.value) return

    try {
      // 1. Fetch active menu tree first if not loaded
      if (menuTree.value.length === 0) {
        await fetchMenuTree()
      }

      const modules = import.meta.glob('../views/**/*.vue')
      
      // Case-insensitive module resolver to handle discrepancies like "List.vue" vs "list.vue"
      const modulesLower = new Map<string, any>()
      Object.keys(modules).forEach((key) => {
        modulesLower.set(key.toLowerCase(), modules[key])
      })

      // Recursive route registration function to traverse full dynamic menu tree
      const registerNode = (item: ApiMenuItem) => {
        const isNodeActive = item.status === 'active' || (item.status as string) === 'enabled'
        if (isNodeActive && item.path) {
          // Robust component path resolution (Trims "views/" prefix and appends ".vue" if omitted)
          let comp = item.component || ''
          if (comp.startsWith('views/')) {
            comp = comp.substring(6)
          }
          if (comp && !comp.endsWith('.vue')) {
            comp = comp + '.vue'
          }

          let finalModule = null
          if (comp) {
            const componentPath = `../views/${comp}`
            finalModule = modulesLower.get(componentPath.toLowerCase())
          }

          // Fallback auto-guesser if path is missing or mismatched
          if (!finalModule) {
            let guessedComp = ''
            const p = item.path.trim().toLowerCase()
            if (p === '/dashboard') {
              guessedComp = 'dashboard/Index.vue'
            } else if (p === '/simulator') {
              guessedComp = 'simulator/Index.vue'
            } else if (p === '/agreement/privacy') {
              guessedComp = 'agreement/Privacy.vue'
            } else if (p === '/agreement/user') {
              guessedComp = 'agreement/User.vue'
            } else if (p === '/announcement/single') {
              guessedComp = 'announcement/Single.vue'
            } else if (p === '/account/profile' || p === 'account/profile') {
              guessedComp = 'account/Profile.vue'
            } else if (p === '/account/settings' || p === 'account/settings') {
              guessedComp = 'account/Settings.vue'
            } else if (p === '/log/list' || p === 'log/list') {
              guessedComp = 'log/List.vue'
            } else {
              // E.g. "/region" or "/region/list" -> "region/List.vue"
              const segments = p.split('/').filter(Boolean)
              if (segments.length > 0) {
                const folder = segments[0]
                guessedComp = `${folder}/List.vue`
              }
            }

            if (guessedComp) {
              const guessedPath = `../views/${guessedComp}`
              finalModule = modulesLower.get(guessedPath.toLowerCase())
            }
          }

          if (finalModule) {
            // Trim leading slash for standard relative child routing
            const cleanPath = item.path.replace(/^\//, '')
            const routeRecord: RouteRecordRaw = {
              path: cleanPath,
              name: item.name || `menu_${item.menuId}`,
              component: finalModule,
              meta: {
                title: item.title,
                icon: item.icon,
                breadcrumbs: item.breadcrumbs || []
              }
            }

            // Register under main Layout
            router.addRoute('Layout', routeRecord)
            console.log(`--- [debug] Registered route: ${item.path} -> ${item.name || `menu_${item.menuId}`}`)
          }
        }

        // Traverse children recursively
        if (item.children && item.children.length > 0) {
          item.children.forEach(registerNode)
        }
      }

      // Start recursive traversal on all root menu nodes
      menuTree.value.forEach(registerNode)

      // Register wildcard fallback route at the end to prevent early redirection to "/"
      router.addRoute({
        path: '/:pathMatch(.*)*',
        redirect: '/'
      })

      isRoutesLoaded.value = true
    } catch (err) {
      console.error('Failed to generate dynamic routes:', err)
    }
  }

  // Reset store state on logout
  const resetMenu = () => {
    menuTree.value = []
    isRoutesLoaded.value = false
    localStorage.removeItem('admin_menu_tree')
    console.log('--- [debug] Removed admin_menu_tree from localStorage cache on logout')
  }

  return {
    menuTree,
    isRoutesLoaded,
    fetchMenuTree,
    generateRoutes,
    resetMenu
  }
})
