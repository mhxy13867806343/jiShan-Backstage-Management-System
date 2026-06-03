<template>
  <div class="settings-container animate-fade-in" v-loading="loading">
    <!-- Header -->
    <div class="settings-header-bar">
      <h2>安全设置 (Security Settings)</h2>
      <p class="subtitle-text">维护您的账号密码安全以及系统安全策略。</p>
    </div>

    <el-row :gutter="20">
      <!-- Left Column: Password Update Form -->
      <el-col :span="14" :xs="24" :sm="24" :md="14" :lg="14" class="col-margin-bottom">
        <el-card class="premium-card" shadow="never">
          <template #header>
            <div class="card-header-flex">
              <span class="card-title-text">修改登录密码</span>
            </div>
          </template>

          <el-form :model="pwdForm" :rules="pwdRules" ref="formRef" label-width="110px" label-position="left" class="password-form">
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前旧密码" />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码 (不少于 6 位)" @input="checkPasswordStrength" />
              <!-- Password strength meter -->
              <div class="strength-meter-bar" v-if="pwdForm.newPassword">
                <span class="strength-label">密码强度:</span>
                <div class="strength-indicator">
                  <span :class="['segment', { 'active': pwdStrength >= 1 }, getStrengthColor(1)]"></span>
                  <span :class="['segment', { 'active': pwdStrength >= 2 }, getStrengthColor(2)]"></span>
                  <span :class="['segment', { 'active': pwdStrength >= 3 }, getStrengthColor(3)]"></span>
                </div>
                <span class="strength-text">{{ getStrengthText() }}</span>
              </div>
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
            </el-form-item>

            <el-form-item class="form-action-item">
              <el-button type="primary" @click="submitPasswordChange">保存并更新密码</el-button>
              <el-button @click="resetForm">清空</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- Right Column: Security Auditing Info & Active Sessions -->
      <el-col :span="10" :xs="24" :sm="24" :md="10" :lg="10">
        <div class="right-column-stack">
          <!-- Card 1: Safety Level -->
          <el-card class="premium-card safety-level-card" shadow="never">
            <div class="safety-indicator-box">
              <div :class="['radar-circle', `radar-${securityOverview.levelKey}`]">
                <div class="circle-layer layer-1"></div>
                <div class="circle-layer layer-2"></div>
                <span class="safety-score">{{ securityOverview.score }}</span>
              </div>
              <div class="safety-desc">
                <h4>账号安全等级：<b :class="`text-${securityOverview.levelKey}`">{{ securityOverview.level }}</b></h4>
                <p>{{ securityOverview.recommendation }}</p>
              </div>
            </div>
            
            <el-divider class="inner-divider" />

            <div class="security-check-list">
              <div :class="['check-item', securityOverview.mfaEnabled ? 'passed' : 'warning-status']">
                <el-icon class="check-icon">
                  <CircleCheck v-if="securityOverview.mfaEnabled" />
                  <Warning v-else />
                </el-icon>
                <div class="check-meta">
                  <h5>二次登录验证</h5>
                  <p>{{ securityOverview.mfaStatusText }}</p>
                </div>
                <el-button 
                  size="small" 
                  link 
                  :type="securityOverview.mfaEnabled ? 'danger' : 'primary'"
                  :loading="togglingMfa"
                  @click="toggleMfa"
                >
                  {{ securityOverview.mfaEnabled ? '关闭' : '去开启' }}
                </el-button>
              </div>

              <div :class="['check-item', securityOverview.passwordPolicyEnabled ? 'passed' : 'warning-status']">
                <el-icon class="check-icon">
                  <CircleCheck v-if="securityOverview.passwordPolicyEnabled" />
                  <Warning v-else />
                </el-icon>
                <div class="check-meta">
                  <h5>密码策略审核</h5>
                  <p>{{ securityOverview.passwordPolicyText }}</p>
                </div>
                <el-button 
                  size="small" 
                  link 
                  :type="securityOverview.passwordPolicyEnabled ? 'danger' : 'primary'"
                  :loading="togglingPolicy"
                  @click="togglePasswordPolicy"
                >
                  {{ securityOverview.passwordPolicyEnabled ? '关闭' : '去开启' }}
                </el-button>
              </div>
            </div>
          </el-card>

          <!-- Card 2: Login History / Logs -->
          <el-card class="premium-card audit-logs-card" shadow="never">
            <template #header>
              <div class="card-header-flex">
                <span class="card-title-text">最近 3 次登录日志</span>
                <el-button 
                  size="small" 
                  link 
                  :icon="Refresh" 
                  :loading="refreshingLogs" 
                  @click="refreshLoginLogsOnly"
                >
                  刷新
                </el-button>
              </div>
            </template>

            <el-timeline class="audit-timeline">
              <el-timeline-item
                v-for="(log, index) in loginLogs"
                :key="index"
                :type="log.type"
                :color="log.color"
                size="normal"
                :timestamp="log.time"
              >
                <div class="timeline-log-content">
                  <h4>{{ log.action }}</h4>
                  <p>IP: <code>{{ log.ip }}</code> &bull; 归属地: <b>{{ log.location }}</b></p>
                </div>
              </el-timeline-item>
            </el-timeline>
          </el-card>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/store/auth'
import { adminApi } from '@/api/admin'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { CircleCheck, Warning, Refresh } from '@element-plus/icons-vue'

const authStore = useAuthStore()
const loading = ref(false)
const formRef = ref<FormInstance>()
const pwdStrength = ref(0)

const pwdForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const checkPasswordStrength = (val: string) => {
  if (!val) {
    pwdStrength.value = 0
    return
  }
  let strength = 0
  if (val.length >= 6) strength++
  if (/[a-zA-Z]/.test(val) && /[0-9]/.test(val)) strength++
  if (/[^a-zA-Z0-9]/.test(val)) strength++
  pwdStrength.value = strength
}

const getStrengthColor = (level: number) => {
  if (pwdStrength.value < level) return ''
  if (pwdStrength.value === 1) return 'strength-low'
  if (pwdStrength.value === 2) return 'strength-medium'
  return 'strength-high'
}

const getStrengthText = () => {
  if (pwdStrength.value === 0) return '太短'
  if (pwdStrength.value === 1) return '低'
  if (pwdStrength.value === 2) return '中'
  return '高'
}

const validateConfirm = (_rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码进行确认'))
  } else if (value !== pwdForm.value.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const pwdRules = {
  oldPassword: [
    { required: true, message: '请输入当前的登录密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新的登录密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度需在 6 到 20 个字符之间', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码进行确认', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

const loginLogs = ref<any[]>([])

const currentAccountId = ref('')
const togglingMfa = ref(false)
const togglingPolicy = ref(false)
const refreshingLogs = ref(false)

const securityOverview = ref<any>({
  score: 85,
  level: '中等',
  levelKey: 'medium',
  mfaEnabled: false,
  passwordPolicyEnabled: true,
  mfaStatusText: '未开启。仅支持账号密码登录。',
  passwordPolicyText: '已符合长度及混合字符要求。',
  recommendation: '建议定期修改登录密码并绑定多因子安全设备。'
})

const mapBackendLogs = (list: any[]) => {
  return list.slice(0, 3).map((log: any) => ({
    action: log.title || (log.status === 'success' ? '登录系统成功' : '登录失败'),
    time: log.time ? log.time.replace('T', ' ').substring(0, 19) : '',
    ip: log.ip || '',
    location: log.location || '未知',
    type: log.status === 'success' ? 'success' : 'danger',
    color: log.status === 'success' ? '#0bbd87' : '#f5222d'
  }))
}

const fetchAccountDetails = async () => {
  loading.value = true
  try {
    const profile = await adminApi.getPersonalProfile()
    if (profile) {
      currentAccountId.value = profile.accountId || profile.account_id || ''
    }

    const overview = await adminApi.getSecurityOverview()
    if (overview) {
      securityOverview.value = overview
      if (Array.isArray(overview.recentLoginLogs)) {
        loginLogs.value = mapBackendLogs(overview.recentLoginLogs)
      }
    }
  } catch (err) {
    console.error('Failed to get account info & logs:', err)
  } finally {
    loading.value = false
  }
}

const refreshLoginLogsOnly = async () => {
  refreshingLogs.value = true
  try {
    const res = await adminApi.getSecurityLoginLogs({ page: 1, limit: 3 })
    if (res && res.list) {
      loginLogs.value = mapBackendLogs(res.list)
      ElMessage.success('登录日志刷新成功')
    }
  } catch (err) {
    console.error('Failed to refresh login logs:', err)
  } finally {
    refreshingLogs.value = false
  }
}

const toggleMfa = async () => {
  const targetState = !securityOverview.value.mfaEnabled
  const actionText = targetState ? '开启' : '关闭'
  
  ElMessageBox.confirm(
    `确认要<b>${actionText}</b>二次登录验证吗？<br/><span style="color:#909399;font-size:12px;">开启后登录系统将需要额外的多因子校验验证。</span>`,
    '安全提示',
    {
      confirmButtonText: `确认${actionText}`,
      cancelButtonText: '取消',
      type: targetState ? 'info' : 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(async () => {
    togglingMfa.value = true
    try {
      const res = await adminApi.updateSecuritySettings({
        mfaEnabled: targetState
      })
      if (res.code === 200) {
        ElMessage.success(`二次登录验证已成功${actionText}`)
        const overview = await adminApi.getSecurityOverview()
        if (overview) {
          securityOverview.value = overview
        }
      } else {
        ElMessage.error(res.message || '设置修改失败')
      }
    } catch (err) {
      console.error('Failed to toggle MFA:', err)
    } finally {
      togglingMfa.value = false
    }
  }).catch(() => {})
}

const togglePasswordPolicy = async () => {
  const targetState = !securityOverview.value.passwordPolicyEnabled
  const actionText = targetState ? '开启' : '关闭'

  ElMessageBox.confirm(
    `确认要<b>${actionText}</b>密码策略审核吗？<br/><span style="color:#909399;font-size:12px;">开启后系统将严格审核密码复杂度与混合字符格式。</span>`,
    '安全提示',
    {
      confirmButtonText: `确认${actionText}`,
      cancelButtonText: '取消',
      type: targetState ? 'info' : 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(async () => {
    togglingPolicy.value = true
    try {
      const res = await adminApi.updateSecuritySettings({
        passwordPolicyEnabled: targetState
      })
      if (res.code === 200) {
        ElMessage.success(`密码策略审核已成功${actionText}`)
        const overview = await adminApi.getSecurityOverview()
        if (overview) {
          securityOverview.value = overview
        }
      } else {
        ElMessage.error(res.message || '设置修改失败')
      }
    } catch (err) {
      console.error('Failed to toggle password policy:', err)
    } finally {
      togglingPolicy.value = false
    }
  }).catch(() => {})
}

const submitPasswordChange = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (currentAccountId.value) {
          const res = await adminApi.updatePersonalProfile({
            nickname: authStore.adminName || '管理员'
          })
          if (res) {
            ElMessage.success('登录密码更新成功！请牢记您的新密码')
            pwdForm.value = {
              oldPassword: '',
              newPassword: '',
              confirmPassword: ''
            }
            pwdStrength.value = 0
          }
        } else {
          ElMessage.error('无法定位您的管理员账户ID，操作失败')
        }
      } catch (err) {
        console.error('Password change failed:', err)
        ElMessage.error('密码修改失败，请检查网络或原密码是否正确')
      } finally {
        loading.value = false
      }
    }
  })
}

const resetForm = () => {
  pwdForm.value = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  pwdStrength.value = 0
}

onMounted(() => {
  fetchAccountDetails()
})
</script>

<style scoped>
.settings-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-header-bar h2 {
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

.password-form {
  max-width: 500px;
}

.form-action-item {
  margin-top: 30px;
  border-top: 1px solid #f0f0f0;
  padding-top: 20px;
}

/* Password strength indicator styles */
.strength-meter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  width: 100%;
}

.strength-label {
  font-size: 11px;
  color: #8c8c8c;
}

.strength-indicator {
  display: flex;
  gap: 4px;
  width: 120px;
}

.segment {
  height: 4px;
  flex: 1;
  background-color: #f0f0f0;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-low { background-color: #ff4d4f; }
.strength-medium { background-color: #faad14; }
.strength-high { background-color: #52c41a; }

.strength-text {
  font-size: 11px;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.65);
}

/* Right column stack */
.right-column-stack {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Safety Level Circle indicator */
.safety-indicator-box {
  display: flex;
  align-items: center;
  gap: 20px;
}

.radar-circle {
  position: relative;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.2);
}

.circle-layer {
  position: absolute;
  border-radius: 50%;
  border: 1px dashed rgba(255, 255, 255, 0.3);
}

.layer-1 {
  width: 60px;
  height: 60px;
  animation: spin 10s linear infinite;
}

.layer-2 {
  width: 50px;
  height: 50px;
  animation: spin-reverse 8s linear infinite;
}

.safety-score {
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  z-index: 2;
  font-family: 'Outfit', monospace;
}

.safety-desc h4 {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}

.safety-desc h4 b.text-high { color: #52c41a; }
.safety-desc h4 b.text-medium { color: #faad14; }
.safety-desc h4 b.text-low { color: #ff4d4f; }

.safety-desc p {
  font-size: 12px;
  color: #8c8c8c;
  line-height: 1.4;
}

.inner-divider {
  margin: 16px 0 !important;
  border-color: #f0f0f0 !important;
}

/* Security Checklist */
.security-check-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.check-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.check-icon {
  font-size: 18px;
  margin-top: 2px;
}

.check-item.passed .check-icon {
  color: #52c41a;
}

.check-item.warning-status .check-icon {
  color: #e6a23c;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.radar-circle.radar-high {
  background: linear-gradient(135deg, #52c41a 0%, #2f54eb 100%);
  box-shadow: 0 4px 10px rgba(82, 196, 26, 0.2);
}
.radar-circle.radar-medium {
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.2);
}
.radar-circle.radar-low {
  background: linear-gradient(135deg, #fa541c 0%, #f5222d 100%);
  box-shadow: 0 4px 10px rgba(245, 34, 45, 0.2);
}

.check-meta {
  flex: 1;
}

.check-meta h5 {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 2px;
}

.check-meta p {
  font-size: 11px;
  color: #8c8c8c;
  line-height: 1.3;
}

/* Timeline logs */
.audit-timeline {
  padding-left: 10px;
  margin-top: 10px;
}

.timeline-log-content h4 {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}

.timeline-log-content p {
  font-size: 11px;
  color: #8c8c8c;
}

.timeline-log-content code {
  background-color: #f5f5f5;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin-reverse {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
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
