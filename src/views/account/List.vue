<template>
  <div class="account-container">

    <!-- ── Header ───────────────────────────────────────── -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>账号管理</h2>
        <p>管理后台子账号，为每个账号分配角色与操作权限。</p>
      </div>
      <el-button type="primary" icon="Plus" @click="openAddDialog">新增账号</el-button>
    </div>

    <!-- ── Role Stats Cards ───────────────────────────── -->
    <div class="role-stats-grid">
      <div
        v-for="r in roleStats"
        :key="r.key"
        class="role-stat-card premium-card"
        :class="'role-' + r.key"
      >
        <div class="role-icon-wrap">
          <el-icon class="role-big-icon"><component :is="r.icon" /></el-icon>
        </div>
        <div class="role-info">
          <div class="role-count">{{ r.count }}</div>
          <div class="role-label">{{ r.label }}</div>
        </div>
      </div>
    </div>

    <!-- ── Filter Bar ────────────────────────────────── -->
    <div class="filter-bar premium-card">
      <el-input
        v-model="searchKw"
        placeholder="搜索账号/昵称/邮箱"
        prefix-icon="Search"
        clearable
        style="width: 240px"
      />
      <el-select v-model="filterRole" placeholder="角色筛选" clearable style="width: 140px">
        <el-option label="超级管理员" value="superadmin" />
        <el-option label="管理员" value="admin" />
        <el-option label="运营员" value="operator" />
        <el-option label="观察员" value="viewer" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 130px">
        <el-option label="正常" value="active" />
        <el-option label="已禁用" value="disabled" />
      </el-select>
      <el-button @click="resetFilters" icon="RefreshLeft">重置</el-button>
    </div>

    <!-- ── Table ─────────────────────────────────────── -->
    <div class="table-card premium-card">
      <el-table :data="filteredAccounts" stripe style="width: 100%">

        <!-- 本地字母头像，无网络请求 -->
        <el-table-column width="60" align="center">
          <template #default="{ row }">
            <div class="letter-avatar" :style="{ background: avatarColor(row.username) }">
              {{ row.nickname.charAt(0) }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="用户名 / 昵称" min-width="160">
          <template #default="{ row }">
            <div class="username-cell">
              <span class="username">{{ row.username }}</span>
              <span class="nickname">{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="roleTagType(row.role)" effect="light" round>
              {{ roleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="权限模块" min-width="260">
          <template #default="{ row }">
            <div class="perm-tags-wrap">
              <el-tag
                v-for="p in row.permissions.slice(0, 5)"
                :key="p"
                size="small"
                type="info"
                effect="plain"
                class="perm-tag"
              >
                {{ permLabelMap[p] || p }}
              </el-tag>
              <el-tag v-if="row.permissions.length > 5" size="small" type="info" effect="plain">
                +{{ row.permissions.length - 5 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'" effect="light" round>
              {{ row.status === 'active' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="邮箱" min-width="180" prop="email" />
        <el-table-column label="最后登录" width="160" prop="lastLogin" />

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" icon="Edit" @click="openEditDialog(row)">编辑</el-button>
            <el-button size="small" icon="Key" @click="handleResetPwd(row)">重置密码</el-button>
            <el-popconfirm
              title="确认删除该账号？"
              confirm-button-type="danger"
              @confirm="handleDelete(row.account_id)"
            >
              <template #reference>
                <el-button
                  size="small"
                  type="danger"
                  icon="Delete"
                  :disabled="row.role === 'superadmin'"
                />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <!-- ── Add / Edit Dialog ─────────────────────────── -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑账号' : '新增账号'"
      width="620px"
      destroy-on-close
    >
      <el-form :model="form" :rules="formRules" ref="formRef" label-width="90px">

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="英文、数字、下划线" :disabled="isEdit" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="显示名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20" v-if="!isEdit">
          <el-col :span="12">
            <el-form-item label="初始密码" prop="password">
              <el-input v-model="form.password" type="password" show-password placeholder="默认 123456" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="form.confirmPassword" type="password" show-password placeholder="默认 123456" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="邮箱地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="11位手机号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="角色" prop="role">
          <el-radio-group v-model="form.role" @change="onRoleChange">
            <el-radio-button value="superadmin">
              <el-icon><StarFilled /></el-icon> 超级管理员
            </el-radio-button>
            <el-radio-button value="admin">
              <el-icon><UserFilled /></el-icon> 管理员
            </el-radio-button>
            <el-radio-button value="operator">
              <el-icon><Setting /></el-icon> 运营员
            </el-radio-button>
            <el-radio-button value="viewer">
              <el-icon><View /></el-icon> 观察员
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <!-- Permission Checkboxes -->
        <el-form-item label="权限模块" prop="permissions">
          <!-- 全选控制行 -->
          <div class="perm-select-all-bar">
            <el-checkbox
              v-model="isAllSelected"
              :indeterminate="isIndeterminate"
              :disabled="form.role === 'superadmin'"
              @change="handleSelectAll"
            >
              {{ isAllSelected ? '取消全选' : '一键全选' }}
            </el-checkbox>
            <span class="perm-select-count">已选 {{ form.permissions.length }} / {{ allPermissions.length }} 项</span>
          </div>
          <el-checkbox-group
            v-model="form.permissions"
            :disabled="form.role === 'superadmin'"
            class="permission-grid"
          >
            <el-checkbox
              v-for="p in allPermissions"
              :key="p.key"
              :value="p.key"
              border
              size="small"
            >
              {{ p.label }}
            </el-checkbox>
          </el-checkbox-group>
          <div class="perm-tip" v-if="form.role === 'superadmin'">
            超级管理员自动拥有全部权限
          </div>
        </el-form-item>

        <el-form-item label="状态">
          <el-switch v-model="form.statusActive" active-text="正常" inactive-text="禁用" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">
          {{ isEdit ? '保存修改' : '创建账号' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { adminApi, type ApiAdminAccount } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

type AdminAccount = ApiAdminAccount
type AdminRole = 'superadmin' | 'admin' | 'operator' | 'viewer'

const accountsList = ref<AdminAccount[]>([])
const loading = ref(false)

const fetchAccounts = async () => {
  loading.value = true
  try {
    accountsList.value = await adminApi.getAdminAccounts()
  } catch (err) {
    console.error('Fetch accounts failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAccounts()
})

// ── All permission modules ───────────────────────────────────────
const allPermissions = [
  { key: 'dashboard', label: '数据看板' },
  { key: 'user', label: '用户管理' },
  { key: 'content', label: '内容管理' },
  { key: 'comment', label: '评论管理' },
  { key: 'tag', label: '标签管理' },
  { key: 'region', label: '地区管理' },
  { key: 'dict', label: '字典管理' },
  { key: 'message', label: '系统消息' },
  { key: 'agreement', label: '协议管理' },
  { key: 'account', label: '账号管理' },
]

// Pre-built Map for O(1) lookup — avoids Array.find() on every cell render
const permLabelMap: Record<string, string> = Object.fromEntries(
  allPermissions.map(p => [p.key, p.label])
)

// Default permissions per role
const roleDefaultPerms: Record<AdminRole, string[]> = {
  superadmin: allPermissions.map(p => p.key),
  admin: ['dashboard', 'user', 'content', 'comment', 'tag', 'region', 'message'],
  operator: ['dashboard', 'content', 'comment', 'tag'],
  viewer: ['dashboard'],
}

// ── Letter-avatar color (deterministic, no network request) ──────
const AVATAR_COLORS = [
  '#5b6af0', '#f0855b', '#52c41a', '#faad14',
  '#13c2c2', '#722ed1', '#eb2f96', '#fa541c',
]
const avatarColor = (username: string) => {
  let hash = 0
  for (let i = 0; i < username.length; i++) hash = username.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ── Filters ──────────────────────────────────────────────────────
const searchKw = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const filteredAccounts = computed(() => {
  const kw = searchKw.value.toLowerCase()
  const role = filterRole.value
  const status = filterStatus.value
  return accountsList.value.filter(a => {
    const matchKw = !kw || a.username.includes(kw) || a.nickname.includes(kw) || a.email.includes(kw)
    const matchRole = !role || a.role === role
    const matchStatus = !status || a.status === status
    return matchKw && matchRole && matchStatus
  })
})

const resetFilters = () => {
  searchKw.value = ''
  filterRole.value = ''
  filterStatus.value = ''
}

// ── Role stats cards (use reactive ref directly) ──────────────────
const roleStats = computed(() => {
  const all = accountsList.value
  return [
    { key: 'superadmin', label: '超级管理员', icon: 'StarFilled', count: all.filter(a => a.role === 'superadmin').length },
    { key: 'admin',      label: '管理员',     icon: 'UserFilled', count: all.filter(a => a.role === 'admin').length },
    { key: 'operator',   label: '运营员',     icon: 'Setting',    count: all.filter(a => a.role === 'operator').length },
    { key: 'viewer',     label: '观察员',     icon: 'View',       count: all.filter(a => a.role === 'viewer').length },
  ]
})

// ── Helpers ──────────────────────────────────────────────────────
const ROLE_LABEL: Record<AdminRole, string> = { superadmin: '超级管理员', admin: '管理员', operator: '运营员', viewer: '观察员' }
const ROLE_TAG:   Record<AdminRole, string> = { superadmin: 'danger', admin: 'warning', operator: '', viewer: 'info' }
const roleLabel   = (role: AdminRole) => ROLE_LABEL[role]
const roleTagType = (role: AdminRole) => ROLE_TAG[role]

// ── Dialog state ─────────────────────────────────────────────────
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitLoading = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref('')

const blankForm = () => ({
  username: '',
  nickname: '',
  password: '123456',
  confirmPassword: '123456',
  email: '',
  phone: '',
  role: 'admin' as AdminRole,
  permissions: [...roleDefaultPerms['admin']],
  statusActive: true,
  remark: '',
})
const form = reactive(blankForm())

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]{3,20}$/, message: '只能包含英文、数字、下划线，3-20位', trigger: 'blur' }
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入初始密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value !== form.password) callback(new Error('两次密码不一致'))
        else callback()
      }, trigger: 'blur'
    }
  ],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }],
  permissions: [{ required: true, type: 'array', min: 1, message: '请至少选择一个权限模块', trigger: 'change' }],
}

const onRoleChange = (role: AdminRole) => {
  form.permissions = [...roleDefaultPerms[role]]
}

// ── Select-all logic ──────────────────────────────────────
const allPermKeys = allPermissions.map(p => p.key)
const isAllSelected = computed(() => form.permissions.length === allPermKeys.length)
const isIndeterminate = computed(() => form.permissions.length > 0 && form.permissions.length < allPermKeys.length)
const handleSelectAll = (val: boolean) => {
  form.permissions = val ? [...allPermKeys] : []
}

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, blankForm())
  dialogVisible.value = true
}

const openEditDialog = (row: AdminAccount) => {
  isEdit.value = true
  editingId.value = row.account_id
  Object.assign(form, {
    username: row.username,
    nickname: row.nickname,
    password: '',
    confirmPassword: '',
    email: row.email,
    phone: row.phone,
    role: row.role,
    permissions: [...row.permissions],
    statusActive: row.status === 'active',
    remark: row.remark,
  })
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const perms = form.role === 'superadmin' ? allPermissions.map(p => p.key) : [...form.permissions]
    if (isEdit.value) {
      await adminApi.updateAdminAccount(editingId.value, {
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        role: form.role,
        permissions: perms,
        status: form.statusActive ? 'active' : 'disabled',
        remark: form.remark,
      })
      ElMessage.success('账号信息已更新')
    } else {
      await adminApi.addAdminAccount({
        username: form.username,
        nickname: form.nickname,
        avatar: '',
        role: form.role,
        permissions: perms,
        status: form.statusActive ? 'active' : 'disabled',
        email: form.email,
        phone: form.phone,
        remark: form.remark,
      })
      ElMessage.success('账号创建成功')
    }
    dialogVisible.value = false
    fetchAccounts()
  } catch (err) {
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = async (id: string) => {
  try {
    await adminApi.deleteAdminAccount(id)
    ElMessage.success('账号已删除')
    fetchAccounts()
  } catch (err) {
    console.error(err)
  }
}

const handleResetPwd = (row: AdminAccount) => {
  ElMessageBox.confirm(
    `确定要重置账号「${row.nickname}」的密码吗？重置后密码将变为 <b>123456</b>`,
    '重置密码',
    { confirmButtonText: '确认重置', cancelButtonText: '取消', type: 'warning', dangerouslyUseHTMLString: true }
  ).then(async () => {
    try {
      await adminApi.resetAdminPassword(row.account_id)
      ElMessage.success(`已重置「${row.nickname}」的密码为 123456`)
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}
</script>

<style scoped>
.account-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 3px;
}

.header-left p {
  font-size: 13px;
  color: var(--text-muted);
}

/* ── Letter Avatar ── */
.letter-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin: 0 auto;
  flex-shrink: 0;
  user-select: none;
}

/* ── Role stat cards ── */
.role-stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.role-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-left: 4px solid transparent;
  transition: transform 0.2s;
}

.role-stat-card:hover { transform: translateY(-2px); }

.role-superadmin { border-left-color: #f56c6c; }
.role-admin      { border-left-color: #e6a23c; }
.role-operator   { border-left-color: #409eff; }
.role-viewer     { border-left-color: #909399; }

.role-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-superadmin .role-icon-wrap { background: rgba(245,108,108,0.12); }
.role-admin      .role-icon-wrap { background: rgba(230,162,60,0.12); }
.role-operator   .role-icon-wrap { background: rgba(64,158,255,0.12); }
.role-viewer     .role-icon-wrap { background: rgba(144,147,153,0.12); }

.role-big-icon { font-size: 24px; }

.role-superadmin .role-big-icon { color: #f56c6c; }
.role-admin      .role-big-icon { color: #e6a23c; }
.role-operator   .role-big-icon { color: #409eff; }
.role-viewer     .role-big-icon { color: #909399; }

.role-count {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-main);
  line-height: 1;
}

.role-label {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* ── Filter bar ── */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  flex-wrap: wrap;
}

/* ── Table card ── */
.table-card {
  padding: 0;
  overflow: hidden;
}

.username-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-main);
}

.nickname {
  font-size: 12px;
  color: var(--text-muted);
}

.perm-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.perm-tag { cursor: default; }

/* ── Dialog permission grid ── */
.perm-select-all-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  padding: 6px 10px;
  background: #f8fafc;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  width: 100%;
}

.perm-select-count {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}

.permission-grid {
  display: grid !important;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  width: 100%;
}

.perm-tip {
  margin-top: 8px;
  font-size: 12px;
  color: #f56c6c;
}
</style>
