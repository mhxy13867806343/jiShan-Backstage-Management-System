<template>
  <div class="log-container animate-fade-in">
    <!-- Header -->
    <div class="log-header-bar">
      <h2>日志管理 (Log Management)</h2>
      <p class="subtitle-text">系统安全审计与合规可追溯性操作及登录日志大屏。</p>
    </div>

    <!-- Query Filters -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryParams" class="filter-form-inline" size="default">
        <el-form-item label="操作人员">
          <el-input v-model="queryParams.operator" placeholder="请输入操作人账号" clearable />
        </el-form-item>
        
        <el-form-item label="操作模块">
          <el-select v-model="queryParams.module" placeholder="请选择模块" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="用户管理" value="用户管理" />
            <el-option label="内容管理" value="内容管理" />
            <el-option label="评论管理" value="评论管理" />
            <el-option label="系统公告" value="系统公告" />
            <el-option label="版本管理" value="版本管理" />
            <el-option label="推送中心" value="推送中心" />
            <el-option label="字典配置" value="字典配置" />
            <el-option label="地区管理" value="地区管理" />
            <el-option label="标签管理" value="标签管理" />
            <el-option label="账号管理" value="账号管理" />
            <el-option label="菜单管理" value="菜单管理" />
            <el-option label="安全验证" value="安全验证" />
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="请选择状态" clearable style="width: 110px">
            <el-option label="全部" value="" />
            <el-option label="成功" value="success" />
            <el-option label="失败" value="failure" />
          </el-select>
        </el-form-item>

        <el-form-item label="操作时间">
          <el-date-picker
            v-model="queryParams.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item class="filter-action-item">
          <el-button type="primary" @click="handleQuery">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Operations Bar -->
    <div class="table-operations-row">
      <div class="left-actions">
        <el-button 
          v-role="['superadmin', 'admin']"
          type="danger" 
          plain 
          :disabled="selectedRowKeys.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon> 批量删除
        </el-button>
        <el-button 
          v-role="['superadmin']"
          type="danger" 
          @click="handleClearAll"
        >
          <el-icon><Warning /></el-icon> 清空所有日志
        </el-button>
      </div>
      <div class="right-actions">
        <el-button type="success" plain @click="handleExport" :loading="exportLoading">
          <el-icon><Download /></el-icon> 导出日志
        </el-button>
      </div>
    </div>

    <!-- Tabs Container -->
    <el-tabs v-model="activeTab" class="log-tabs-panel" type="border-card" @tab-change="handleTabChange">
      <!-- Tab 1: Operation Logs -->
      <el-tab-pane name="operation" label="系统操作日志">
        <el-table 
          v-loading="loading" 
          :data="filteredOpLogs" 
          style="width: 100%"
          @selection-change="handleSelectionChange"
          size="small"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="日志ID" width="100" />
          <el-table-column prop="operator" label="操作人员" width="100" />
          <el-table-column label="角色级别" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getRoleTag(row.role)" size="small" effect="plain">{{ getRoleName(row.role) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="module" label="模块名称" width="120" />
          <el-table-column prop="action" label="操作详情" min-width="200" show-overflow-tooltip />
          <el-table-column prop="ip" label="请求IP" width="120" />
          <el-table-column prop="location" label="地理位置" width="110" />
          <el-table-column label="操作状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="操作时间" width="150" align="center" />
        </el-table>

        <div class="pagination-footer">
          <el-pagination
            v-model:current-page="opPagination.page"
            v-model:page-size="opPagination.limit"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalOpCount"
            @size-change="handleQuery"
            @current-change="handleQuery"
          />
        </div>
      </el-tab-pane>

      <!-- Tab 2: Login Logs -->
      <el-tab-pane name="login" label="管理员登录日志">
        <el-table 
          v-loading="loading" 
          :data="filteredLoginLogs" 
          style="width: 100%"
          @selection-change="handleSelectionChange"
          size="small"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="日志ID" width="100" />
          <el-table-column prop="username" label="登录账号" width="110" />
          <el-table-column prop="ip" label="登录IP" width="130" />
          <el-table-column prop="location" label="物理归属地" width="130" />
          <el-table-column prop="agent" label="客户端内核 / 系统" min-width="220" show-overflow-tooltip />
          <el-table-column label="登录状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="time" label="登录时间" width="150" align="center" />
        </el-table>

        <div class="pagination-footer">
          <el-pagination
            v-model:current-page="loginPagination.page"
            v-model:page-size="loginPagination.limit"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="totalLoginCount"
            @size-change="handleQuery"
            @current-change="handleQuery"
          />
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Warning, Download } from '@element-plus/icons-vue'

const activeTab = ref('operation')
const loading = ref(false)
const exportLoading = ref(false)
const selectedRowKeys = ref<any[]>([])

const queryParams = ref({
  operator: '',
  module: '',
  status: '',
  timeRange: [] as any[]
})

const opPagination = ref({ page: 1, limit: 10 })
const loginPagination = ref({ page: 1, limit: 10 })

// In-Memory database for dynamic logs management
const opLogs = ref<any[]>([])
const loginLogs = ref<any[]>([])

const getRoleName = (role: string) => {
  const map: Record<string, string> = {
    superadmin: '超级管理员',
    admin: '普通管理员',
    operator: '运营操作员'
  }
  return map[role] || '系统角色'
}

const getRoleTag = (role: string) => {
  const map: Record<string, string> = {
    superadmin: 'danger',
    admin: 'primary',
    operator: 'success'
  }
  return map[role] || 'info'
}

// Generate premium mock audit data
const generateMockLogs = () => {
  const opData = [
    { id: 'OP20261021', operator: 'superadmin', role: 'superadmin', module: '字典配置', action: '新增字典项 "user_status" 中的 "静默用户"', ip: '182.92.112.5', location: '北京市', status: 'success', time: '2026-06-02 11:24:02' },
    { id: 'OP20261022', operator: 'admin', role: 'admin', module: '用户管理', action: '禁用业务用户 "用户_8721"（永久封禁）', ip: '124.205.76.10', location: '上海市', status: 'success', time: '2026-06-02 10:50:33' },
    { id: 'OP20261023', operator: 'admin', role: 'admin', module: '内容管理', action: '将敏感动态 "深夜食堂集合"（P90812）下架', ip: '124.205.76.10', location: '上海市', status: 'success', time: '2026-06-02 10:48:12' },
    { id: 'OP20261024', operator: 'superadmin', role: 'superadmin', module: '账号管理', action: '重置管理员 "operator02" 的登录密码', ip: '182.92.112.5', location: '北京市', status: 'success', time: '2026-06-02 09:12:44' },
    { id: 'OP20261025', operator: 'operator01', role: 'operator', module: '推送中心', action: '发布推送公告《即闪 App 服务协议升级公告》', ip: '115.196.220.12', location: '杭州市', status: 'success', time: '2026-06-02 08:30:15' },
    { id: 'OP20261026', operator: 'operator01', role: 'operator', module: '系统公告', action: '修改公告《防范刷单诈骗安全预警》置顶状态为：是', ip: '115.196.220.12', location: '杭州市', status: 'success', time: '2026-06-01 17:40:00' },
    { id: 'OP20261027', operator: 'admin', role: 'admin', module: '标签管理', action: '新增标签配置 "探店"', ip: '124.205.76.10', location: '上海市', status: 'success', time: '2026-06-01 16:32:15' },
    { id: 'OP20261028', operator: 'operator02', role: 'operator', module: '地区管理', action: '删除服务地区 "深圳·万象天地"', ip: '223.73.125.4', location: '深圳市', status: 'failure', time: '2026-06-01 15:22:04' },
    { id: 'OP20261029', operator: 'operator02', role: 'operator', module: '评论管理', action: '删除动态 P12093 下的违规回复评论', ip: '223.73.125.4', location: '深圳市', status: 'success', time: '2026-06-01 15:10:44' },
    { id: 'OP20261030', operator: 'admin', role: 'admin', module: '安全验证', action: '更新隐私政策服务协议内容', ip: '124.205.76.10', location: '上海市', status: 'success', time: '2026-06-01 14:02:11' },
    { id: 'OP20261031', operator: 'operator01', role: 'operator', module: '内容管理', action: '驳回违规动态 (P2019) 恢复上架申请', ip: '115.196.220.12', location: '杭州市', status: 'success', time: '2026-05-31 16:20:10' },
    { id: 'OP20261032', operator: 'superadmin', role: 'superadmin', module: '菜单管理', action: '修改系统菜单结构：新增二级路由 "日志管理"', ip: '182.92.112.5', location: '北京市', status: 'success', time: '2026-05-31 15:10:45' },
    { id: 'OP20261033', operator: 'operator02', role: 'operator', module: '版本管理', action: '新增发布 iOS V2.0.4（Build 119）版本', ip: '223.73.125.4', location: '深圳市', status: 'success', time: '2026-05-31 10:20:30' },
    { id: 'OP20261034', operator: 'superadmin', role: 'superadmin', module: '账号管理', action: '修改管理员 "admin" 的角色权限组', ip: '182.92.112.5', location: '北京市', status: 'success', time: '2026-05-30 16:32:00' },
    { id: 'OP20261035', operator: 'admin', role: 'admin', module: '地区管理', action: '添加营业网点地区 "广州·天河"', ip: '124.205.76.10', location: '上海市', status: 'success', time: '2026-05-30 14:22:15' }
  ]

  const loginData = [
    { id: 'LG20268021', username: 'superadmin', ip: '182.92.112.5', location: '北京市 &bull; 联通', agent: 'Mozilla/5.0 (macOS; Chrome/124.0.0.0)', status: 'success', time: '2026-06-02 11:20:00' },
    { id: 'LG20268022', username: 'admin', ip: '124.205.76.10', location: '上海市 &bull; 电信', agent: 'Mozilla/5.0 (Windows NT 10.0; Edge/123.0.0.0)', status: 'success', time: '2026-06-02 10:45:15' },
    { id: 'LG20268023', username: 'operator01', ip: '115.196.220.12', location: '杭州市 &bull; 移动', agent: 'Mozilla/5.0 (macOS; Safari/605.1.15)', status: 'success', time: '2026-06-02 08:24:11' },
    { id: 'LG20268024', username: 'operator02', ip: '223.73.125.4', location: '深圳市 &bull; 电信', agent: 'Mozilla/5.0 (Windows NT 10.0; Chrome/124.0.0.0)', status: 'success', time: '2026-06-01 15:05:32' },
    { id: 'LG20268025', username: 'admin', ip: '124.205.76.10', location: '上海市 &bull; 电信', agent: 'Mozilla/5.0 (Windows NT 10.0; Edge/123.0.0.0)', status: 'failure', time: '2026-06-01 09:12:30' },
    { id: 'LG20268026', username: 'operator01', ip: '115.196.220.12', location: '杭州市 &bull; 移动', agent: 'Mozilla/5.0 (macOS; Safari/605.1.15)', status: 'success', time: '2026-05-31 16:04:12' },
    { id: 'LG20268027', username: 'superadmin', ip: '182.92.112.5', location: '北京市 &bull; 联通', agent: 'Mozilla/5.0 (macOS; Chrome/124.0.0.0)', status: 'success', time: '2026-05-31 14:50:33' },
    { id: 'LG20268028', username: 'operator02', ip: '223.73.125.4', location: '深圳市 &bull; 电信', agent: 'Mozilla/5.0 (Windows NT 10.0; Chrome/124.0.0.0)', status: 'success', time: '2026-05-31 10:15:00' },
    { id: 'LG20268029', username: 'admin', ip: '124.205.76.10', location: '上海市 &bull; 电信', agent: 'Mozilla/5.0 (Windows NT 10.0; Edge/123.0.0.0)', status: 'success', time: '2026-05-30 14:15:22' },
    { id: 'LG20268030', username: 'superadmin', ip: '182.92.112.5', location: '北京市 &bull; 联通', agent: 'Mozilla/5.0 (macOS; Chrome/124.0.0.0)', status: 'failure', time: '2026-05-30 08:30:12' }
  ]
  
  opLogs.value = opData
  loginLogs.value = loginData
}

onMounted(() => {
  generateMockLogs()
})

// Tab changes resets selections
const handleTabChange = () => {
  selectedRowKeys.value = []
}

// Fetch Selection
const handleSelectionChange = (selection: any[]) => {
  selectedRowKeys.value = selection.map(row => row.id)
}

// Interactively filter operation logs in frontend
const filteredOpLogs = computed(() => {
  let list = [...opLogs.value]
  
  // Apply query parameters
  if (queryParams.value.operator.trim()) {
    const term = queryParams.value.operator.toLowerCase().trim()
    list = list.filter(l => l.operator.toLowerCase().includes(term))
  }
  if (queryParams.value.module) {
    list = list.filter(l => l.module === queryParams.value.module)
  }
  if (queryParams.value.status) {
    list = list.filter(l => l.status === queryParams.value.status)
  }
  if (queryParams.value.timeRange && queryParams.value.timeRange.length === 2) {
    const start = new Date(queryParams.value.timeRange[0] + ' 00:00:00').getTime()
    const end = new Date(queryParams.value.timeRange[1] + ' 23:59:59').getTime()
    list = list.filter(l => {
      const t = new Date(l.time).getTime()
      return t >= start && t <= end
    })
  }

  // Client side pagination
  const startIdx = (opPagination.value.page - 1) * opPagination.value.limit
  return list.slice(startIdx, startIdx + opPagination.value.limit)
})

const totalOpCount = computed(() => {
  let list = [...opLogs.value]
  if (queryParams.value.operator.trim()) {
    const term = queryParams.value.operator.toLowerCase().trim()
    list = list.filter(l => l.operator.toLowerCase().includes(term))
  }
  if (queryParams.value.module) {
    list = list.filter(l => l.module === queryParams.value.module)
  }
  if (queryParams.value.status) {
    list = list.filter(l => l.status === queryParams.value.status)
  }
  if (queryParams.value.timeRange && queryParams.value.timeRange.length === 2) {
    const start = new Date(queryParams.value.timeRange[0] + ' 00:00:00').getTime()
    const end = new Date(queryParams.value.timeRange[1] + ' 23:59:59').getTime()
    list = list.filter(l => {
      const t = new Date(l.time).getTime()
      return t >= start && t <= end
    })
  }
  return list.length
})

// Interactively filter login logs in frontend
const filteredLoginLogs = computed(() => {
  let list = [...loginLogs.value]
  
  // Apply query parameters (operator binds to login username)
  if (queryParams.value.operator.trim()) {
    const term = queryParams.value.operator.toLowerCase().trim()
    list = list.filter(l => l.username.toLowerCase().includes(term))
  }
  if (queryParams.value.status) {
    list = list.filter(l => l.status === queryParams.value.status)
  }
  if (queryParams.value.timeRange && queryParams.value.timeRange.length === 2) {
    const start = new Date(queryParams.value.timeRange[0] + ' 00:00:00').getTime()
    const end = new Date(queryParams.value.timeRange[1] + ' 23:59:59').getTime()
    list = list.filter(l => {
      const t = new Date(l.time).getTime()
      return t >= start && t <= end
    })
  }

  // Client side pagination
  const startIdx = (loginPagination.value.page - 1) * loginPagination.value.limit
  return list.slice(startIdx, startIdx + loginPagination.value.limit)
})

const totalLoginCount = computed(() => {
  let list = [...loginLogs.value]
  if (queryParams.value.operator.trim()) {
    const term = queryParams.value.operator.toLowerCase().trim()
    list = list.filter(l => l.username.toLowerCase().includes(term))
  }
  if (queryParams.value.status) {
    list = list.filter(l => l.status === queryParams.value.status)
  }
  if (queryParams.value.timeRange && queryParams.value.timeRange.length === 2) {
    const start = new Date(queryParams.value.timeRange[0] + ' 00:00:00').getTime()
    const end = new Date(queryParams.value.timeRange[1] + ' 23:59:59').getTime()
    list = list.filter(l => {
      const t = new Date(l.time).getTime()
      return t >= start && t <= end
    })
  }
  return list.length
})

const handleQuery = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 300)
}

const resetQuery = () => {
  queryParams.value = {
    operator: '',
    module: '',
    status: '',
    timeRange: []
  }
  opPagination.value.page = 1
  loginPagination.value.page = 1
  handleQuery()
}

// Batch deletion handler
const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要永久删除所选的 ${selectedRowKeys.value.length} 条系统日志吗？`,
    '提示',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      if (activeTab.value === 'operation') {
        opLogs.value = opLogs.value.filter(l => !selectedRowKeys.value.includes(l.id))
      } else {
        loginLogs.value = loginLogs.value.filter(l => !selectedRowKeys.value.includes(l.id))
      }
      selectedRowKeys.value = []
      loading.value = false
      ElMessage.success('批量删除日志成功')
    }, 400)
  }).catch(() => {})
}

// Clear all logs handler
const handleClearAll = () => {
  ElMessageBox.confirm(
    '警告！确定要清空该类型下的所有历史安全日志吗？此操作无法恢复！',
    '敏感操作确认',
    {
      confirmButtonText: '确定清空',
      cancelButtonText: '取消',
      type: 'error'
    }
  ).then(() => {
    loading.value = true
    setTimeout(() => {
      if (activeTab.value === 'operation') {
        opLogs.value = []
      } else {
        loginLogs.value = []
      }
      selectedRowKeys.value = []
      loading.value = false
      ElMessage.success('安全审计日志已全部清空')
    }, 400)
  }).catch(() => {})
}

// Mock export handler
const handleExport = () => {
  exportLoading.value = true
  setTimeout(() => {
    exportLoading.value = false
    ElMessage.success('安全日志数据已成功导出为 Excel 文件')
  }, 1000)
}
</script>

<style scoped>
.log-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.log-header-bar h2 {
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 2px;
}

.subtitle-text {
  font-size: 13px;
  color: #8c8c8c;
}

/* Query form panel */
.filter-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
  background-color: #ffffff;
}

.filter-card :deep(.el-card__body) {
  padding: 18px 20px 2px 20px !important;
}

.filter-form-inline :deep(.el-form-item) {
  margin-bottom: 16px !important;
  margin-right: 24px !important;
}

.filter-form-inline :deep(.el-form-item__label) {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
}

.filter-action-item {
  margin-right: 0 !important;
}

/* Operation controls row */
.table-operations-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  gap: 12px;
}

/* Tab panel */
.log-tabs-panel {
  border: 1px solid #e8e8e8 !important;
  box-shadow: none !important;
  border-radius: 2px;
}

.log-tabs-panel :deep(.el-tabs__header) {
  background-color: #fafafa !important;
  border-bottom: 1px solid #e8e8e8 !important;
}

.log-tabs-panel :deep(.el-tabs__item) {
  height: 44px !important;
  line-height: 44px !important;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  border-right: 1px solid #e8e8e8 !important;
}

.log-tabs-panel :deep(.el-tabs__item.is-active) {
  background-color: #ffffff !important;
  color: #1890ff !important;
  font-weight: 600;
  border-top: 2px solid #1890ff !important;
}

.log-tabs-panel :deep(.el-tabs__content) {
  padding: 20px !important;
}

.pagination-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
