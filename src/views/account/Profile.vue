<template>
  <div class="profile-container animate-fade-in" v-loading="loading">
    <!-- Header -->
    <div class="profile-header-bar">
      <h2>个人中心 (Personal Center)</h2>
      <p class="subtitle-text">维护您的基本个人账户资料信息。</p>
    </div>

    <!-- Main Grid -->
    <el-row :gutter="20" class="profile-grid-row">
      <!-- Left Column: Profile Card -->
      <el-col :span="8" :xs="24" :sm="24" :md="8" :lg="8" class="col-margin-bottom">
        <el-card class="premium-card profile-info-card" shadow="never">
          <div class="card-cover-header"></div>
          <div class="card-avatar-wrapper">
            <el-avatar :size="100" :src="profileForm.avatar" class="avatar-hover-trigger" @click="openAvatarDialog" />
            <div class="avatar-edit-overlay" @click="openAvatarDialog">
              <el-icon><Camera /></el-icon>
              <span>更换头像</span>
            </div>
          </div>
          <div class="profile-meta-info">
            <h3>{{ profileForm.nickname || '即闪管理员' }}</h3>
            <el-tag :type="getRoleTagType(profileForm.role)" effect="dark" size="small" class="role-badge">
              {{ getRoleName(profileForm.role) }}
            </el-tag>
            <div class="meta-desc-box">
              <p class="meta-desc-item">
                <el-icon><User /></el-icon>
                <span>账号: <b>{{ profileForm.username }}</b></span>
              </p>
              <p class="meta-desc-item">
                <el-icon><Calendar /></el-icon>
                <span>注册时间: <b>{{ profileForm.createTime || '--' }}</b></span>
              </p>
              <p class="meta-desc-item">
                <el-icon><Clock /></el-icon>
                <span>最近登录: <b>{{ profileForm.lastLogin || '--' }}</b></span>
              </p>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- Right Column: Settings Form -->
      <el-col :span="16" :xs="24" :sm="24" :md="16" :lg="16">
        <el-card class="premium-card" shadow="never">
          <template #header>
            <div class="card-header-flex">
              <span class="card-title-text">基本资料编辑</span>
            </div>
          </template>

          <el-form :model="profileForm" :rules="profileRules" ref="formRef" label-width="100px" class="profile-edit-form">
            <el-form-item label="管理员账号">
              <el-input v-model="profileForm.username" disabled placeholder="管理员账号" class="disabled-field" />
              <div class="field-tip">系统登录唯一标识，不可修改</div>
            </el-form-item>
            
            <el-form-item label="管理员角色">
              <el-input :value="getRoleName(profileForm.role)" disabled class="disabled-field" />
              <div class="field-tip">您的系统所属权限级别，如需变更请联系超级管理员</div>
            </el-form-item>

            <el-form-item label="名称/昵称" prop="nickname">
              <el-input v-model="profileForm.nickname" placeholder="请输入昵称" />
            </el-form-item>

            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="profileForm.phone" placeholder="请输入手机号码" />
            </el-form-item>

            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="profileForm.email" placeholder="请输入邮箱地址" />
            </el-form-item>

            <el-form-item label="备注描述">
              <el-input v-model="profileForm.remark" type="textarea" :rows="3" disabled class="disabled-field" placeholder="该管理员账号备注" />
            </el-form-item>

            <el-form-item class="form-action-item">
              <el-button type="primary" @click="submitSave">保存修改</el-button>
              <el-button @click="resetForm">重置表单</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
    </el-row>

    <!-- Preset Avatar Selection Dialog -->
    <el-dialog
      v-model="avatarDialogVisible"
      title="选择管理员系统头像"
      width="460px"
      destroy-on-close
      class="avatar-selection-dialog"
    >
      <div class="preset-avatar-grid">
        <div 
          v-for="(img, idx) in presetAvatars" 
          :key="idx" 
          class="avatar-grid-item"
          :class="{ 'active': selectedTempAvatar === img }"
          @click="selectedTempAvatar = img"
        >
          <el-avatar :size="60" :src="img" />
          <div class="active-check-badge" v-if="selectedTempAvatar === img">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>
      
      <div class="custom-avatar-url-box">
        <div class="url-title">使用自定义头像 URL：</div>
        <el-input v-model="customAvatarUrl" placeholder="请输入外部图片 URL 地址" size="small" />
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="avatarDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmAvatar">确定更换</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { adminApi } from '@/api/admin'
import { ElMessage, type FormInstance } from 'element-plus'
import { Camera, User, Calendar, Clock, Check } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const loading = ref(false)
const formRef = ref<FormInstance>()
const avatarDialogVisible = ref(false)

const profileForm = ref<any>({
  account_id: '',
  username: '',
  nickname: '',
  phone: '',
  email: '',
  avatar: '',
  role: '',
  remark: '',
  createTime: '',
  lastLogin: ''
})

const originalProfile = ref<any>({})
const selectedTempAvatar = ref('')
const customAvatarUrl = ref('')

const presetAvatars = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
]

const profileRules = {
  nickname: [
    { required: true, message: '请输入名称/昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符之间', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入有效的邮箱地址', trigger: 'blur' }
  ]
}

const getRoleName = (role: string) => {
  const map: Record<string, string> = {
    superadmin: '超级管理员',
    admin: '普通管理员',
    operator: '运营操作员',
    viewer: '只读审计员'
  }
  return map[role] || '系统角色'
}

const getRoleTagType = (role: string) => {
  const map: Record<string, string> = {
    superadmin: 'danger',
    admin: 'primary',
    operator: 'success',
    viewer: 'info'
  }
  return map[role] || 'info'
}

const fetchProfile = async () => {
  loading.value = true
  try {
    const list = await adminApi.getAdminAccounts()
    const current = list.find((acc: any) => acc.username === authStore.adminName)
    if (current) {
      profileForm.value = {
        account_id: current.account_id,
        username: current.username,
        nickname: current.nickname,
        phone: current.phone,
        email: current.email,
        avatar: current.avatar || presetAvatars[0],
        role: current.role,
        remark: current.remark || '无备注',
        createTime: current.createTime ? current.createTime.replace('T', ' ').substring(0, 19) : '--',
        lastLogin: current.lastLogin ? current.lastLogin.replace('T', ' ').substring(0, 19) : '--'
      }
      originalProfile.value = { ...profileForm.value }
    } else {
      ElMessage.warning('未能找到当前用户的详细资料信息')
    }
  } catch (err) {
    console.error('Failed to load profile:', err)
    ElMessage.error('获取个人信息失败')
  } finally {
    loading.value = false
  }
}

const openAvatarDialog = () => {
  selectedTempAvatar.value = profileForm.value.avatar
  customAvatarUrl.value = presetAvatars.includes(profileForm.value.avatar) ? '' : profileForm.value.avatar
  avatarDialogVisible.value = true
}

const confirmAvatar = () => {
  let finalAvatar = selectedTempAvatar.value
  if (customAvatarUrl.value.trim()) {
    finalAvatar = customAvatarUrl.value.trim()
  }
  
  profileForm.value.avatar = finalAvatar
  avatarDialogVisible.value = false
  ElMessage.success('头像暂存成功，需点击“保存修改”以正式生效')
}

const submitSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await adminApi.updateAdminAccount(profileForm.value.account_id, {
          nickname: profileForm.value.nickname,
          phone: profileForm.value.phone,
          email: profileForm.value.email,
          avatar: profileForm.value.avatar
        })
        
        if (res) {
          ElMessage.success('个人资料保存成功')
          // Sync with global auth store
          authStore.updateAvatar(profileForm.value.avatar)
          originalProfile.value = { ...profileForm.value }
        }
      } catch (err) {
        console.error('Failed to update profile:', err)
        ElMessage.error('更新个人资料失败，请重试')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  profileForm.value = { ...originalProfile.value }
  ElMessage.info('表单数据已重置')
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-header-bar h2 {
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 2px;
}

.subtitle-text {
  font-size: 13px;
  color: #8c8c8c;
}

.premium-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
  background-color: #ffffff;
}

.premium-card :deep(.el-card__header) {
  padding: 14px 20px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  background: none !important;
}

.premium-card :deep(.el-card__body) {
  padding: 24px !important;
}

.profile-info-card {
  position: relative;
  overflow: hidden;
  text-align: center;
}

.profile-info-card :deep(.el-card__body) {
  padding: 0 24px 30px 24px !important;
}

.card-cover-header {
  height: 90px;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  margin-left: -24px;
  margin-right: -24px;
  margin-bottom: -50px;
}

.card-avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-top: 0;
  border-radius: 50%;
  padding: 4px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
}

.card-avatar-wrapper:hover {
  transform: translateY(-2px);
}

.avatar-hover-trigger {
  display: block;
}

.avatar-edit-overlay {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 11px;
}

.card-avatar-wrapper:hover .avatar-edit-overlay {
  opacity: 1;
}

.profile-meta-info {
  margin-top: 16px;
}

.profile-meta-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 6px;
}

.role-badge {
  border-radius: 12px;
  padding: 2px 10px;
  font-size: 11px;
  margin-bottom: 24px;
}

.meta-desc-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  text-align: left;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

.meta-desc-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.meta-desc-item el-icon {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}

.meta-desc-item b {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.profile-edit-form {
  max-width: 650px;
}

.disabled-field :deep(.el-input__inner), 
.disabled-field :deep(.el-textarea__inner) {
  background-color: #fafafa !important;
  color: rgba(0, 0, 0, 0.45) !important;
  cursor: not-allowed;
}

.field-tip {
  font-size: 11px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.2;
}

.form-action-item {
  margin-top: 30px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

/* Preset Avatars Selection Popup */
.preset-avatar-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  justify-items: center;
  margin-bottom: 20px;
}

.avatar-grid-item {
  position: relative;
  cursor: pointer;
  border-radius: 50%;
  padding: 3px;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.avatar-grid-item:hover {
  transform: scale(1.05);
}

.avatar-grid-item.active {
  border-color: #1890ff;
}

.active-check-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #1890ff;
  color: #ffffff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid #ffffff;
}

.custom-avatar-url-box {
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
  margin-top: 10px;
}

.url-title {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 6px;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .col-margin-bottom {
    margin-bottom: 20px;
  }
}
</style>
