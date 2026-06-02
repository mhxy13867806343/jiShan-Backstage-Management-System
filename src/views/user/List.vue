<template>
  <div class="user-list-container">
    <!-- Search Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.user_id" placeholder="精确匹配用户ID" clearable />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.nickname" placeholder="模糊搜索昵称" clearable />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="searchForm.phone" placeholder="模糊搜索手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="已禁用" value="banned" />
          </el-select>
        </el-form-item>
        <el-form-item v-permission="'user:query'">
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table Card -->
    <div class="table-card premium-card">

      <!-- Toolbar -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button v-permission="'user:edit'" v-role="['superadmin', 'admin']" type="danger" plain icon="Lock" :disabled="selectedIds.length === 0" @click="handleBatchBan">
            批量禁用 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
          </el-button>
          <el-button v-permission="'user:edit'" v-role="['superadmin', 'admin']" type="success" plain icon="Unlock" :disabled="selectedIds.length === 0" @click="handleBatchUnban">
            批量解禁 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
          </el-button>
        </div>
        <div class="toolbar-right">
          <!-- Import -->
          <el-upload
            v-permission="'user:add'"
            v-role="['superadmin', 'admin']"
            :show-file-list="false"
            accept=".json,.xlsx,.xls"
            :before-upload="handleImport"
          >
            <el-button icon="Upload">导入用户</el-button>
          </el-upload>
          <!-- Export -->
          <el-button v-permission="'user:query'" icon="Download" @click="handleExport">导出用户</el-button>
        </div>
      </div>

      <!-- Batch Action Bar -->
      <div class="batch-action-bar" v-if="selectedIds.length > 0">
        <el-icon><InfoFilled /></el-icon>
        <span>已选 <b>{{ selectedIds.length }}</b> 位用户（支持跨页保留选择）</span>
        <el-button size="small" @click="selectedIds = []">清除选择</el-button>
      </div>

      <el-table :data="tableData" style="width: 100%">
        <!-- Cross-page checkbox column -->
        <el-table-column width="50" align="center">
          <template #header>
            <el-checkbox
              :model-value="isCurrentPageAllSelected"
              :indeterminate="isCurrentPageIndeterminate"
              @change="handleSelectCurrentPage"
            />
          </template>
          <template #default="{ row }">
            <el-checkbox
              :model-value="selectedIds.includes(row.user_id)"
              @change="(val: boolean) => toggleSelect(row.user_id, val)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="user_id" label="用户ID" width="110" align="center" />

        <el-table-column label="用户资料" min-width="180">
          <template #default="{ row }">
            <div class="user-profile-cell">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="user-info-text">
                <span 
                  :class="{ 'user-nickname': true, 'user-nickname-link': hasContentRoute }" 
                  :title="hasContentRoute ? '点击查看用户发布动态' : undefined" 
                  @click="hasContentRoute ? gotoUserPosts(row) : undefined"
                >
                  {{ row.nickname }}
                </span>
                <span class="user-bio-preview">{{ row.bio || '暂无个人简介' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号码" width="130" align="center" />
        <el-table-column label="新手机号" width="130" align="center">
          <template #default="{ row }">
            <span v-if="row.newPhone" class="font-mono">{{ row.newPhone }}</span>
            <span v-else class="empty-placeholder">--</span>
          </template>
        </el-table-column>

        <el-table-column prop="regTime" label="注册时间" width="180" align="center" />

        <el-table-column label="账号状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
              <span class="status-dot" :class="row.status === 'normal' ? 'active' : 'danger'"></span>
              {{ row.status === 'normal' ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button v-permission="'user:query'" size="small" type="primary" plain icon="View" @click="handleViewDetail(row)">详情</el-button>
            <el-button v-permission="'user:edit'" v-role="['superadmin', 'admin']" v-if="row.status === 'normal'" size="small" type="danger" plain icon="Lock" @click="handleToggleStatus(row, 'banned')">禁用</el-button>
            <el-button v-permission="'user:edit'" v-role="['superadmin', 'admin']" v-else size="small" type="success" plain icon="Unlock" @click="handleToggleStatus(row, 'normal')">解禁</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="GLOBAL_PAGE_SIZES"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- User Details Drawer -->
    <el-drawer v-model="detailDrawerVisible" title="业务用户详细资料" size="480px" direction="rtl" destroy-on-close>
      <div v-if="selectedUser" class="drawer-user-content">
        <div class="detail-header-card glass-effect">
          <el-avatar :size="80" :src="selectedUser.avatar" class="detail-avatar" />
          <h3 class="detail-nickname">{{ selectedUser.nickname }}</h3>
          <p class="detail-bio">" {{ selectedUser.bio || '暂无个人简介' }} "</p>
          <el-tag :type="selectedUser.status === 'normal' ? 'success' : 'danger'" class="status-badge">
            {{ selectedUser.status === 'normal' ? '账户正常' : '账户已禁用' }}
          </el-tag>
        </div>

        <div class="metrics-summary-grid">
          <div 
            :class="{ 'detail-metric-item': true, 'clickable-metric': hasContentRoute }" 
            :title="hasContentRoute ? '点击查看该用户发布动态' : undefined" 
            @click="hasContentRoute ? gotoUserPosts(selectedUser) : undefined"
          >
            <span class="metric-num text-gradient">{{ selectedUser.postCount }}</span>
            <span class="metric-name">
              发布内容数<span v-if="hasContentRoute" class="link-text-badge"> ➔</span>
            </span>
          </div>
          <div class="detail-metric-item">
            <span class="metric-num text-gradient">{{ selectedUser.commentCount }}</span>
            <span class="metric-name">发表评论数</span>
          </div>
          <div class="detail-metric-item">
            <span class="metric-num text-gradient">{{ selectedUser.likesReceived }}</span>
            <span class="metric-name">获得点赞数</span>
          </div>
        </div>

        <div class="detail-info-list premium-card">
          <div class="info-list-title">基本信息账号</div>
          <div class="info-row"><span class="info-label">业务用户ID</span><span class="info-val font-mono">{{ selectedUser.user_id }}</span></div>
          <div class="info-row"><span class="info-label">手机号码</span><span class="info-val">{{ selectedUser.phone }}</span></div>
          <div class="info-row"><span class="info-label">新手机号码</span><span class="info-val">{{ selectedUser.newPhone || '暂无' }}</span></div>
          <div class="info-row"><span class="info-label">注册时间</span><span class="info-val">{{ selectedUser.regTime }}</span></div>
        </div>

        <div class="drawer-action-block">
          <el-button v-permission="'user:edit'" v-role="['superadmin', 'admin']" v-if="selectedUser.status === 'normal'" type="danger" style="width: 100%;" icon="Lock" @click="handleToggleStatus(selectedUser, 'banned')">禁用该用户账号</el-button>
          <el-button v-permission="'user:edit'" v-role="['superadmin', 'admin']" v-else type="success" style="width: 100%;" icon="Unlock" @click="handleToggleStatus(selectedUser, 'normal')">解除禁用限制</el-button>
        </div>
      </div>
    </el-drawer>

    <!-- Export Formats Dialog -->
    <el-dialog v-model="exportDialogVisible" title="导出用户数据" width="450px" destroy-on-close>
      <div class="export-options-container">
        <p class="export-desc">请选择您希望导出的数据文件格式：</p>
        <div class="export-option-card" @click="triggerExport('xlsx')">
          <el-icon class="export-icon xlsx-color"><Document /></el-icon>
          <div class="option-info">
            <h4>导出为 Excel 工作表 (.xlsx)</h4>
            <p>含有中文表头，适合使用 Excel 或 WPS 等软件人工查看、分析与编辑。</p>
          </div>
        </div>
        <div class="export-option-card" @click="triggerExport('json')">
          <el-icon class="export-icon json-color"><MessageBox /></el-icon>
          <div class="option-info">
            <h4>导出为 JSON 纯文本 (.json)</h4>
            <p>标准的结构化数据，适合用于系统备份、迁移恢复或数据集成开发。</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMockDataStore } from '@/store/mockData'
import { useMenuStore } from '@/store/menu'
import { adminApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx'

import { GLOBAL_PAGE_SIZE, GLOBAL_PAGE_SIZES } from '@/hooks/usePagination'

const router = useRouter()
const menuStore = useMenuStore()

const exportDialogVisible = ref(false)

const headerMapping: Record<string, string> = {
  'user_id': 'user_id',
  'nickname': 'nickname',
  'phone': 'phone',
  'newPhone': 'newPhone',
  'status': 'status',
  'regTime': 'regTime',
  'postCount': 'postCount',
  'commentCount': 'commentCount',
  'likesReceived': 'likesReceived',
  'bio': 'bio',
  '用户ID': 'user_id',
  '用户id': 'user_id',
  '昵称': 'nickname',
  '用户昵称': 'nickname',
  '手机号码': 'phone',
  '手机号': 'phone',
  '新手机号': 'newPhone',
  '新手机号码': 'newPhone',
  '账号状态': 'status',
  '状态': 'status',
  '注册时间': 'regTime',
  '发布内容数': 'postCount',
  '发布数': 'postCount',
  '发表评论数': 'commentCount',
  '评论数': 'commentCount',
  '获得点赞数': 'likesReceived',
  '点赞数': 'likesReceived',
  '个人简介': 'bio',
  '简介': 'bio'
}

const hasRoute = (path: string) => {
  const check = (nodes: any[]): boolean => {
    for (const node of nodes) {
      if (node.path === path || node.path === path.replace(/^\//, '') || node.path?.endsWith(path)) {
        return true
      }
      if (node.children && node.children.length > 0) {
        if (check(node.children)) {
          return true
        }
      }
    }
    return false
  }
  return check(menuStore.menuTree)
}

const hasContentRoute = computed(() => hasRoute('/content'))
const mockStore = useMockDataStore()
const tableData = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(GLOBAL_PAGE_SIZE)

const searchForm = reactive({
  user_id: '',
  nickname: '',
  phone: '',
  status: ''
})

const selectedUser = ref<any>(null)
const detailDrawerVisible = ref(false)

// ── Cross-page selection (ref array — more reliable reactivity than reactive Set) ──
const selectedIds = ref<string[]>([])

const isCurrentPageAllSelected = computed(() =>
  tableData.value.length > 0 && tableData.value.every(r => selectedIds.value.includes(r.user_id))
)
const isCurrentPageIndeterminate = computed(() =>
  tableData.value.some(r => selectedIds.value.includes(r.user_id)) && !isCurrentPageAllSelected.value
)

const toggleSelect = (id: string, val: boolean) => {
  if (val && !selectedIds.value.includes(id)) {
    selectedIds.value = [...selectedIds.value, id]
  } else if (!val) {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

const handleSelectCurrentPage = (val: boolean) => {
  const pageIds = tableData.value.map(r => r.user_id)
  if (val) {
    const merged = new Set([...selectedIds.value, ...pageIds])
    selectedIds.value = [...merged]
  } else {
    selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id))
  }
}

// ── Batch Ban / Unban ────────────────────────────────────────────
const handleBatchBan = () => {
  const ids = [...selectedIds.value]
  ElMessageBox.confirm(
    `确定要批量<b>禁用</b>选中的 <b>${ids.length}</b> 位用户吗？<br/>禁用后这些用户将无法登录和发布内容。`,
    '批量禁用确认',
    { confirmButtonText: '确认禁用', cancelButtonText: '取消', type: 'warning', dangerouslyUseHTMLString: true, confirmButtonClass: 'el-button--danger' }
  ).then(async () => {
    let successCount = 0
    for (const id of ids) {
      try {
        const res = await adminApi.updateUserStatus(id, 'banned')
        if (res.code === 200) successCount++
      } catch (err) {
        console.error(`Batch ban failed for ${id}`, err)
      }
    }
    selectedIds.value = []
    fetchUsers()
    ElMessage.success(`已成功禁用 ${successCount} 位用户`)
  }).catch(() => {})
}

const handleBatchUnban = () => {
  const ids = [...selectedIds.value]
  ElMessageBox.confirm(
    `确定要批量<b>解禁</b>选中的 <b>${ids.length}</b> 位用户吗？`,
    '批量解禁确认',
    { confirmButtonText: '确认解禁', cancelButtonText: '取消', type: 'success', dangerouslyUseHTMLString: true }
  ).then(async () => {
    let successCount = 0
    for (const id of ids) {
      try {
        const res = await adminApi.updateUserStatus(id, 'normal')
        if (res.code === 200) successCount++
      } catch (err) {
        console.error(`Batch unban failed for ${id}`, err)
      }
    }
    selectedIds.value = []
    fetchUsers()
    ElMessage.success(`已成功解禁 ${successCount} 位用户`)
  }).catch(() => {})
}

// ── Export users with format selection ───────────────────────────
const handleExport = () => {
  exportDialogVisible.value = true
}

const triggerExport = async (format: 'xlsx' | 'json') => {
  exportDialogVisible.value = false
  try {
    const all = await adminApi.getUsers({ page: 1, limit: 99999 })
    
    if (format === 'json') {
      const exportData = all.list.map(u => ({
        user_id: u.user_id,
        nickname: u.nickname,
        phone: u.phone,
        newPhone: u.newPhone || '',
        status: u.status,
        regTime: u.regTime,
        postCount: u.postCount,
        commentCount: u.commentCount,
        likesReceived: u.likesReceived,
        bio: u.bio,
      }))
      const blob = new Blob(
        [JSON.stringify(exportData, null, 2)],
        { type: 'application/json' }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_export_${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success(`已导出 ${exportData.length} 条 JSON 用户数据`)
    } else if (format === 'xlsx') {
      const exportData = all.list.map(u => ({
        '用户ID': u.user_id,
        '用户昵称': u.nickname,
        '手机号码': u.phone,
        '新手机号': u.newPhone || '',
        '账号状态': u.status === 'normal' ? '正常' : '已禁用',
        '注册时间': u.regTime,
        '发布内容数': u.postCount,
        '发表评论数': u.commentCount,
        '获得点赞数': u.likesReceived,
        '个人简介': u.bio || ''
      }))
      
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, '用户列表')
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_export_${new Date().toISOString().slice(0, 10)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
      ElMessage.success(`已导出 ${exportData.length} 条 Excel 用户数据`)
    }
  } catch (err) {
    console.error('Export failed', err)
    ElMessage.error('导出用户数据失败，请检查网络或控制台日志')
  }
}

// ── Import users supporting both JSON and Excel ────────────────
const handleImport = (file: File) => {
  const isJson = file.name.endsWith('.json')
  const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

  if (!isJson && !isExcel) {
    ElMessage.error('不支持的文件格式，请上传 JSON 或 Excel (.xlsx/.xls) 文件')
    return false
  }

  const reader = new FileReader()

  if (isJson) {
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        processImportedData(data)
      } catch (err) {
        ElMessage.error('JSON 文件格式错误，解析失败')
      }
    }
    reader.readAsText(file)
  } else if (isExcel) {
    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheetName]
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet)
        
        // Map Excel headers to database properties
        const formattedRows = rawRows.map(row => {
          const mappedRow: any = {}
          for (const key in row) {
            const normalizedKey = key.trim()
            const targetKey = headerMapping[normalizedKey] || normalizedKey
            
            if (targetKey === 'status') {
              const val = String(row[key]).trim()
              mappedRow[targetKey] = (val === '正常' || val === 'normal') ? 'normal' : 'banned'
            } else {
              mappedRow[targetKey] = row[key]
            }
          }
          return mappedRow
        })

        processImportedData(formattedRows)
      } catch (err) {
        console.error('Excel parse failed', err)
        ElMessage.error('Excel 文件解析失败，请确认模版列头是否正确')
      }
    }
    reader.readAsArrayBuffer(file)
  }
  return false
}

const processImportedData = (data: any[]) => {
  if (!Array.isArray(data)) {
    ElMessage.error('导入的数据列表格式错误')
    return
  }

  ElMessageBox.confirm(
    `解析到 <b>${data.length}</b> 条用户数据，确认导入？<br/><span style="color:#909399;font-size:12px;">已存在的用户ID将跳过，仅新增不存在的用户。</span>`,
    '导入确认',
    { confirmButtonText: '确认导入', cancelButtonText: '取消', type: 'info', dangerouslyUseHTMLString: true }
  ).then(() => {
    let added = 0
    const existingIds = new Set(mockStore.users.map(u => u.user_id))
    for (const u of data) {
      if (!existingIds.has(u.user_id) && u.user_id && u.nickname) {
        mockStore.users.push({
          user_id: String(u.user_id).trim(),
          nickname: String(u.nickname).trim(),
          avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.nickname}`,
          phone: u.phone ? String(u.phone).trim() : '--',
          newPhone: u.newPhone ? String(u.newPhone).trim() : undefined,
          status: u.status || 'normal',
          regTime: u.regTime || new Date().toISOString().slice(0, 10),
          postCount: Number(u.postCount || 0),
          commentCount: Number(u.commentCount || 0),
          likesReceived: Number(u.likesReceived || 0),
          bio: u.bio || '',
        })
        added++
      }
    }
    fetchUsers()
    ElMessage.success(`导入完成，新增 ${added} 位用户，跳过 ${data.length - added} 条重复数据`)
  }).catch(() => {})
}

// ── Data Fetch ───────────────────────────────────────────────────
const fetchUsers = async () => {
  try {
    const res = await adminApi.getUsers({
      user_id: searchForm.user_id || undefined,
      nickname: searchForm.nickname || undefined,
      phone: searchForm.phone || undefined,
      status: searchForm.status || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    tableData.value = res.list
    totalCount.value = res.total
  } catch (err) {
    console.error('fetchUsers error', err)
  }
}

const handleSearch = () => { currentPage.value = 1; fetchUsers() }
const handleReset = () => {
  searchForm.user_id = ''
  searchForm.nickname = ''
  searchForm.phone = ''
  searchForm.status = ''
  currentPage.value = 1
  fetchUsers()
}
const handleSizeChange = (val: number) => { pageSize.value = val; currentPage.value = 1; fetchUsers() }
const handleCurrentChange = (val: number) => { currentPage.value = val; fetchUsers() }

const handleViewDetail = async (row: any) => {
  try {
    const user = await adminApi.getUserById(row.user_id)
    if (user) { selectedUser.value = user; detailDrawerVisible.value = true }
    else ElMessage.error('用户不存在')
  } catch (err) {
    console.error('handleViewDetail error', err)
  }
}

const handleToggleStatus = (row: any, newStatus: 'normal' | 'banned') => {
  const statusText = newStatus === 'normal' ? '解禁' : '封禁'
  const boxType = newStatus === 'normal' ? 'success' : 'warning'
  ElMessageBox.confirm(
    `确定要对用户 "<b>${row.nickname}</b>" 执行${statusText}操作吗？`,
    '提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: boxType, dangerouslyUseHTMLString: true }
  ).then(async () => {
    try {
      const res = await adminApi.updateUserStatus(row.user_id, newStatus)
      if (res.code === 200) {
        ElMessage.success(`用户已成功${statusText}`)
        fetchUsers()
        if (detailDrawerVisible.value && selectedUser.value?.user_id === row.user_id) {
          selectedUser.value.status = newStatus
        }
      } else {
        ElMessage.error('操作失败')
      }
    } catch (err) {
      console.error('handleToggleStatus error', err)
    }
  }).catch(() => {})
}

const gotoUserPosts = (user: any) => {
  detailDrawerVisible.value = false
  router.push({ path: '/content', query: { user_id: user.user_id } })
}

onMounted(() => { fetchUsers() })
</script>

<style scoped>
.user-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-panel {
  padding: 20px 24px 0 24px;
}

.table-card {
  padding: 24px;
}

/* ── Toolbar ── */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ── Batch action bar ── */
.batch-action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #874d00;
  animation: slideDown 0.2s ease;
}

.batch-action-bar b { color: #d46b08; }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Table ── */
.user-profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-nickname {
  font-weight: 600;
  color: var(--text-main);
  font-size: 14px;
}

.user-bio-preview {
  font-size: 12px;
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
  margin-top: 2px;
}

/* ── Drawer ── */
.drawer-user-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background: white;
}

.detail-avatar {
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(88, 86, 214, 0.2);
  margin-bottom: 12px;
}

.detail-nickname {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.detail-bio {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 15px;
  font-style: italic;
}

.status-badge { font-size: 12px; }

.metrics-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-metric-item {
  background: white;
  border: 1px solid var(--border-color);
  padding: 16px 8px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.metric-num { font-size: 20px; font-weight: 700; }
.metric-name { font-size: 11px; color: var(--text-light); font-weight: 500; }

.detail-info-list { padding: 20px; }

.info-list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  border-left: 3px solid var(--primary);
  padding-left: 8px;
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px dashed var(--border-color);
}

.info-row:last-child { border-bottom: none; }
.info-label { color: var(--text-muted); }
.info-val { color: var(--text-main); font-weight: 500; }

.drawer-action-block {
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-bottom: 20px;
}

.user-nickname-link {
  cursor: pointer;
  transition: color 0.2s ease;
}

.user-nickname-link:hover {
  color: var(--primary, #1890ff);
  text-decoration: underline;
}

.clickable-metric {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-metric:hover {
  border-color: var(--primary, #5856d6);
  background-color: rgba(88, 86, 214, 0.04);
}

.link-text-badge {
  color: var(--primary, #5856d6);
  font-weight: 700;
  text-decoration: underline;
}

.empty-placeholder { color: #c0c4cc; }

/* ── Export Dialog ── */
.export-options-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 10px 0;
}

.export-desc {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
}

.export-option-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #ffffff;
}

.export-option-card:hover {
  border-color: var(--primary, #5856d6);
  background-color: #f9f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(88, 86, 214, 0.08);
}

.export-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.xlsx-color {
  color: #1f7246;
}

.json-color {
  color: #007acc;
}

.option-info h4 {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}

.option-info p {
  font-size: 11px;
  color: #909399;
  margin: 0;
  line-height: 1.4;
}
</style>
