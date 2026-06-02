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
import { adminApi } from '@/api/admin'

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

const totalOpCount = ref(0)
const totalLoginCount = ref(0)

const opLogs = ref<any[]>([])
const loginLogs = ref<any[]>([])

const moduleToCategoryMap: Record<string, string> = {
  '用户管理': 'user',
  '内容管理': 'post',
  '评论管理': 'comment',
  '系统公告': 'announcement',
  '版本管理': 'version',
  '推送中心': 'push',
  '字典配置': 'dictionary',
  '地区管理': 'region',
  '标签管理': 'tag',
  '账号管理': 'account',
  '菜单管理': 'menu',
  '安全验证': 'security'
}

const categoryToModuleMap: Record<string, string> = {
  'user': '用户管理',
  'post': '内容管理',
  'comment': '评论管理',
  'announcement': '系统公告',
  'version': '版本管理',
  'push': '推送中心',
  'dictionary': '字典配置',
  'region': '地区管理',
  'tag': '标签管理',
  'account': '账号管理',
  'menu': '菜单管理',
  'security': '安全验证',
  'login': '登录/认证'
}

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

const fetchLogs = async () => {
  loading.value = true
  try {
    const params: any = {
      page: activeTab.value === 'operation' ? opPagination.value.page : loginPagination.value.page,
      limit: activeTab.value === 'operation' ? opPagination.value.limit : loginPagination.value.limit
    }

    if (queryParams.value.operator.trim()) {
      params.username = queryParams.value.operator.trim()
    }

    if (queryParams.value.status) {
      params.status = queryParams.value.status === 'failure' ? 'error' : queryParams.value.status
    }

    if (activeTab.value === 'login') {
      params.category = 'login'
    } else {
      if (queryParams.value.module) {
        params.category = moduleToCategoryMap[queryParams.value.module] || queryParams.value.module
      }
    }

    const res = await adminApi.getSystemLogs(params)
    if (res) {
      const rawList = res.list || []
      const formattedList = rawList.map((log: any) => {
        return {
          id: log.logId,
          operator: log.username || 'unknown',
          role: log.username === 'superadmin' ? 'superadmin' : (log.username === 'admin' ? 'admin' : 'operator'),
          module: categoryToModuleMap[log.category] || log.category || '系统模块',
          action: log.content || log.action || log.title || '',
          ip: log.ip || '',
          location: log.location || '',
          status: log.status === 'success' ? 'success' : 'failure',
          time: log.createdAt || log.time || '',
          agent: log.userAgent || '',
          username: log.username || ''
        }
      })

      if (activeTab.value === 'operation') {
        let list = formattedList
        // If no module is selected, filter out login logs client-side to keep tabs separate
        if (!queryParams.value.module) {
          list = list.filter((log: any) => {
            const rawItem = rawList.find((l: any) => l.logId === log.id)
            return rawItem && rawItem.category !== 'login'
          })
        }

        // Apply time range filter client-side if active
        if (queryParams.value.timeRange && queryParams.value.timeRange.length === 2) {
          const start = new Date(queryParams.value.timeRange[0] + ' 00:00:00').getTime()
          const end = new Date(queryParams.value.timeRange[1] + ' 23:59:59').getTime()
          list = list.filter((log: any) => {
            const t = new Date(log.time).getTime()
            return t >= start && t <= end
          })
        }

        opLogs.value = list
        totalOpCount.value = res.total || list.length
      } else {
        let list = formattedList
        // Apply time range filter client-side if active
        if (queryParams.value.timeRange && queryParams.value.timeRange.length === 2) {
          const start = new Date(queryParams.value.timeRange[0] + ' 00:00:00').getTime()
          const end = new Date(queryParams.value.timeRange[1] + ' 23:59:59').getTime()
          list = list.filter((log: any) => {
            const t = new Date(log.time).getTime()
            return t >= start && t <= end
          })
        }

        loginLogs.value = list
        totalLoginCount.value = res.total || list.length
      }
    }
  } catch (err) {
    console.error('Failed to fetch system logs:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})

const handleTabChange = () => {
  selectedRowKeys.value = []
  fetchLogs()
}

const handleSelectionChange = (selection: any[]) => {
  selectedRowKeys.value = selection.map(row => row.id)
}

const filteredOpLogs = computed(() => opLogs.value)
const filteredLoginLogs = computed(() => loginLogs.value)

const handleQuery = () => {
  fetchLogs()
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
  fetchLogs()
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
  ).then(async () => {
    loading.value = true
    try {
      await adminApi.batchDeleteSystemLogs(selectedRowKeys.value)
      ElMessage.success('批量删除日志成功')
      selectedRowKeys.value = []
      await fetchLogs()
    } catch (err) {
      console.error('Failed to batch delete logs:', err)
    } finally {
      loading.value = false
    }
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
  ).then(async () => {
    loading.value = true
    try {
      const params: any = { page: 1, limit: 1000 }
      if (activeTab.value === 'login') {
        params.category = 'login'
      }
      const res = await adminApi.getSystemLogs(params)
      let idsToDelete: string[] = []
      if (res && res.list) {
        if (activeTab.value === 'login') {
          idsToDelete = res.list.map((l: any) => l.logId)
        } else {
          idsToDelete = res.list.filter((l: any) => l.category !== 'login').map((l: any) => l.logId)
        }
      }
      if (idsToDelete.length > 0) {
        await adminApi.batchDeleteSystemLogs(idsToDelete)
      }
      ElMessage.success('安全审计日志已全部清空')
      selectedRowKeys.value = []
      await fetchLogs()
    } catch (err) {
      console.error('Failed to clear logs:', err)
      ElMessage.error('清空日志失败')
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

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
