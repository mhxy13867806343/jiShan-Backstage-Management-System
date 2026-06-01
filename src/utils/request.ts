import axios from 'axios'
import { useMockDataStore } from '@/store/mockData'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'

// Create axios instance
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 10000
})

// Request interceptor
service.interceptors.request.use(
  config => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Helper to simulate network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Local Mock Request Handler
const handleMockRequest = async (config: any) => {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const params = config.params || {}
  const data = config.data || {}
  
  const mockStore = useMockDataStore()
  const authStore = useAuthStore()

  // 1. Auth Endpoint
  if (url.includes('/api/admin/auth/login') && method === 'post') {
    const { username, password } = data
    if (username === 'admin' && password === '123456') {
      const generatedToken = 'admin_token_' + Math.random().toString(36).substring(2)
      authStore.login(username, generatedToken)
      return {
        code: 200,
        message: '登录成功',
        data: {
          token: generatedToken,
          username
        }
      }
    } else {
      return {
        code: 400,
        message: '用户名或密码错误',
        data: null
      }
    }
  }

  // Check auth for other admin endpoints
  if (!authStore.isAuthenticated() && !url.includes('/api/admin/auth/login')) {
    return {
      code: 401,
      message: '登录失效，请重新登录',
      data: null
    }
  }

  // 2. Dashboard Metrics
  if (url.includes('/api/admin/dashboard/metrics') && method === 'get') {
    return {
      code: 200,
      message: 'success',
      data: mockStore.getDashboardMetrics()
    }
  }

  // 3. User Management
  if (url === '/api/admin/users' && method === 'get') {
    const res = mockStore.getUsers(params)
    return {
      code: 200,
      message: 'success',
      data: res
    }
  }

  if (url.startsWith('/api/admin/users/') && method === 'get') {
    const user_id = url.split('/').pop() || ''
    const user = mockStore.getUserById(user_id)
    if (user) {
      return { code: 200, message: 'success', data: user }
    }
    return { code: 404, message: '用户未找到', data: null }
  }

  if (url.startsWith('/api/admin/users/') && method === 'put') {
    const user_id = url.split('/').pop() || ''
    const { status } = data
    const success = mockStore.updateUserStatus(user_id, status)
    if (success) {
      return { code: 200, message: '操作成功', data: null }
    }
    return { code: 400, message: '操作失败', data: null }
  }

  // 4. Content Management
  if (url === '/api/admin/posts' && method === 'get') {
    const res = mockStore.getPosts(params)
    return {
      code: 200,
      message: 'success',
      data: res
    }
  }

  if (url.startsWith('/api/admin/posts/') && url.endsWith('/offline') && method === 'put') {
    // URL pattern: /api/admin/posts/{post_id}/offline
    const parts = url.split('/')
    const post_id = parts[parts.length - 2]
    const success = mockStore.setPostOffline(post_id)
    if (success) {
      return { code: 200, message: '内容已成功下架', data: null }
    }
    return { code: 400, message: '操作失败', data: null }
  }

  if (url.startsWith('/api/admin/posts/') && url.endsWith('/restore') && method === 'put') {
    // URL pattern: /api/admin/posts/{post_id}/restore
    const parts = url.split('/')
    const post_id = parts[parts.length - 2]
    const success = mockStore.setPostOnline(post_id)
    if (success) {
      return { code: 200, message: '内容已恢复上架', data: null }
    }
    return { code: 400, message: '操作失败', data: null }
  }

  if (url.startsWith('/api/admin/posts/') && method === 'get') {
    // URL pattern: /api/admin/posts/{post_id}
    const post_id = url.split('/').pop() || ''
    const post = mockStore.getPostById(post_id)
    if (post) {
      return { code: 200, message: 'success', data: post }
    }
    return { code: 404, message: '内容未找到', data: null }
  }

  // 5. Comment Management
  if (url === '/api/admin/comments' && method === 'get') {
    const res = mockStore.getComments(params)
    return {
      code: 200,
      message: 'success',
      data: res
    }
  }

  if (url.startsWith('/api/admin/comments/') && method === 'delete') {
    const comment_id = url.split('/').pop() || ''
    const success = mockStore.deleteComment(comment_id)
    if (success) {
      return { code: 200, message: '评论已成功删除', data: null }
    }
    return { code: 400, message: '删除失败', data: null }
  }

  // 6. Agreement Management
  if (url === '/api/admin/agreement/privacy') {
    if (method === 'get') {
      return {
        code: 200,
        message: 'success',
        data: mockStore.getAgreement('privacy')
      }
    } else if (method === 'put') {
      mockStore.updateAgreement('privacy', data.content)
      return {
        code: 200,
        message: '隐私协议更新成功',
        data: null
      }
    }
  }

  if (url === '/api/admin/agreement/user') {
    if (method === 'get') {
      return {
        code: 200,
        message: 'success',
        data: mockStore.getAgreement('user')
      }
    } else if (method === 'put') {
      mockStore.updateAgreement('user', data.content)
      return {
        code: 200,
        message: '用户协议更新成功',
        data: null
      }
    }
  }

  // --- MOCK ANNOUNCEMENTS ---
  if (url === '/api/admin/announcements' && method === 'get') {
    const res = mockStore.getAnnouncements(params)
    return { code: 200, message: 'success', data: res }
  }
  if (url === '/api/admin/announcements' && method === 'post') {
    const res = mockStore.addAnnouncement(data)
    return { code: 200, message: 'success', data: res }
  }
  // ⚠️ 批量路由必须在通用 startsWith 之前判断，否则会被误匹配
  if (url === '/api/admin/announcements/batch-publish' && method === 'put') {
    mockStore.batchPublishAnnouncements(data.ids)
    return { code: 200, message: 'success', data: null }
  }
  if (url === '/api/admin/announcements/batch-disable' && method === 'put') {
    mockStore.batchDisableAnnouncements(data.ids)
    return { code: 200, message: 'success', data: null }
  }
  if (url === '/api/admin/announcements/batch-delete' && method === 'post') {
    mockStore.batchDeleteAnnouncements(data.ids)
    return { code: 200, message: 'success', data: null }
  }
  // 单条操作放在批量路由之后
  if (url.startsWith('/api/admin/announcements/') && method === 'put') {
    const id = url.split('/').pop() || ''
    mockStore.updateAnnouncement(id, data)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/announcements/') && method === 'delete') {
    const id = url.split('/').pop() || ''
    mockStore.deleteAnnouncement(id)
    return { code: 200, message: 'success', data: null }
  }

  // --- MOCK VERSIONS ---
  if (url === '/api/admin/versions' && method === 'get') {
    const res = mockStore.getVersions(params)
    return { code: 200, message: 'success', data: res }
  }
  if (url === '/api/admin/versions' && method === 'post') {
    const res = mockStore.addVersion(data)
    return { code: 200, message: 'success', data: res }
  }
  // ⚠️ 批量路由必须在通用 startsWith 之前判断
  if (url === '/api/admin/versions/batch-deprecate' && method === 'put') {
    mockStore.batchDeprecateVersions(data.ids)
    return { code: 200, message: 'success', data: null }
  }
  if (url === '/api/admin/versions/batch-delete' && method === 'post') {
    mockStore.batchDeleteVersions(data.ids)
    return { code: 200, message: 'success', data: null }
  }
  // deprecate 单条：URL = /api/admin/versions/{id}/deprecate，需正确提取 id
  if (url.startsWith('/api/admin/versions/') && url.endsWith('/deprecate') && method === 'put') {
    const parts = url.split('/')
    const id = parts[parts.length - 2] // 倒数第二段才是真实 id
    mockStore.deprecateVersion(id)
    return { code: 200, message: 'success', data: null }
  }
  // 单条编辑
  if (url.startsWith('/api/admin/versions/') && method === 'put') {
    const id = url.split('/').pop() || ''
    mockStore.updateVersion(id, data)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/versions/') && method === 'delete') {
    const id = url.split('/').pop() || ''
    mockStore.deleteVersion(id)
    return { code: 200, message: 'success', data: null }
  }

  // --- MOCK TAGS ---
  if (url === '/api/admin/tags' && method === 'get') {
    return { code: 200, message: 'success', data: mockStore.tags }
  }
  if (url === '/api/admin/tags' && method === 'post') {
    mockStore.addTag(data.name)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/tags/') && method === 'delete') {
    const name = decodeURIComponent(url.split('/').pop() || '')
    mockStore.deleteTag(name)
    return { code: 200, message: 'success', data: null }
  }

  // --- MOCK REGIONS ---
  if (url === '/api/admin/regions' && method === 'get') {
    return { code: 200, message: 'success', data: mockStore.regions }
  }
  if (url === '/api/admin/regions' && method === 'post') {
    mockStore.addRegion(data.name)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/regions/') && method === 'delete') {
    const name = decodeURIComponent(url.split('/').pop() || '')
    mockStore.deleteRegion(name)
    return { code: 200, message: 'success', data: null }
  }

  // --- MOCK DICTS ---
  if (url === '/api/admin/dicts' && method === 'get') {
    return { code: 200, message: 'success', data: mockStore.dicts }
  }
  if (url.startsWith('/api/admin/dicts/') && method === 'post') {
    const key = url.split('/').pop() || ''
    mockStore.addDictItem(key, data.item, data.parentValue)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/dicts/') && method === 'delete') {
    const parts = url.split('/')
    const value = parts.pop() || ''
    const key = parts.pop() || ''
    mockStore.deleteDictItem(key, value)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/dicts/') && method === 'put') {
    const parts = url.split('/')
    const value = parts.pop() || ''
    const key = parts.pop() || ''
    mockStore.updateDictItem(key, value, data)
    return { code: 200, message: 'success', data: null }
  }

  // --- MOCK SYSTEM MESSAGES ---
  if (url === '/api/admin/messages' && method === 'get') {
    return { code: 200, message: 'success', data: mockStore.messages }
  }
  if (url === '/api/admin/messages' && method === 'post') {
    mockStore.addMessage(data)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/messages/') && method === 'put') {
    const id = url.split('/').pop() || ''
    mockStore.updateMessage(id, data)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/messages/') && method === 'delete') {
    const id = url.split('/').pop() || ''
    mockStore.deleteMessage(id)
    return { code: 200, message: 'success', data: null }
  }

  // --- MOCK ADMIN ACCOUNTS ---
  if (url === '/api/admin/accounts' && method === 'get') {
    return { code: 200, message: 'success', data: mockStore.getAdminAccounts() }
  }
  if (url === '/api/admin/accounts' && method === 'post') {
    mockStore.addAdminAccount(data)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/accounts/') && method === 'put') {
    const id = url.split('/').pop() || ''
    mockStore.updateAdminAccount(id, data)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/accounts/') && method === 'delete') {
    const id = url.split('/').pop() || ''
    mockStore.deleteAdminAccount(id)
    return { code: 200, message: 'success', data: null }
  }
  if (url.startsWith('/api/admin/accounts/') && url.endsWith('/reset-password') && method === 'post') {
    const parts = url.split('/')
    const id = parts[parts.length - 2]
    mockStore.resetAdminPassword(id)
    return { code: 200, message: 'success', data: null }
  }

  // Fallback
  return {
    code: 404,
    message: 'Mock Endpoint Not Found',
    data: null
  }
}

// Intercept axios request to return Mock Data instead of making real network requests
// This allows seamless integration when real backend is ready by simply turning this block off.
const ENABLE_MOCK = false

service.interceptors.response.use(
  async (response) => {
    // 成功响应直接返回 response.data，mock fallback 只在 error interceptor 里处理
    return response.data
  },
  async (error) => {
    const config = error.config
    
    // Check if it's a mock-only route (we want it to trigger network request first, then fallback to mock data on 404/failure)
    const isMockRoute = config && (
      config.url.includes('/api/admin/announcements') ||
      config.url.includes('/api/admin/versions') ||
      config.url.includes('/api/admin/accounts')
    )

    if (isMockRoute && config) {
      try {
        // Simulate minor network latency (100ms to 300ms)
        await delay(Math.floor(Math.random() * 200) + 100)
        const mockResult = await handleMockRequest(config)
        // 检查 mock 返回的业务 code，处理 401 鉴权失败
        if (mockResult.code === 401) {
          const authStore = useAuthStore()
          authStore.logout()
          ElMessage.error(mockResult.message || '登录失效，请重新登录')
          if (window.location.hash !== '#/login') {
            window.location.hash = '/login'
          }
          return Promise.reject(new Error(mockResult.message))
        }
        return mockResult
      } catch (err: any) {
        ElMessage.error(err.message || 'Mock Fallback Error')
        return Promise.reject(err)
      }
    }

    if (ENABLE_MOCK && config) {
      try {
        // Simulate network latency (300ms to 600ms)
        await delay(Math.floor(Math.random() * 300) + 300)
        
        const mockResult = await handleMockRequest(config)
        
        if (mockResult.code === 200) {
          return mockResult
        } else {
          // Handle error codes
          if (mockResult.code === 401) {
            const authStore = useAuthStore()
            authStore.logout()
            ElMessage.error(mockResult.message)
            // Redirect to login if on page
            if (window.location.hash !== '#/login') {
              window.location.hash = '/login'
            }
          } else {
            ElMessage.error(mockResult.message)
          }
          return Promise.reject(new Error(mockResult.message))
        }
      } catch (err: any) {
        ElMessage.error(err.message || 'Mock Error')
        return Promise.reject(err)
      }
    }
    
    // Normal response error handling
    ElMessage.error(error.message || '网络请求错误')
    return Promise.reject(error)
  }
)

// We wrap the get/post/put/delete request styles for easier caller usage
export const request = {
  get<T = any>(url: string, params?: any): Promise<{ code: number; message: string; data: T }> {
    return service.get(url, { params }) as any
  },
  post<T = any>(url: string, data?: any): Promise<{ code: number; message: string; data: T }> {
    return service.post(url, data) as any
  },
  put<T = any>(url: string, data?: any): Promise<{ code: number; message: string; data: T }> {
    return service.put(url, data) as any
  },
  delete<T = any>(url: string): Promise<{ code: number; message: string; data: T }> {
    return service.delete(url) as any
  }
}

export default service
