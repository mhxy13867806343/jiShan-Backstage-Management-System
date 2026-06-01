<template>
  <div class="message-container">
    <!-- Breadcrumb & Header Panel -->
    <div class="page-header-box">
      <div class="header-left">
        <h2>系统消息推送中心</h2>
        <p class="subtitle-text">管理即闪 App 的公告板、系统预警、安全防骗提醒与新手指引通知。</p>
      </div>
      <div class="header-right">
        <el-button v-role="['superadmin', 'admin']" type="primary" class="push-btn" @click="handleCreate">
          <el-icon><Position /></el-icon>
          <span>新增推送公告</span>
        </el-button>
      </div>
    </div>

    <!-- Search query filter panel -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="queryParams" class="demo-form-inline" size="default">
        <el-form-item label="消息标题">
          <el-input 
            v-model="queryParams.title" 
            placeholder="请输入消息标题关键字" 
            clearable 
            class="filter-input"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="消息类型">
          <el-select v-model="queryParams.type" placeholder="全部类型" clearable class="filter-select">
            <el-option label="系统通知" value="notification" />
            <el-option label="平台公告" value="announcement" />
            <el-option label="安全警示" value="alert" />
            <el-option label="防骗预警" value="antifraud" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布状态">
          <el-select v-model="queryParams.status" placeholder="全部状态" clearable class="filter-select">
            <el-option label="草稿" value="0" />
            <el-option label="已发送" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>搜索</span>
          </el-button>
          <el-button @click="resetQuery">
            <el-icon><Refresh /></el-icon>
            <span>重置</span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Toolbar operations -->
    <div class="toolbar-box">
      <div class="left-actions">
        <el-button 
          v-role="['superadmin', 'admin']"
          type="danger" 
          plain 
          :disabled="selectedIds.length === 0" 
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon>
          <span>批量删除 ({{ selectedIds.length }})</span>
        </el-button>
        <el-button 
          v-role="['superadmin', 'admin']"
          v-if="hasDrafts"
          type="success" 
          plain 
          :disabled="selectedDrafts.length === 0"
          @click="handleBatchPublish"
        >
          <el-icon><Finished /></el-icon>
          <span>批量推送发布 ({{ selectedDrafts.length }})</span>
        </el-button>
      </div>
      <div class="right-stats">
        <span class="total-badge">
          总消息: <b>{{ total }}</b> 条
        </span>
      </div>
    </div>

    <!-- Data Table Card Grid -->
    <el-card class="table-card" shadow="never">
      <el-table 
        v-loading="loading" 
        :data="paginatedData" 
        style="width: 100%" 
        @selection-change="handleSelectionChange"
        border
        class="custom-table"
      >
        <el-table-column type="selection" width="50" align="center" />
        
        <el-table-column prop="message_id" label="消息编号" width="90" align="center" />
        
        <el-table-column prop="title" label="消息标题" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="message-title-text">{{ row.title }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="type" label="消息类型" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" effect="light" class="type-tag">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="target" label="推送目标群组" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.target === 'all' ? 'primary' : row.target === 'active' ? 'success' : 'warning'" effect="plain">
              {{ getTargetLabel(row.target) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="消息内容" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-secondary">{{ row.content }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '1' ? 'success' : 'info'" effect="dark">
              {{ row.status === '1' ? '已推送' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="pubTime" label="发布时间" width="160" align="center" />

        <!-- Operations column -->
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <div class="operation-actions">
              <!-- Switch Status (Publish/Retract) -->
              <el-button 
                v-role="['superadmin', 'admin']"
                v-if="row.status === '0'"
                type="success" 
                link 
                size="small" 
                @click="togglePublish(row)"
              >
                <el-icon class="btn-icon"><Position /></el-icon>推送
              </el-button>
              <el-button 
                v-role="['superadmin', 'admin']"
                v-else
                type="warning" 
                link 
                size="small" 
                @click="togglePublish(row)"
              >
                <el-icon class="btn-icon"><Close /></el-icon>撤回
              </el-button>

              <el-button 
                v-role="['superadmin', 'admin']"
                type="primary" 
                link 
                size="small" 
                @click="handleEdit(row)"
              >
                <el-icon class="btn-icon"><Edit /></el-icon>编辑
              </el-button>

              <el-button 
                v-role="['superadmin', 'admin']"
                type="danger" 
                link 
                size="small" 
                @click="handleDelete(row)"
              >
                <el-icon class="btn-icon"><Delete /></el-icon>删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination Footer -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="GLOBAL_PAGE_SIZES"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Push / Edit announcement modal dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'create' ? '新增系统推送消息' : '编辑系统推送消息'"
      width="560px"
      destroy-on-close
      class="custom-dialog"
    >
      <el-form 
        ref="formRef" 
        :model="formModel" 
        :rules="formRules" 
        label-width="100px" 
        label-position="right"
        class="dialog-form"
      >
        <el-form-item label="消息标题" prop="title">
          <el-input v-model="formModel.title" placeholder="请输入公告或警告标题" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="消息类型" prop="type">
          <el-radio-group v-model="formModel.type">
            <el-radio-button value="notification">通知</el-radio-button>
            <el-radio-button value="announcement">公告</el-radio-button>
            <el-radio-button value="alert">警告</el-radio-button>
            <el-radio-button value="antifraud">防骗预警</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="目标群组" prop="target">
          <el-select v-model="formModel.target" placeholder="选择接收用户群" style="width: 100%">
            <el-option label="所有注册用户" value="all" />
            <el-option label="活跃登录用户" value="active" />
            <el-option label="新注册用户 (3天内)" value="new" />
          </el-select>
        </el-form-item>

        <el-form-item label="直接推送" prop="status">
          <el-switch 
            v-model="formModel.status" 
            active-value="1" 
            inactive-value="0"
            active-text="推送至 App (已发布)" 
            inactive-text="保存为草稿" 
          />
        </el-form-item>

        <el-form-item label="消息内容" prop="content">
          <el-input 
            v-model="formModel.content" 
            type="textarea" 
            :rows="6" 
            placeholder="请输入具体的消息内容。若为防骗预警，请说明诈骗手法和防御技巧。内容会同步呈现在用户 App 信息公告栏。" 
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确认保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { adminApi, type ApiSysMessage } from '@/api/admin'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Search, Refresh, Delete, Edit, Position, Close, Finished } from '@element-plus/icons-vue'

type MessageItem = ApiSysMessage

const loading = ref(false)
const submitLoading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref<'create' | 'edit'>('create')
const selectedIds = ref<string[]>([])
const messagesList = ref<MessageItem[]>([])

import { GLOBAL_PAGE_SIZE, GLOBAL_PAGE_SIZES } from '@/hooks/usePagination'

// Pagination
const currentPage = ref(1)
const pageSize = ref(GLOBAL_PAGE_SIZE)

// Query params
const queryParams = reactive({
  title: '',
  type: '',
  status: ''
})

// Form instance & fields
const formRef = ref<FormInstance>()
const editingId = ref<string>('')
const formModel = reactive({
  title: '',
  type: 'notification' as 'notification' | 'announcement' | 'alert' | 'antifraud',
  target: 'all' as 'all' | 'active' | 'new',
  status: '0' as '0' | '1',
  content: ''
})

// Validation rules
const formRules = {
  title: [
    { required: true, message: '请输入消息标题', trigger: 'blur' },
    { min: 3, max: 50, message: '标题长度应在 3 到 50 个字符之间', trigger: 'blur' }
  ],
  type: [{ required: true, message: '请选择消息类型', trigger: 'change' }],
  target: [{ required: true, message: '请选择推送目标群组', trigger: 'change' }],
  content: [
    { required: true, message: '请输入消息内容', trigger: 'blur' },
    { min: 10, max: 300, message: '内容应在 10 到 300 个字符之间', trigger: 'blur' }
  ]
}

const total = ref(0)

const fetchMessages = async () => {
  loading.value = true
  try {
    const res = await adminApi.getMessages({
      keyword: queryParams.title,
      type: queryParams.type,
      status: queryParams.status,
      page: currentPage.value,
      limit: pageSize.value
    })
    messagesList.value = res.list
    total.value = res.total
  } catch (err) {
    console.error('Fetch messages failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMessages()
})

const paginatedData = computed(() => {
  return messagesList.value
})

const hasDrafts = computed(() => {
  return messagesList.value.some(item => item.status === '0')
})

const selectedDrafts = computed(() => {
  return messagesList.value.filter(item => selectedIds.value.includes(item.message_id) && item.status === '0')
})

// Helpers for tags UI representation
const getTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    notification: '系统通知',
    announcement: '平台公告',
    alert: '安全警示',
    antifraud: '防骗预警'
  }
  return map[type] || type
}

const getTypeTag = (type: string) => {
  const map: Record<string, string> = {
    notification: 'info',
    announcement: 'success',
    alert: 'warning',
    antifraud: 'danger'
  }
  return map[type] || 'info'
}

const getTargetLabel = (target: string) => {
  const map: Record<string, string> = {
    all: '全量注册用户',
    active: '活跃登录用户',
    new: '新注册用户'
  }
  return map[target] || target
}

// Query operations
const handleSearch = () => {
  currentPage.value = 1
  fetchMessages()
}

const resetQuery = () => {
  queryParams.title = ''
  queryParams.type = ''
  queryParams.status = ''
  currentPage.value = 1
  fetchMessages()
}

// Table events
// All rows are selectable to support batch deletion

const handleSelectionChange = (selection: MessageItem[]) => {
  selectedIds.value = selection.map(item => item.message_id)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchMessages()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchMessages()
}

// CRUD Methods
const handleCreate = () => {
  dialogType.value = 'create'
  editingId.value = ''
  formModel.title = ''
  formModel.type = 'notification'
  formModel.target = 'all'
  formModel.status = '1' // Default direct push
  formModel.content = ''
  dialogVisible.value = true
}

const handleEdit = (row: MessageItem) => {
  dialogType.value = 'edit'
  editingId.value = row.message_id
  formModel.title = row.title
  formModel.type = row.type
  formModel.target = row.target
  formModel.status = row.status
  formModel.content = row.content
  dialogVisible.value = true
}

const handleDelete = (row: MessageItem) => {
  ElMessageBox.confirm(
    `确定要永久删除这条编号为 "${row.message_id}" 的消息吗？删除后 App 前台用户将无法在通知中心查看到该消息。`,
    '安全警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await adminApi.deleteMessage(row.message_id)
      ElMessage.success('系统消息已成功删除')
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

// Batch Retract/Delete
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return
  ElMessageBox.confirm(
    `确定要批量删除这 ${selectedIds.value.length} 条推送消息吗？删除后不可撤销！`,
    '警告',
    {
      confirmButtonText: '确定批量删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      for (const id of selectedIds.value) {
        await adminApi.deleteMessage(id)
      }
      ElMessage.success('批量删除消息成功')
      selectedIds.value = []
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const handleBatchPublish = () => {
  if (selectedDrafts.value.length === 0) return
  const draftIds = selectedDrafts.value.map(item => item.message_id)
  ElMessageBox.confirm(
    `确定要批量将这 ${draftIds.length} 条草稿状态的消息立即推送至前台 App 吗？`,
    '推送确认',
    {
      confirmButtonText: '确认发布',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(async () => {
    try {
      for (const id of draftIds) {
        await adminApi.updateMessage(id, { status: '1', pubTime: new Date().toISOString().replace('T', ' ').substring(0, 19) })
      }
      ElMessage.success('批量推送发布成功')
      selectedIds.value = []
      fetchMessages()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

// Toggle publication
const togglePublish = async (row: MessageItem) => {
  const newStatus = row.status === '1' ? '0' : '1'
  const actionText = newStatus === '1' ? '推送发布' : '下架撤回'
  
  try {
    await adminApi.updateMessage(row.message_id, {
      status: newStatus,
      pubTime: newStatus === '1' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : row.pubTime
    })
    ElMessage.success(`系统消息已成功${actionText}`)
    fetchMessages()
  } catch (err) {
    console.error(err)
  }
}

// Save form values
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (dialogType.value === 'create') {
          await adminApi.addMessage({
            title: formModel.title,
            content: formModel.content,
            type: formModel.type,
            target: formModel.target,
            status: formModel.status,
            pubTime: formModel.status === '1' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : '暂未发布'
          })
          ElMessage.success('系统新推送消息已成功创建并保存！')
        } else {
          await adminApi.updateMessage(editingId.value, {
            title: formModel.title,
            content: formModel.content,
            type: formModel.type,
            target: formModel.target,
            status: formModel.status,
            pubTime: formModel.status === '1' ? new Date().toISOString().replace('T', ' ').substring(0, 19) : '暂未发布'
          })
          ElMessage.success('推送消息配置已成功更新')
        }
        dialogVisible.value = false
        fetchMessages()
      } catch (err) {
        console.error(err)
      } finally {
        submitLoading.value = false
      }
    }
  })
}
</script>

<style scoped>
.message-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Page Header Panel Styling */
.page-header-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  background-color: #ffffff;
  padding: 16px 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.page-header-box h2 {
  font-size: 18px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}

.subtitle-text {
  font-size: 13px;
  color: #8c8c8c;
}

.push-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

/* Filter Card Panel */
.filter-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
}

.filter-input {
  width: 220px;
}

.filter-select {
  width: 150px;
}

.demo-form-inline :deep(.el-form-item) {
  margin-bottom: 0 !important;
  margin-right: 20px !important;
}

/* Toolbar Box */
.toolbar-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-actions {
  display: flex;
  gap: 10px;
}

.right-stats {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.45);
}

.total-badge {
  background-color: #f5f5f5;
  padding: 6px 12px;
  border-radius: 4px;
  color: #666;
  border: 1px solid #e8e8e8;
}

.total-badge b {
  color: #1890ff;
  font-size: 14px;
}

/* Table grid styles */
.table-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
}

.table-card :deep(.el-card__body) {
  padding: 16px !important;
}

.custom-table {
  border-radius: 4px;
  overflow: hidden;
}

.message-title-text {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.text-secondary {
  color: #5c5c5c;
  font-size: 13px;
}

.type-tag {
  font-weight: 600;
  border-radius: 2px;
}

.operation-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  margin-right: 2px;
  vertical-align: middle;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* Dialog Form Styling */
.dialog-form {
  padding: 10px 10px 0;
}

.custom-dialog :deep(.el-dialog__header) {
  padding: 16px 20px !important;
  margin-right: 0 !important;
  border-bottom: 1px solid #f0f0f0 !important;
}

.custom-dialog :deep(.el-dialog__title) {
  font-size: 16px !important;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
}

.custom-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px !important;
  border-top: 1px solid #f0f0f0 !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
