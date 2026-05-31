<template>
  <div class="ann-list-container">

    <!-- Header -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>公告列表</h2>
        <p>管理所有 App 内推送公告，支持新增、编辑、上下架操作。</p>
      </div>
      <el-button type="primary" icon="Plus" @click="openDialog()">新增公告</el-button>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar premium-card">
      <el-input v-model="searchKw" placeholder="搜索标题/内容" prefix-icon="Search" clearable style="width: 220px" />
      <el-select v-model="filterType" placeholder="类型" clearable style="width: 130px">
        <el-option label="普通通知" value="info" />
        <el-option label="重要提醒" value="warning" />
        <el-option label="紧急公告" value="danger" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px">
        <el-option label="已发布" value="active" />
        <el-option label="已停用" value="inactive" />
      </el-select>
      <el-button icon="RefreshLeft" @click="resetFilters">重置</el-button>
    </div>

    <!-- Table -->
    <div class="table-card premium-card">
      <el-table :data="filteredList" stripe style="width: 100%">

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
import { ref, reactive, computed, shallowRef } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

// ── Types ────────────────────────────────────────────────────────
interface AnnItem {
  id: string
  title: string
  type: 'info' | 'warning' | 'danger'
  content: string
  link: string
  pinned: boolean
  startTime: string
  endTime: string
  status: 'active' | 'inactive'
}

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
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '').slice(0, 80)

// ── Mock data ────────────────────────────────────────────────────
const list = ref<AnnItem[]>([
  {
    id: 'N001',
    title: '【系统通知】即闪 App 6 月服务升级公告',
    type: 'info',
    content: '<p>我们将于 <strong>2026-06-01 凌晨 2:00-4:00</strong> 进行服务器维护升级，届时部分功能短暂不可用。</p>',
    link: '',
    pinned: true,
    startTime: '2026-05-31 00:00',
    endTime: '2026-06-02 00:00',
    status: 'active',
  },
  {
    id: 'N002',
    title: '【安全提醒】谨防虚假刷单诈骗',
    type: 'warning',
    content: '<p>近期出现冒充即闪平台的<strong>虚假刷单诈骗</strong>，请勿相信任何要求充值的信息，注意保护财产安全。</p>',
    link: 'https://jishanapp.com/safety',
    pinned: false,
    startTime: '2026-05-20 10:00',
    endTime: '',
    status: 'active',
  },
  {
    id: 'N003',
    title: '五一假期活动公告',
    type: 'info',
    content: '<p>五一假期即闪将开展特别活动，参与活动可获得<em>专属徽章</em>，欢迎积极参与！</p>',
    link: '',
    pinned: false,
    startTime: '2026-04-28 00:00',
    endTime: '2026-05-06 23:59',
    status: 'inactive',
  },
])

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

const resetFilters = () => { searchKw.value = ''; filterType.value = ''; filterStatus.value = '' }

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
  setTimeout(() => {
    if (editingId.value) {
      const item = list.value.find(a => a.id === editingId.value)
      if (item) Object.assign(item, { ...form, status: form.statusActive ? 'active' : 'inactive' })
      ElMessage.success('公告已更新')
    } else {
      list.value.unshift({
        id: 'N' + Date.now().toString().slice(-4),
        ...form,
        status: form.statusActive ? 'active' : 'inactive',
      })
      ElMessage.success('公告已创建')
    }
    dialogVisible.value = false
    saving.value = false
  }, 300)
}

const toggleStatus = (row: AnnItem) => {
  row.status = row.status === 'active' ? 'inactive' : 'active'
  ElMessage.success(row.status === 'active' ? '公告已发布' : '公告已停用')
}

const deleteAnn = (id: string) => {
  list.value = list.value.filter(a => a.id !== id)
  ElMessage.success('已删除')
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

.table-card { padding: 0; overflow: hidden; }

.title-cell { display: flex; align-items: center; }
.ann-title  { font-weight: 600; color: var(--text-main); }

.content-preview {
  font-size: 12px; color: var(--text-muted);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
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
