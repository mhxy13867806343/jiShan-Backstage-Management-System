import axios from 'axios'
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

service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const msg = error.response?.data?.message || error.response?.data?.msg || error.message || '网络请求错误'
    ElMessage.error(msg)
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
