<template>
  <div class="account-container">

    <!-- ── Header ───────────────────────────────────────── -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>账号管理</h2>
        <p>管理后台子账号，为每个账号分配角色与操作权限。</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <el-button type="success" icon="Setting" @click="openRoleDialog">角色管理</el-button>
        <el-button type="primary" icon="Plus" @click="openAddDialog">新增账号</el-button>
      </div>
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
        @keyup.enter="handleSearch"
      />
      <el-select v-model="filterRole" placeholder="角色筛选" clearable style="width: 140px">
        <el-option
          v-for="r in rolesList"
          :key="r.key"
          :label="r.label"
          :value="r.key"
        />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态筛选" clearable style="width: 130px">
        <el-option label="正常" value="active" />
        <el-option label="已禁用" value="disabled" />
      </el-select>
      <el-button type="primary" icon="Search" @click="handleSearch">查询</el-button>
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
            <el-radio-button v-for="r in rolesList" :key="r.key" :value="r.key">
              <el-icon v-if="r.icon"><component :is="r.icon" /></el-icon> {{ r.label }}
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

        <!-- ── 用户管理操作权限（动态展示） ── -->
        <el-form-item
          v-if="form.permissions.includes('user') || form.role === 'superadmin'"
          label="操作权限"
        >
          <el-checkbox-group v-model="form.permissions" :disabled="form.role === 'superadmin'">
            <el-checkbox value="user:query" border size="small">查询</el-checkbox>
            <el-checkbox value="user:add" border size="small">新增</el-checkbox>
            <el-checkbox value="user:edit" border size="small">修改</el-checkbox>
            <el-checkbox value="user:delete" border size="small">删除</el-checkbox>
          </el-checkbox-group>
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

    <!-- ── Role Management Dialog ────────────────────────── -->
    <el-dialog
      v-model="roleDialogVisible"
      title="角色类型配置管理"
      width="680px"
      destroy-on-close
    >
      <div class="role-dialog-content" style="padding: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <span style="font-size: 13px; color: var(--text-muted);">
            配置系统中可用的角色身份。默认角色不可删除，可新增自定义角色。
          </span>
          <el-button type="primary" size="small" icon="Plus" @click="handleOpenAddRole">新增角色</el-button>
        </div>

        <!-- Add Role Form inline card -->
        <el-card v-if="showAddRoleForm" shadow="never" style="margin-bottom: 16px; background: rgba(103,194,58,0.04); border-color: rgba(103,194,58,0.2);">
          <el-form :model="newRoleForm" :rules="roleRules" ref="newRoleFormRef" label-width="100px" size="small">
            <el-row :gutter="10">
              <el-col :span="8">
                <el-form-item label="角色标识" prop="key">
                  <el-input v-model="newRoleForm.key" placeholder="如: hr_admin" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="角色名称" prop="label">
                  <el-input v-model="newRoleForm.label" placeholder="如: 人事管理员" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="选用图标" prop="icon">
                  <el-select v-model="newRoleForm.icon" placeholder="选择图标">
                    <el-option label="星标 (StarFilled)" value="StarFilled" />
                    <el-option label="用户 (UserFilled)" value="UserFilled" />
                    <el-option label="配置 (Setting)" value="Setting" />
                    <el-option label="视角 (View)" value="View" />
                    <el-option label="趋势 (TrendCharts)" value="TrendCharts" />
                    <el-option label="公文 (Briefcase)" value="Briefcase" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
              <el-button size="small" @click="showAddRoleForm = false">取消</el-button>
              <el-button type="success" size="small" @click="submitAddRole">确认新增</el-button>
            </div>
          </el-form>
        </el-card>

        <!-- Roles Table List -->
        <el-table :data="rolesList" border stripe size="small" style="width: 100%">
          <el-table-column label="角色标识" prop="key" width="130" />
          <el-table-column label="角色名称" prop="label" min-width="140" />
          <el-table-column label="角色图标" width="90" align="center">
            <template #default="{ row }">
              <el-icon v-if="row.icon" style="font-size: 16px;"><component :is="row.icon" /></el-icon>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="类型" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.isDefault ? 'info' : 'success'" size="small" effect="light">
                {{ row.isDefault ? '系统默认' : '自定义' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="center">
            <template #default="{ $index, row }">
              <el-button
                v-if="!row.isDefault"
                size="small"
                type="danger"
                icon="Delete"
                @click="handleDeleteRole($index)"
              />
              <span v-else style="font-size: 12px; color: var(--text-muted);">系统只读</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="roleDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { adminApi, type ApiAdminAccount } from '@/api/admin'
import { useMenuStore } from '@/store/menu'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

type AdminAccount = ApiAdminAccount
type AdminRole = string

const accountsList = ref<AdminAccount[]>([])
const allAccountsList = ref<AdminAccount[]>([])
const loading = ref(false)

const menuStore = useMenuStore()

// ── Cache local helper for dynamic menus ─────────────────────────
// Fetch dynamic menu tree if not already present, utilizing cache
onMounted(async () => {
  if (menuStore.menuTree.length === 0) {
    await menuStore.fetchMenuTree()
  }
})

// ── All Dynamic permissions derived from Menu Tree ────────────────
const allPermissions = computed(() => {
  const list: { key: string; label: string }[] = []
  const traversedPaths = new Set<string>()

  const traverse = (node: any) => {
    if (node.path) {
      const pathClean = node.path.replace(/^\//, '')
      const firstSegment = pathClean.split('/')[0]
      if (firstSegment && !traversedPaths.has(firstSegment)) {
        traversedPaths.add(firstSegment)
        let label = node.title
        if (firstSegment === 'agreement') {
          label = '协议管理'
        } else if (firstSegment === 'announcement') {
          label = '公告管理'
        }
        list.push({
          key: firstSegment,
          label: label
        })
      }
    }
    if (node.children && node.children.length > 0) {
      node.children.forEach(traverse)
    }
  }

  traverse({ children: menuStore.menuTree })
  return list
})

const permLabelMap = computed(() => {
  return Object.fromEntries(allPermissions.value.map(p => [p.key, p.label]))
})

// ── Custom Dynamic Roles Configuration ──────────────────────────
interface AdminRoleItem {
  roleId: string
  key: string
  label: string
  icon: string
  isDefault?: boolean
}

const rolesList = ref<AdminRoleItem[]>([])

const fetchRoles = async () => {
  try {
    rolesList.value = await adminApi.getRoles()
  } catch (err) {
    console.error('Fetch roles failed', err)
  }
}

const ROLE_LABEL = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  rolesList.value.forEach(r => {
    map[r.key] = r.label
  })
  return map
})

const ROLE_TAG = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  rolesList.value.forEach(r => {
    if (r.key === 'superadmin') map[r.key] = 'danger'
    else if (r.key === 'admin') map[r.key] = 'warning'
    else if (r.key === 'operator') map[r.key] = ''
    else if (r.key === 'viewer') map[r.key] = 'info'
    else map[r.key] = 'success'
  })
  return map
})

const roleLabel = (role: string) => ROLE_LABEL.value[role] || role
const roleTagType = (role: string) => ROLE_TAG.value[role] || 'success'

const avatarColor = (username: string) => {
  const colors = ['#f56c6c', '#e6a23c', '#409eff', '#67c23a', '#909399', '#9b59b6', '#34495e', '#1abc9c', '#e67e22', '#2ecc71']
  let hash = 0
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

// Default permissions per role dynamically matched
const roleDefaultPerms = computed<Record<string, string[]>>(() => {
  const map: Record<string, string[]> = {}
  rolesList.value.forEach(r => {
    if (r.key === 'superadmin') {
      map[r.key] = [...allPermissions.value.map(p => p.key), 'user:query', 'user:add', 'user:edit', 'user:delete']
    } else if (r.key === 'admin') {
      const base = ['dashboard', 'user', 'content', 'comment', 'tag', 'region', 'message'].filter(k => allPermissions.value.some(p => p.key === k))
      map[r.key] = [...base, 'user:query', 'user:add', 'user:edit', 'user:delete']
    } else if (r.key === 'operator') {
      map[r.key] = ['dashboard', 'content', 'comment', 'tag'].filter(k => allPermissions.value.some(p => p.key === k))
    } else if (r.key === 'viewer') {
      map[r.key] = ['dashboard'].filter(k => allPermissions.value.some(p => p.key === k))
    } else {
      map[r.key] = ['dashboard'].filter(k => allPermissions.value.some(p => p.key === k))
    }
  })
  return map
})

// ── Role Management Dialog State ────────────────────────────────
const roleDialogVisible = ref(false)
const showAddRoleForm = ref(false)
const newRoleForm = ref({
  key: '',
  label: '',
  icon: 'UserFilled'
})
const newRoleFormRef = ref<any>(null)

const roleRules = {
  key: [
    { required: true, message: '请输入角色标识名', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '标识仅能包含小写英文和下划线', trigger: 'blur' },
    { validator: (_rule: any, value: any, callback: any) => {
        if (rolesList.value.some(r => r.key === value)) {
          callback(new Error('角色标识已存在'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  label: [{ required: true, message: '请输入角色显示名称', trigger: 'blur' }]
}

const openRoleDialog = async () => {
  await fetchRoles()
  roleDialogVisible.value = true
  showAddRoleForm.value = false
}

const handleOpenAddRole = () => {
  const customRoleCount = rolesList.value.filter(r => !r.isDefault).length
  if (customRoleCount >= 3) {
    ElMessage.warning('最多只能新增 3 个自定义角色！')
    return
  }
  showAddRoleForm.value = true
  newRoleForm.value = {
    key: '',
    label: '',
    icon: 'UserFilled'
  }
}

const submitAddRole = () => {
  const customRoleCount = rolesList.value.filter(r => !r.isDefault).length
  if (customRoleCount >= 3) {
    ElMessage.warning('最多只能新增 3 个自定义角色！')
    return
  }
  newRoleFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        await adminApi.addRole({
          roleKey: newRoleForm.value.key,
          label: newRoleForm.value.label,
          icon: newRoleForm.value.icon,
          permissions: [],
          sort: rolesList.value.length + 1,
          status: 'enabled',
          remark: ''
        })
        ElMessage.success('角色创建成功')
        await fetchRoles()
        showAddRoleForm.value = false
      } catch (err: any) {
        ElMessage.error(err.message || '新增角色失败')
      }
    }
  })
}

const handleDeleteRole = (index: number) => {
  const role = rolesList.value[index]
  if (role.isDefault) return
  
  ElMessageBox.confirm(
    `确定要删除自定义角色 "<b>${role.label}</b>" 吗？`,
    '确认删除',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning', dangerouslyUseHTMLString: true }
  ).then(async () => {
    try {
      await adminApi.deleteRole(role.roleId)
      ElMessage.success('角色已成功删除')
      await fetchRoles()
    } catch (err: any) {
      ElMessage.error(err.message || '删除角色失败')
    }
  }).catch(() => {})
}

// ── Fetch Account Actions ───────────────────────────────────────
const fetchAccounts = async () => {
  loading.value = true
  try {
    accountsList.value = await adminApi.getAdminAccounts({
      keyword: searchKw.value || undefined,
      role: filterRole.value || undefined,
      status: filterStatus.value || undefined
    })
  } catch (err) {
    console.error('Fetch accounts failed', err)
  } finally {
    loading.value = false
  }
}

const fetchAllAccounts = async () => {
  try {
    allAccountsList.value = await adminApi.getAdminAccounts()
  } catch (err) {
    console.error('Fetch all accounts failed', err)
  }
}

onMounted(async () => {
  await fetchRoles()
  fetchAccounts()
  fetchAllAccounts()
})

// ── Filters & Card Stats ─────────────────────────────────────────
const searchKw = ref('')
const filterRole = ref('')
const filterStatus = ref('')

const filteredAccounts = computed(() => accountsList.value)

const resetFilters = () => {
  searchKw.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  fetchAccounts()
}

const handleSearch = () => {
  fetchAccounts()
}

const roleStats = computed(() => {
  const all = allAccountsList.value
  return rolesList.value.map(r => ({
    key: r.key,
    label: r.label,
    icon: r.icon,
    count: all.filter(a => a.role === r.key).length
  }))
})

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
  permissions: (roleDefaultPerms.value && roleDefaultPerms.value['admin']) ? [...roleDefaultPerms.value['admin']] : [],
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
  form.permissions = roleDefaultPerms.value[role] ? [...roleDefaultPerms.value[role]] : []
}

// ── Select-all logic ──────────────────────────────────────
const allPermKeys = computed(() => allPermissions.value.map(p => p.key))
const isAllSelected = computed(() => allPermKeys.value.every(k => form.permissions.includes(k)))
const isIndeterminate = computed(() => {
  const hasSome = allPermKeys.value.some(k => form.permissions.includes(k))
  return hasSome && !isAllSelected.value
})
const handleSelectAll = (val: boolean) => {
  if (val) {
    form.permissions = [...allPermKeys.value, 'user:query', 'user:add', 'user:edit', 'user:delete']
  } else {
    form.permissions = []
  }
}

// ── Watcher: Clean up User sub-permissions if User Management module is unchecked ──
let lastHadUser = false

// ── Watcher: Clean up User sub-permissions if User Management module is unchecked ──
watch(() => form.permissions, (newVal) => {
  const hasUser = newVal.includes('user')
  
  if (hasUser && !lastHadUser) {
    const hasAnySub = newVal.some(p => p.startsWith('user:'))
    if (!hasAnySub) {
      if (form.role === 'superadmin' || form.role === 'admin') {
        form.permissions = [...newVal, 'user:query', 'user:add', 'user:edit', 'user:delete']
      } else {
        form.permissions = [...newVal, 'user:query']
      }
    }
  } else if (!hasUser && lastHadUser) {
    const hasSubPerms = newVal.some(p => p.startsWith('user:'))
    if (hasSubPerms) {
      form.permissions = newVal.filter(p => !p.startsWith('user:'))
    }
  }
  
  lastHadUser = hasUser
}, { deep: true })

const openAddDialog = () => {
  isEdit.value = false
  Object.assign(form, blankForm())
  lastHadUser = form.permissions.includes('user')
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
  lastHadUser = form.permissions.includes('user')
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    const perms = form.role === 'superadmin' ? allPermissions.value.map(p => p.key) : [...form.permissions]
    if (isEdit.value) {
      await adminApi.updateAdminAccount(editingId.value, {
        nickname: form.nickname,
        email: form.email,
        phone: form.phone,
        role: form.role as any,
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
        role: form.role as any,
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
    fetchAllAccounts()
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
    fetchAllAccounts()
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
  border-left: 4px solid #67c23a;
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
  background: rgba(103,194,58,0.12);
}

.role-superadmin .role-icon-wrap { background: rgba(245,108,108,0.12); }
.role-admin      .role-icon-wrap { background: rgba(230,162,60,0.12); }
.role-operator   .role-icon-wrap { background: rgba(64,158,255,0.12); }
.role-viewer     .role-icon-wrap { background: rgba(144,147,153,0.12); }

.role-big-icon { font-size: 24px; color: #67c23a; }

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
