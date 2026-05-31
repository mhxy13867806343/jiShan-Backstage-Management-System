<template>
  <div class="ann-list-container">

    <!-- Header -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>公告列表</h2>
        <p>管理所有 App 内推送公告，支持新增、编辑、批量上下架操作。</p>
      </div>
      <el-button type="primary" icon="Plus" @click="openDialog()">新增公告</el-button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar premium-card">
      <el-input v-model="searchKw" placeholder="搜索标题/内容" prefix-icon="Search" clearable style="width: 220px" @input="currentPage = 1" />
      <el-select v-model="filterType" placeholder="类型" clearable style="width: 130px" @change="currentPage = 1">
        <el-option label="普通通知" value="info" />
        <el-option label="重要提醒" value="warning" />
        <el-option label="紧急公告" value="danger" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="currentPage = 1">
        <el-option label="已发布" value="active" />
        <el-option label="已停用" value="inactive" />
      </el-select>
      <el-button icon="RefreshLeft" @click="resetFilters">重置</el-button>
    </div>

    <!-- Table Card -->
    <div class="table-card premium-card">

      <!-- Toolbar -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="success" plain icon="VideoPlay" :disabled="selectedIds.length === 0" @click="handleBatchPublish">
            批量发布 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
          </el-button>
          <el-button type="warning" plain icon="VideoPause" :disabled="selectedIds.length === 0" @click="handleBatchDisable">
            批量停用 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
          </el-button>
          <el-button type="danger" plain icon="Delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            批量删除 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
          </el-button>
        </div>
      </div>

      <!-- Batch Action Bar -->
      <div class="batch-action-bar" v-if="selectedIds.length > 0">
        <el-icon><InfoFilled /></el-icon>
        <span>已选 <b>{{ selectedIds.length }}</b> 个公告（支持跨页保留选择）</span>
        <el-button size="small" @click="clearSelection">清除选择</el-button>
      </div>

      <!-- Table with Cross-page selection column -->
      <el-table :data="paginatedList" stripe style="width: 100%">
        
        <!-- Checkbox column -->
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
              :model-value="selectedIds.includes(row.id)"
              @change="(val: boolean) => toggleSelect(row.id, val)"
            />
          </template>
        </el-table-column>

        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="typeTagMap[row.type]" effect="light">{{ typeLabel(row.type) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="公告标题" min-width="200">
          <template #default="{ row }">
            <div class="title-cell">
              <span class="ann-title">{{ row.title }}</span>
              <el-tag v-if="row.pinned" size="small" type="warning" effect="plain" style="margin-left:6px">置顶</el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="公告内容（摘要）" min-width="220">
          <template #default="{ row }">
            <!-- Strip html tags for preview -->
            <span class="content-preview">{{ stripHtml(row.content) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="生效时间" width="155" align="center" prop="startTime" />
        <el-table-column label="结束时间" width="155" align="center">
          <template #default="{ row }">
            <span>{{ row.endTime || '--' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'" round>
              {{ row.status === 'active' ? '已发布' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="230" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" icon="Edit" @click="openDialog(row)">编辑</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'warning' : 'success'"
              :icon="row.status === 'active' ? 'VideoPause' : 'VideoPlay'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 'active' ? '停用' : '发布' }}
            </el-button>
            <el-popconfirm title="确认删除该公告？" @confirm="deleteAnn(row.id)">
              <template #reference>
                <el-button size="small" type="danger" icon="Delete" />
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100, 200, 300]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Add/Edit Dialog — full width rich text -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑公告' : '新增公告'"
      width="780px"
      destroy-on-close
      @close="destroyEditor"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="16">
            <el-form-item label="公告标题" prop="title">
              <el-input v-model="form.title" maxlength="50" show-word-limit placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公告类型">
              <el-select v-model="form.type" style="width:100%">
                <el-option label="普通通知" value="info" />
                <el-option label="重要提醒" value="warning" />
                <el-option label="紧急公告" value="danger" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="是否置顶">
              <el-switch v-model="form.pinned" active-text="置顶" inactive-text="不置顶" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="发布状态">
              <el-switch v-model="form.statusActive" active-text="立即发布" inactive-text="草稿" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="生效时间">
              <el-date-picker v-model="form.startTime" type="datetime" placeholder="开始时间"
                format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时间">
              <el-date-picker v-model="form.endTime" type="datetime" placeholder="不填则永久有效"
                format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="跳转链接">
          <el-input v-model="form.link" placeholder="可选，点击跳转链接" clearable />
        </el-form-item>

        <!-- Rich Text Editor -->
        <el-form-item label="公告正文" prop="content">
          <div class="wang-editor-wrap">
            <Toolbar :editor="dialogEditorRef" :defaultConfig="toolbarConfig" mode="default" class="wang-toolbar" />
            <Editor
              v-model="form.content"
              :defaultConfig="editorConfig"
              mode="default"
              class="wang-editor-body"
              @onCreated="handleDialogEditorCreated"
            />
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSubmit">
          {{ editingId ? '保存修改' : '创建公告' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, shallowRef, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { usePagination } from '@/hooks/usePagination'
import { useTableSelection } from '@/hooks/useTableSelection'
import { adminApi, type ApiAnnouncement } from '@/api/admin'

// ── Types ────────────────────────────────────────────────────────
type AnnItem = ApiAnnouncement

// ── WangEditor (dialog instance) ─────────────────────────────────
const dialogEditorRef = shallowRef<IDomEditor>()
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['uploadVideo', 'insertVideo', 'group-video']
}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入公告正文内容（支持富文本格式）...',
  autoFocus: false,
}
const handleDialogEditorCreated = (editor: IDomEditor) => { dialogEditorRef.value = editor }
const destroyEditor = () => { dialogEditorRef.value?.destroy(); dialogEditorRef.value = undefined }

// ── Helper: strip html for table preview ─────────────────────────
const stripHtml = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').slice(0, 80)
}

// ── API State & Loader ───────────────────────────────────────────
const list = ref<AnnItem[]>([])
const loading = ref(false)

const fetchAnnouncements = async () => {
  loading.value = true
  try {
    const res = await adminApi.getAnnouncements({
      page: 1,
      limit: 9999
    })
    list.value = res.list
  } catch (err) {
    console.error('Fetch announcements failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAnnouncements()
})

// ── Filters ──────────────────────────────────────────────────────
const searchKw = ref('')
const filterType = ref('')
const filterStatus = ref('')

const filteredList = computed(() => {
  const kw = searchKw.value.toLowerCase()
  return list.value.filter(a => {
    const plain = stripHtml(a.content)
    const matchKw = !kw || a.title.toLowerCase().includes(kw) || plain.toLowerCase().includes(kw)
    const matchType = !filterType.value || a.type === filterType.value
    const matchStatus = !filterStatus.value || a.status === filterStatus.value
    return matchKw && matchType && matchStatus
  })
})

const resetFilters = () => {
  searchKw.value = ''
  filterType.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

// ── Shared Composable hooks: Pagination ───────────────────────────
const {
  currentPage,
  pageSize,
  handleSizeChange,
  handleCurrentChange,
  getPaginatedList
} = usePagination(10) // default 10 per page

const totalCount = computed(() => filteredList.value.length)

const paginatedList = computed(() => getPaginatedList(filteredList.value))

// ── Shared Composable hooks: Table Selection ─────────────────────
const {
  selectedIds,
  toggleSelect,
  clearSelection,
  getSelectionHandlers
} = useTableSelection<AnnItem>((row) => row.id)

const {
  isCurrentPageAllSelected,
  isCurrentPageIndeterminate,
  handleSelectCurrentPage
} = getSelectionHandlers(paginatedList) // Pass ComputedRef directly for perfect reactivity!

// Watch filters to clear selections
watch([searchKw, filterType, filterStatus], () => {
  clearSelection()
})

// ── Bulk Actions ──────────────────────────────────────────────────
const handleBatchPublish = () => {
  ElMessageBox.confirm(
    `确定要批量发布选中的 ${selectedIds.value.length} 个公告吗？`,
    '系统提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    await adminApi.batchPublishAnnouncements(selectedIds.value)
    ElMessage.success('批量发布成功')
    clearSelection()
    fetchAnnouncements()
  }).catch(() => {})
}

const handleBatchDisable = () => {
  ElMessageBox.confirm(
    `确定要批量停用选中的 ${selectedIds.value.length} 个公告吗？`,
    '系统提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    await adminApi.batchDisableAnnouncements(selectedIds.value)
    ElMessage.success('批量停用成功')
    clearSelection()
    fetchAnnouncements()
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要批量删除选中的 ${selectedIds.value.length} 个公告吗？此操作不可逆！`,
    '安全警告',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(async () => {
    await adminApi.batchDeleteAnnouncements(selectedIds.value)
    ElMessage.success('批量删除成功')
    clearSelection()
    currentPage.value = 1
    fetchAnnouncements()
  }).catch(() => {})
}

// ── Helpers ──────────────────────────────────────────────────────
const typeTagMap: Record<string, string> = { info: '', warning: 'warning', danger: 'danger' }
const typeLabel = (t: string) => ({ info: '普通通知', warning: '重要提醒', danger: '紧急公告' }[t] || t)

// ── CRUD ─────────────────────────────────────────────────────────
const dialogVisible = ref(false)
const editingId = ref('')
const saving = ref(false)
const formRef = ref<FormInstance>()

const blankForm = () => ({
  title: '', type: 'info' as const, content: '',
  link: '', pinned: false,
  startTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
  endTime: '', statusActive: true,
})

const form = reactive(blankForm())

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [
    {
      validator: (_: any, value: string, callback: Function) => {
        if (!value || value === '<p><br></p>') callback(new Error('请输入公告正文内容'))
        else callback()
      },
      trigger: 'blur'
    }
  ],
}

const openDialog = (row?: AnnItem) => {
  editingId.value = row?.id || ''
  if (row) {
    Object.assign(form, { ...row, statusActive: row.status === 'active' })
  } else {
    Object.assign(form, blankForm())
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!form.content || form.content === '<p><br></p>') {
    ElMessage.warning('请输入公告正文内容')
    return
  }
  saving.value = true
  try {
    const payload: Partial<ApiAnnouncement> = {
      ...form,
      status: form.statusActive ? ('active' as const) : ('inactive' as const)
    }
    if (editingId.value) {
      payload.id = editingId.value
    }
    await adminApi.saveAnnouncement(payload)
    ElMessage.success(editingId.value ? '公告已更新' : '公告已创建')
    dialogVisible.value = false
    fetchAnnouncements()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

const toggleStatus = async (row: AnnItem) => {
  const newStatus = row.status === 'active' ? 'inactive' : 'active'
  try {
    await adminApi.saveAnnouncement({ id: row.id, status: newStatus })
    ElMessage.success(newStatus === 'active' ? '公告已发布' : '公告已停用')
    fetchAnnouncements()
  } catch (err) {
    console.error(err)
  }
}

const deleteAnn = async (id: string) => {
  try {
    await adminApi.deleteAnnouncement(id)
    ElMessage.success('已删除')
    fetchAnnouncements()
  } catch (err) {
    console.error(err)
  }
}
</script>

<style>
/* WangEditor global (cannot be scoped) */
.ann-wang-toolbar { border-bottom: 1px solid #e2e8f0 !important; background: #f8fafc !important; border-radius: 8px 8px 0 0; }
.ann-wang-editor  { height: 260px !important; overflow-y: auto; font-size: 14px; }
</style>

<style scoped>
.ann-list-container { display: flex; flex-direction: column; gap: 16px; }

.page-header {
  display: flex; justify-content: space-between; align-items: center; padding: 20px 24px;
}
.header-left h2 { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 3px; }
.header-left p  { font-size: 13px; color: var(--text-muted); }

.filter-bar {
  display: flex; align-items: center; gap: 12px; padding: 14px 20px; flex-wrap: wrap;
}

.table-card { padding: 24px; overflow: hidden; }

/* ── Toolbar ── */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 10px;
  flex-wrap: wrap;
}
.toolbar-left {
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

.title-cell { display: flex; align-items: center; }
.ann-title  { font-weight: 600; color: var(--text-main); }

.content-preview {
  font-size: 12px; color: var(--text-muted);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

/* ── Pagination ── */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* ── Rich text editor in dialog ── */
.wang-editor-wrap {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.wang-toolbar {
  border-bottom: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
}

.wang-editor-body {
  height: 260px !important;
  overflow-y: auto;
  font-size: 14px;
}
</style>
