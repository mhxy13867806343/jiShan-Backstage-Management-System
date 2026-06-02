import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const adminName = ref<string | null>(localStorage.getItem('admin_username'))
  const role = ref<string | null>(localStorage.getItem('admin_role'))
  const avatar = ref<string | null>(localStorage.getItem('admin_avatar') || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80')
  
  const getStoredPermissions = (): string[] => {
    const cached = localStorage.getItem('admin_permissions')
    if (cached) {
      try {
        return JSON.parse(cached)
      } catch (e) {
        console.error('Failed to parse cached permissions', e)
      }
    }
    return []
  }

  const permissions = ref<string[]>(getStoredPermissions())

  const isAuthenticated = () => {
    return !!token.value
  }

  const login = (username: string, tokenVal: string, userRole = 'admin', userPermissions: string[] = [], userAvatar = '') => {
    token.value = tokenVal
    adminName.value = username
    role.value = userRole
    permissions.value = userPermissions
    localStorage.setItem('admin_token', tokenVal)
    localStorage.setItem('admin_username', username)
    localStorage.setItem('admin_role', userRole)
    localStorage.setItem('admin_permissions', JSON.stringify(userPermissions))
    
    const finalAvatar = userAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    avatar.value = finalAvatar
    localStorage.setItem('admin_avatar', finalAvatar)
  }

  const logout = () => {
    token.value = null
    adminName.value = null
    role.value = null
    permissions.value = []
    avatar.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    localStorage.removeItem('admin_role')
    localStorage.removeItem('admin_permissions')
    localStorage.removeItem('admin_avatar')
  }

  const hasPermission = (perm: string) => {
    if (role.value === 'superadmin') return true
    return permissions.value.includes(perm)
  }

  const updateAvatar = (newAvatar: string) => {
    avatar.value = newAvatar
    localStorage.setItem('admin_avatar', newAvatar)
  }

  return {
    token,
    adminName,
    role,
    permissions,
    avatar,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    updateAvatar
  }
})
