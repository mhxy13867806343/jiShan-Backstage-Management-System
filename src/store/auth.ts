import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const adminName = ref<string | null>(localStorage.getItem('admin_username'))

  const isAuthenticated = () => {
    return !!token.value
  }

  const login = (username: string, tokenVal: string) => {
    token.value = tokenVal
    adminName.value = username
    localStorage.setItem('admin_token', tokenVal)
    localStorage.setItem('admin_username', username)
  }

  const logout = () => {
    token.value = null
    adminName.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
  }

  return {
    token,
    adminName,
    isAuthenticated,
    login,
    logout
  }
})
