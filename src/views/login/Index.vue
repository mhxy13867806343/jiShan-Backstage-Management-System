<template>
  <div class="login-bg">
    <div class="login-card-container glass-effect">
      <div class="login-header">
        <div class="logo-area">
          <el-icon class="logo-icon" :size="36"><Platform /></el-icon>
        </div>
        <h1 class="brand-title">即闪后台</h1>
        <p class="brand-subtitle">JiShan Backstage Management System</p>
      </div>

      <el-form 
        ref="loginFormRef" 
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username" label="管理员账号">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入管理员用户名" 
            prefix-icon="User"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password" label="安全密码">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            prefix-icon="Lock" 
            show-password
          />
        </el-form-item>

        <div class="tips-box">
          <el-alert 
            title="演示账号: admin | 密码: 123456" 
            type="info" 
            :closable="false" 
            show-icon
          />
        </div>

        <el-button 
          type="primary" 
          class="login-btn" 
          :loading="loading" 
          @click="handleLogin"
        >
          登 录 系 统
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Platform } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

import { adminApi } from '@/api/admin'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref<FormInstance>()
const loading = ref(false)

const loginForm = reactive({
  username: 'admin',
  password: '123456'
})

const loginRules = {
  username: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符之间', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码不能少于 6 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await adminApi.login(loginForm.username, loginForm.password)
        if (res.code === 200 && res.data) {
          authStore.login(res.data.username || loginForm.username, res.data.token)
          ElMessage.success('欢迎回来，运营管理员！')
          router.push('/dashboard')
        } else {
          ElMessage.error(res.message || '用户名或密码错误')
        }
      } catch (err: any) {
        // Axios error message is handled by request interceptor, but we catch to clear loading
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.login-card-container {
  width: 440px;
  max-width: 90%;
  padding: 45px 40px;
  border-radius: 24px;
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.15);
  z-index: 10;
  transition: all 0.3s ease;
}

.login-header {
  text-align: center;
  margin-bottom: 35px;
}

.logo-area {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  margin-bottom: 18px;
  box-shadow: 0 10px 20px rgba(88, 86, 214, 0.3);
}

.brand-title {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 4px;
}

.brand-subtitle {
  font-size: 13px;
  color: var(--text-light);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-form :deep(.el-form-item__label) {
  font-weight: 600;
  color: var(--text-regular);
  padding-bottom: 6px;
  font-size: 14px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 12px 15px !important;
}

.tips-box {
  margin: 15px 0 25px 0;
}

.login-btn {
  width: 100%;
  padding: 24px 0 !important;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  border-radius: 12px !important;
}
</style>
