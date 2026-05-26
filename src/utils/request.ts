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

  // Fallback
  return {
    code: 404,
    message: 'Mock Endpoint Not Found',
    data: null
  }
}

// Intercept axios request to return Mock Data instead of making real network requests
// This allows seamless integration when real backend is ready by simply turning this block off.
const ENABLE_MOCK = true

service.interceptors.response.use(
  async (response) => {
    // If we're bypassing mock or the url doesn't match standard patterns, return standard response
    return response
  },
  async (error) => {
    const config = error.config
    
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
