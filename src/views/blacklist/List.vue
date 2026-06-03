<template>
  <div class="blacklist-container animate-fade-in">
    <!-- Header -->
    <div class="blacklist-header-bar">
      <h2>黑白名单安全管理 (Access Control Rules)</h2>
      <p class="subtitle-text">管理接口请求限流的黑白名单规则。白名单命中跳过限流，黑名单命中直接拦截访问。</p>
    </div>

    <!-- Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="规则类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable style="width: 140px;">
            <el-option label="全部" value="" />
            <el-option label="黑名单 (Blacklist)" value="blacklist" />
            <el-option label="白名单 (Whitelist)" value="whitelist" />
          </el-select>
        </el-form-item>

        <el-form-item label="检索关键词">
          <el-input v-model="searchForm.keyword" placeholder="IP / 接口路径 / 备注" clearable style="width: 240px;" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option label="启用" value="enabled" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Table Card -->
    <div class="table-card premium-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="primary" :icon="Plus" @click="openAddDialog">新增规则</el-button>
        </div>
        <div class="toolbar-right">
          <span class="stats-text">
            系统当前共有 <b>{{ totalCount }}</b> 条访问规则记录
          </span>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column label="名单类型" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.type === 'blacklist' ? 'danger' : 'success'" effect="dark">
              {{ row.typeText || (row.type === 'blacklist' ? '黑名单' : '白名单') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="IP 地址限制" min-width="150">
          <template #default="{ row }">
            <code class="target-code font-mono" v-if="row.ip">{{ row.ip }}</code>
            <span class="empty-text" v-else>全部 IP (*)</span>
          </template>
        </el-table-column>

        <el-table-column label="接口限制 (方法 / 路径)" min-width="200">
          <template #default="{ row }">
            <div class="api-target-cell">
              <el-tag size="small" type="info" class="method-tag font-mono">
                {{ row.method || 'ALL' }}
              </el-tag>
              <code class="path-code font-mono">{{ row.path || '全部路径 (*)' }}</code>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="remark" label="备注/封禁原因" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.remark || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="创建时间" width="170" align="center" />

        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'enabled' ? 'success' : 'info'" effect="light">
              <span class="status-dot" :class="row.status === 'enabled' ? 'active' : 'info'"></span>
              {{ row.statusText || (row.status === 'enabled' ? '启用' : '禁用') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              :type="row.status === 'enabled' ? 'warning' : 'success'" 
              plain 
              :icon="Unlock" 
              @click="toggleStatus(row)"
            >
              {{ row.status === 'enabled' ? '禁用' : '启用' }}
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              plain 
              :icon="Delete" 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- Add Block Modal Dialog -->
    <el-dialog v-model="dialogVisible" title="新增访问限制规则" width="500px" destroy-on-close>
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" label-position="left">
        <el-form-item label="名单类型" prop="type">
          <el-radio-group v-model="addForm.type">
            <el-radio label="blacklist">黑名单 (拦截访问)</el-radio>
            <el-radio label="whitelist">白名单 (绕过限流)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="IP 地址" prop="ip">
          <el-input 
            v-model="addForm.ip" 
            placeholder="支持输入完整IP，或用*匹配(如 192.168.1.*)；留空表示全部"
            clearable
          />
        </el-form-item>

        <el-form-item label="请求方法" prop="method">
          <el-select v-model="addForm.method" placeholder="选择请求方法" style="width: 100%;">
            <el-option label="ALL (全部方法)" value="ALL" />
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
            <el-option label="PUT" value="PUT" />
            <el-option label="DELETE" value="DELETE" />
            <el-option label="PATCH" value="PATCH" />
          </el-select>
        </el-form-item>

        <el-form-item label="接口路径" prop="path">
          <el-input 
            v-model="addForm.path" 
            placeholder="输入接口前缀(如 /api/posts/*)；留空表示全部接口"
            clearable
          />
        </el-form-item>

        <el-form-item label="启用状态" prop="status">
          <el-radio-group v-model="addForm.status">
            <el-radio label="enabled">启用 (立刻生效)</el-radio>
            <el-radio label="disabled">禁用 (暂不生效)</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注原因" prop="remark">
          <el-input 
            v-model="addForm.remark" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入规则备注，例如：限制某恶意采集IP、测试免限流等，作为安全审计凭证" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddForm">确定创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Refresh, Unlock, Delete } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'

const loading = ref(false)
const dialogVisible = ref(false)
const addFormRef = ref<FormInstance>()

const searchForm = reactive({
  type: '',
  keyword: '',
  status: ''
})

const addForm = ref({
  type: 'blacklist',
  ip: '',
  method: 'ALL',
  path: '',
  status: 'enabled',
  remark: ''
})

const validateIp = (_rule: any, value: any, callback: any) => {
  if (!value) {
    return callback()
  }
  // IP validation supporting wildcard asterisk '*' e.g., 192.168.1.* or *
  if (value === '*') {
    return callback()
  }
  const cleanIp = value.replace(/\*/g, '1') // Temporarily replace wildcard to check standard format
  const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  if (!ipPattern.test(cleanIp)) {
    return callback(new Error('请输入格式正确的 IP 地址或包含通配符 * 的网段'))
  }
  callback()
}

const addRules = {
  type: [{ required: true, message: '请选择名单类型', trigger: 'change' }],
  ip: [{ validator: validateIp, trigger: 'blur' }],
  method: [{ required: true, message: '请选择方法类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  remark: [{ required: true, message: '请输入备注原因', trigger: 'blur' }]
}

const tableData = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchAccessRules = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAccessRules({
      type: searchForm.type || undefined,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    if (res) {
      tableData.value = res.list || []
      totalCount.value = res.total || 0
    }
  } catch (err) {
    console.error('fetchAccessRules failed:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchAccessRules()
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.keyword = ''
  searchForm.status = ''
  currentPage.value = 1
  fetchAccessRules()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchAccessRules()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchAccessRules()
}

const openAddDialog = () => {
  addForm.value = {
    type: 'blacklist',
    ip: '',
    method: 'ALL',
    path: '',
    status: 'enabled',
    remark: ''
  }
  dialogVisible.value = true
}

const submitAddForm = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const payload = {
          type: addForm.value.type as 'blacklist' | 'whitelist',
          ip: addForm.value.ip.trim() || null,
          method: addForm.value.method || null,
          path: addForm.value.path.trim() || null,
          status: addForm.value.status as 'enabled' | 'disabled',
          remark: addForm.value.remark.trim() || null
        }

        const res = await adminApi.addAccessRule(payload)
        if (res.code === 200) {
          ElMessage.success('规则创建成功')
          dialogVisible.value = false
          fetchAccessRules()
        } else {
          ElMessage.error(res.message || '规则创建失败')
        }
      } catch (err) {
        console.error('Create access rule failed:', err)
      }
    }
  })
}

const toggleStatus = (row: any) => {
  const targetState = row.status === 'enabled' ? 'disabled' : 'enabled'
  const actionText = targetState === 'enabled' ? '启用' : '禁用'

  ElMessageBox.confirm(
    `确定要<b>${actionText}</b>此条限制规则吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(async () => {
    try {
      const res = await adminApi.updateAccessRule(row.ruleId, {
        type: row.type,
        ip: row.ip,
        method: row.method,
        path: row.path,
        status: targetState,
        remark: row.remark
      })
      if (res.code === 200) {
        ElMessage.success(`规则已成功${actionText}`)
        fetchAccessRules()
      } else {
        ElMessage.error(res.message || '操作失败')
      }
    } catch (err) {
      console.error('Toggle rule status failed:', err)
    }
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要<b>彻底删除</b>此条规则审计记录吗？<br/><span style="color:#f56c6c;font-size:12px;">此操作将永久移除接口安全限制，不可逆。</span>`,
    '危险警告',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'error',
      dangerouslyUseHTMLString: true
    }
  ).then(async () => {
    try {
      const res = await adminApi.deleteAccessRule(row.ruleId)
      if (res.code === 200) {
        ElMessage.success('规则删除成功')
        fetchAccessRules()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (err) {
      console.error('Delete rule failed:', err)
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchAccessRules()
})
</script>

<style scoped>
.blacklist-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.blacklist-header-bar h2 {
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

.premium-card :deep(.el-card__body) {
  padding: 24px !important;
}

.filter-panel {
  padding: 18px 24px;
}

.filter-panel .el-form-item {
  margin-bottom: 0;
  margin-right: 20px;
}

.table-card {
  padding: 24px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.stats-text {
  font-size: 13px;
  color: #595959;
}

.stats-text b {
  color: var(--primary, #1890ff);
}

.target-code {
  background-color: #fff1f0;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  border: 1px solid #ffa39e;
  color: #cf1322;
}

.path-code {
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  border: 1px solid #e8e8e8;
  color: rgba(0, 0, 0, 0.65);
}

.api-target-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-tag {
  font-weight: 700;
}

.empty-text {
  color: #bfbfbf;
  font-style: italic;
  font-size: 13px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.status-dot.active {
  background-color: #52c41a;
  box-shadow: 0 0 4px #52c41a;
}

.status-dot.info {
  background-color: #bfbfbf;
}

.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
