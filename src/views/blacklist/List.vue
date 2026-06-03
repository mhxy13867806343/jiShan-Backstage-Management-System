<template>
  <div class="blacklist-container animate-fade-in">
    <!-- Header -->
    <div class="blacklist-header-bar">
      <h2>黑名单管理 (Blacklist Settings)</h2>
      <p class="subtitle-text">管理系统中的封禁 IP 列表、账号黑名单与设备物理识别码封禁记录。</p>
    </div>

    <!-- Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="封禁类型">
          <el-select v-model="searchForm.type" placeholder="全部类型" clearable style="width: 140px;">
            <el-option label="全部" value="" />
            <el-option label="IP地址" value="ip" />
            <el-option label="用户账号" value="user" />
            <el-option label="设备标识" value="device" />
          </el-select>
        </el-form-item>

        <el-form-item label="封禁目标">
          <el-input v-model="searchForm.target" placeholder="IP / 账号ID / 设备ID" clearable style="width: 220px;" />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option label="生效中" value="active" />
            <el-option label="已解封" value="unbanned" />
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
          <el-button type="primary" :icon="Plus" @click="openAddDialog">新增封禁</el-button>
        </div>
        <div class="toolbar-right">
          <span class="stats-text">
            当前共有 <b>{{ totalCount }}</b> 条封禁记录 (生效中 <b>{{ activeCount }}</b>)
          </span>
        </div>
      </div>

      <el-table :data="pagedData" style="width: 100%" v-loading="loading">
        <el-table-column label="类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="target" label="封禁目标" min-width="180">
          <template #default="{ row }">
            <code class="target-code font-mono">{{ row.target }}</code>
          </template>
        </el-table-column>

        <el-table-column prop="reason" label="封禁原因" min-width="220" show-overflow-tooltip />

        <el-table-column prop="operator" label="操作人" width="110" align="center" />

        <el-table-column prop="time" label="封禁时间" width="160" align="center" />

        <el-table-column label="有效期至" width="160" align="center">
          <template #default="{ row }">
            <span v-if="row.expiry === 'Permanent'" class="permanent-text">永久有效</span>
            <span v-else>{{ row.expiry }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'danger' : 'info'" effect="light">
              <span class="status-dot" :class="row.status === 'active' ? 'danger' : 'info'"></span>
              {{ row.status === 'active' ? '生效中' : '已解封' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-if="row.status === 'active'" 
              size="small" 
              type="success" 
              plain 
              :icon="Unlock" 
              @click="handleLiftBlock(row)"
            >
              解封
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
        :page-sizes="[5, 10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- Add Block Modal Dialog -->
    <el-dialog v-model="dialogVisible" title="新增系统封禁记录" width="480px" destroy-on-close>
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px" label-position="left">
        <el-form-item label="封禁类型" prop="type">
          <el-radio-group v-model="addForm.type">
            <el-radio label="ip">IP地址</el-radio>
            <el-radio label="user">用户账号</el-radio>
            <el-radio label="device">设备标识</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="封禁目标" prop="target">
          <el-input 
            v-model="addForm.target" 
            :placeholder="getTargetPlaceholder(addForm.type)"
            clearable
          />
        </el-form-item>

        <el-form-item label="有效期限" prop="expiryType">
          <el-radio-group v-model="addForm.expiryType">
            <el-radio label="7d">7天</el-radio>
            <el-radio label="30d">30天</el-radio>
            <el-radio label="permanent">永久</el-radio>
            <el-radio label="custom">自定义</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item 
          label="过期时间" 
          prop="customExpiry" 
          v-if="addForm.expiryType === 'custom'"
        >
          <el-date-picker
            v-model="addForm.customExpiry"
            type="datetime"
            placeholder="选择过期时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%;"
          />
        </el-form-item>

        <el-form-item label="封禁原因" prop="reason">
          <el-input 
            v-model="addForm.reason" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入添加此封禁记录的具体原因，以作为安全审计凭证" 
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAddForm">确定封禁</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Search, Refresh, Unlock, Delete } from '@element-plus/icons-vue'

const loading = ref(false)
const dialogVisible = ref(false)
const addFormRef = ref<FormInstance>()

const searchForm = reactive({
  type: '',
  target: '',
  status: ''
})

const addForm = ref({
  type: 'ip',
  target: '',
  expiryType: 'permanent',
  customExpiry: '',
  reason: ''
})

const validateTarget = (_rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error('请输入需要封禁的目标值'))
  }
  if (addForm.value.type === 'ip') {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipPattern.test(value)) {
      return callback(new Error('请输入格式正确的 IPv4 地址'))
    }
  }
  callback()
}

const addRules = {
  type: [{ required: true, message: '请选择封禁类型', trigger: 'change' }],
  target: [{ required: true, validator: validateTarget, trigger: 'blur' }],
  expiryType: [{ required: true, message: '请选择有效期限', trigger: 'change' }],
  customExpiry: [{ required: true, message: '请选择自定义过期时间', trigger: 'change' }],
  reason: [{ required: true, message: '请输入封禁原因', trigger: 'blur' }]
}

const allRecords = ref<any[]>([])
const currentPage = ref(1)
const pageSize = ref(10)

// Seed standard professional mock records
const seedMockData = () => {
  const localData = localStorage.getItem('admin_blacklist_records')
  if (localData) {
    try {
      allRecords.value = JSON.parse(localData)
      return
    } catch (e) {
      console.error('Failed to parse blacklists localStorage data', e)
    }
  }

  const mocks = [
    {
      id: 'bl_1',
      type: 'ip',
      target: '192.168.10.45',
      reason: '频发灌水发贴，内容涉嫌垃圾广告投放',
      operator: 'admin',
      time: '2026-06-02 10:00:00',
      expiry: 'Permanent',
      status: 'active'
    },
    {
      id: 'bl_2',
      type: 'ip',
      target: '203.0.113.195',
      reason: '频发接口请求，涉嫌恶意扫描端口和爆破漏洞',
      operator: 'admin',
      time: '2026-06-02 12:45:00',
      expiry: '2026-06-09 12:45:00',
      status: 'active'
    },
    {
      id: 'bl_3',
      type: 'user',
      target: 'usr_log_check',
      reason: '违规发布侵权与敏感有害政治信息',
      operator: 'system',
      time: '2026-06-01 16:30:00',
      expiry: 'Permanent',
      status: 'active'
    },
    {
      id: 'bl_4',
      type: 'device',
      target: 'DEV_7c8d9e2b10a',
      reason: '检测到同一物理硬件下存在批量恶意注册行为',
      operator: 'admin',
      time: '2026-05-30 08:15:00',
      expiry: '2026-06-30 08:15:00',
      status: 'active'
    },
    {
      id: 'bl_5',
      type: 'ip',
      target: '198.51.100.8',
      reason: '多次尝试爆破管理员登录密码失败',
      operator: 'admin',
      time: '2026-05-25 14:00:00',
      expiry: '2026-06-25 14:00:00',
      status: 'unbanned'
    }
  ]
  allRecords.value = mocks
  saveToLocalStorage()
}

const saveToLocalStorage = () => {
  localStorage.setItem('admin_blacklist_records', JSON.stringify(allRecords.value))
}

const filteredData = computed(() => {
  return allRecords.value.filter(item => {
    // Type Filter
    if (searchForm.type && item.type !== searchForm.type) return false
    // Target Filter
    if (searchForm.target && !item.target.toLowerCase().includes(searchForm.target.toLowerCase())) return false
    // Status Filter
    if (searchForm.status && item.status !== searchForm.status) return false
    return true
  }).sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
})

const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const totalCount = computed(() => filteredData.value.length)
const activeCount = computed(() => allRecords.value.filter(x => x.status === 'active').length)

const handleSearch = () => {
  currentPage.value = 1
}

const handleReset = () => {
  searchForm.type = ''
  searchForm.target = ''
  searchForm.status = ''
  currentPage.value = 1
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const openAddDialog = () => {
  addForm.value = {
    type: 'ip',
    target: '',
    expiryType: 'permanent',
    customExpiry: '',
    reason: ''
  }
  dialogVisible.value = true
}

const submitAddForm = async () => {
  if (!addFormRef.value) return
  await addFormRef.value.validate((valid) => {
    if (valid) {
      let expiryStr = 'Permanent'
      if (addForm.value.expiryType === '7d') {
        const d = new Date()
        d.setDate(d.getDate() + 7)
        expiryStr = d.toISOString().replace('T', ' ').substring(0, 19)
      } else if (addForm.value.expiryType === '30d') {
        const d = new Date()
        d.setDate(d.getDate() + 30)
        expiryStr = d.toISOString().replace('T', ' ').substring(0, 19)
      } else if (addForm.value.expiryType === 'custom') {
        expiryStr = addForm.value.customExpiry
      }

      const newRecord = {
        id: 'bl_' + Date.now(),
        type: addForm.value.type,
        target: addForm.value.target.trim(),
        reason: addForm.value.reason.trim(),
        operator: 'admin',
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        expiry: expiryStr,
        status: 'active'
      }

      allRecords.value.unshift(newRecord)
      saveToLocalStorage()
      dialogVisible.value = false
      ElMessage.success('封禁成功，已加入黑名单')
    }
  })
}

const handleLiftBlock = (row: any) => {
  ElMessageBox.confirm(
    `确定要<b>解封</b>封禁目标为 "<b>${row.target}</b>" 的记录吗？`,
    '解封提示',
    {
      confirmButtonText: '确定解封',
      cancelButtonText: '取消',
      type: 'warning',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    const item = allRecords.value.find(x => x.id === row.id)
    if (item) {
      item.status = 'unbanned'
      saveToLocalStorage()
      ElMessage.success('目标解封成功')
    }
  }).catch(() => {})
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要<b>彻底删除</b>此条封禁审计记录吗？<br/><span style="color:#f56c6c;font-size:12px;">此操作将永久移除安全记录，不可逆。</span>`,
    '危险警告',
    {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'error',
      dangerouslyUseHTMLString: true
    }
  ).then(() => {
    allRecords.value = allRecords.value.filter(x => x.id !== row.id)
    saveToLocalStorage()
    ElMessage.success('记录删除成功')
  }).catch(() => {})
}

const getTypeTag = (type: string) => {
  if (type === 'ip') return 'success'
  if (type === 'user') return 'primary'
  return 'warning'
}

const getTypeLabel = (type: string) => {
  if (type === 'ip') return 'IP地址'
  if (type === 'user') return '用户账号'
  return '设备标识'
}

const getTargetPlaceholder = (type: string) => {
  if (type === 'ip') return '例如 192.168.1.1'
  if (type === 'user') return '请输入受限用户账号 ID'
  return '请输入封禁设备物理标识码(UUID/IMEI)'
}

onMounted(() => {
  seedMockData()
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
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  border: 1px solid #e8e8e8;
  color: #f5222d;
}

.permanent-text {
  font-weight: 600;
  color: #cf1322;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
}

.status-dot.danger {
  background-color: #ff4d4f;
  box-shadow: 0 0 4px #ff4d4f;
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
