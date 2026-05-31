<template>
  <div class="version-container">

    <!-- Header -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>版本管理</h2>
        <p>管理 iOS / Android / HarmonyOS 客户端版本，配置强制更新与灰度发布。</p>
      </div>
      <el-button type="primary" icon="Plus" @click="openDialog()">新增版本</el-button>
    </div>

    <!-- Version Cards (Latest) -->
    <div class="latest-cards">
      <div class="latest-card premium-card" v-for="card in latestVersions" :key="card.platform">
        <div class="card-platform">
          <!-- Standard Icons for iOS / Android, Inline SVG for HarmonyOS -->
          <el-icon v-if="card.platform !== 'HarmonyOS'" class="platform-icon" :style="{ color: card.color }">
            <component :is="card.icon" />
          </el-icon>
          <span v-else class="harmony-svg-icon" :style="{ color: card.color }">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2.5" />
              <path d="M7 12H17" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
            </svg>
          </span>
          <span>{{ card.platform }}</span>
        </div>
        <div class="card-version">{{ card.version }}</div>
        <div class="card-sub">当前最新正式版</div>
        <el-tag :type="card.forceUpdate ? 'danger' : 'success'" size="small" effect="light">
          {{ card.forceUpdate ? '强制更新' : '可选更新' }}
        </el-tag>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="filter-bar premium-card">
      <el-select v-model="filterPlatform" placeholder="平台" clearable style="width: 140px" @change="currentPage = 1">
        <el-option label="iOS" value="iOS" />
        <el-option label="Android" value="Android" />
        <el-option label="HarmonyOS" value="HarmonyOS" />
      </el-select>
      <el-select v-model="filterStatus" placeholder="状态" clearable style="width: 120px" @change="currentPage = 1">
        <el-option label="已发布" value="released" />
        <el-option label="灰度中" value="beta" />
        <el-option label="已下线" value="deprecated" />
      </el-select>
      <el-select v-model="filterForce" placeholder="更新类型" clearable style="width: 130px" @change="currentPage = 1">
        <el-option label="强制更新" value="true" />
        <el-option label="可选更新" value="false" />
      </el-select>
      <el-button icon="RefreshLeft" @click="resetFilters">重置</el-button>
    </div>

    <!-- Table Card -->
    <div class="table-card premium-card">

      <!-- Toolbar -->
      <div class="table-toolbar">
        <div class="toolbar-left">
          <el-button type="warning" plain icon="SwitchButton" :disabled="selectedIds.length === 0" @click="handleBatchDeprecate">
            批量下线 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
          </el-button>
          <el-button type="danger" plain icon="Delete" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            批量删除 <span v-if="selectedIds.length > 0">({{ selectedIds.length }})</span>
          </el-button>
        </div>
      </div>

      <!-- Batch Action Bar -->
      <div class="batch-action-bar" v-if="selectedIds.length > 0">
        <el-icon><InfoFilled /></el-icon>
        <span>已选 <b>{{ selectedIds.length }}</b> 个版本记录（支持跨页保留选择）</span>
        <el-button size="small" @click="selectedIds = []">清除选择</el-button>
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

        <el-table-column label="平台" width="130" align="center">
          <template #default="{ row }">
            <div class="platform-cell">
              <!-- Element Icons for iOS / Android, Inline SVG for HarmonyOS -->
              <el-icon v-if="row.platform === 'iOS'" style="color: #000">
                <Apple />
              </el-icon>
              <el-icon v-else-if="row.platform === 'Android'" style="color: #3DDC84">
                <Android />
              </el-icon>
              <span v-else-if="row.platform === 'HarmonyOS'" class="harmony-svg-icon-table">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#0A59F7" stroke-width="2.5" />
                  <path d="M7 12H17" stroke="#0A59F7" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </span>
              <span>{{ row.platform }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="版本号" width="120" align="center">
          <template #default="{ row }">
            <span class="version-badge">v{{ row.version }}</span>
          </template>
        </el-table-column>

        <el-table-column label="Build号" width="110" align="center" prop="build" />

        <el-table-column label="更新说明" min-width="260">
          <template #default="{ row }">
            <el-popover
              placement="top-start"
              :title="'更新说明 - v' + row.version"
              :width="380"
              trigger="hover"
              popper-class="notes-popover"
            >
              <template #reference>
                <div class="notes-preview-cell">
                  <el-tag size="small" :type="row.notesType === 'rich' ? 'success' : 'info'" class="notes-type-tag">
                    {{ row.notesType === 'rich' ? '富文本' : '纯文本' }}
                  </el-tag>
                  <span class="notes-text">{{ row.notesType === 'rich' ? stripHtml(row.notes) : row.notes }}</span>
                </div>
              </template>
              <div class="popover-notes-content">
                <div v-if="row.notesType === 'rich'" v-html="row.notes"></div>
                <div v-else class="plain-pre-wrap">{{ row.notes }}</div>
              </div>
            </el-popover>
          </template>
        </el-table-column>

        <el-table-column label="强制更新" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.forceUpdate ? 'danger' : 'success'" size="small" effect="light">
              {{ row.forceUpdate ? '强制' : '可选' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="light" round>
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="灰度比例" width="100" align="center">
          <template #default="{ row }">
            <span v-if="row.status === 'beta'" class="beta-pct">{{ row.betaPct }}%</span>
            <span v-else class="empty-placeholder">--</span>
          </template>
        </el-table-column>

        <el-table-column label="发布时间" width="160" align="center" prop="releaseTime" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" icon="Edit" @click="openDialog(row)">编辑</el-button>
            <el-button
              v-if="row.status !== 'deprecated'"
              size="small" type="warning" icon="SwitchButton"
              @click="deprecate(row)"
            >下线</el-button>
            <el-popconfirm title="确认删除该版本记录？" @confirm="deleteVersion(row.id)">
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
          :page-sizes="[5, 10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑版本' : '新增版本'"
      width="750px"
      destroy-on-close
      @close="destroyEditor"
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="form.platform" style="width: 100%">
                <el-option label="iOS" value="iOS" />
                <el-option label="Android" value="Android" />
                <el-option label="HarmonyOS" value="HarmonyOS" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="版本号" prop="version">
              <el-input v-model="form.version" placeholder="如 2.3.1" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Build 号" prop="build">
              <el-input v-model="form.build" placeholder="如 231001" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="发布状态">
              <el-select v-model="form.status" style="width: 100%">
                <el-option label="已发布" value="released" />
                <el-option label="灰度发布" value="beta" />
                <el-option label="已下线" value="deprecated" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="灰度比例" v-if="form.status === 'beta'">
          <el-slider v-model="form.betaPct" :min="1" :max="100" show-input />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="强制更新">
              <el-switch v-model="form.forceUpdate" active-text="强制（必须更新）" inactive-text="可选（可跳过）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="说明方式">
              <el-radio-group v-model="form.notesType" @change="handleNotesTypeChange">
                <el-radio-button value="text">纯文本</el-radio-button>
                <el-radio-button value="rich">富文本</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="下载地址">
          <el-input v-model="form.downloadUrl" placeholder="App Store / 应用市场 / 应用宝 链接" clearable />
        </el-form-item>

        <el-form-item label="更新说明" prop="notes">
          <!-- Plain text editor -->
          <el-input
            v-if="form.notesType === 'text'"
            v-model="form.notes"
            type="textarea"
            :rows="6"
            placeholder="请描述本版本的更新内容"
            maxlength="500"
            show-word-limit
          />
          <!-- Rich text editor -->
          <div v-else class="wang-editor-wrap">
            <Toolbar :editor="dialogEditorRef" :defaultConfig="toolbarConfig" mode="default" class="wang-toolbar" />
            <Editor
              v-model="form.notes"
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
          {{ editingId ? '保存修改' : '创建版本' }}
        </el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, shallowRef, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

interface VersionItem {
  id: string
  platform: 'iOS' | 'Android' | 'HarmonyOS'
  version: string
  build: string
  forceUpdate: boolean
  status: 'released' | 'beta' | 'deprecated'
  betaPct: number
  notes: string
  notesType: 'text' | 'rich'
  downloadUrl: string
  releaseTime: string
}

// ── WangEditor Setup ──────────────────────────────────────────────
const dialogEditorRef = shallowRef<IDomEditor>()
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['uploadVideo', 'insertVideo', 'group-video']
}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入本版本的更新内容（支持富文本格式）...',
  autoFocus: false,
}
const handleDialogEditorCreated = (editor: IDomEditor) => {
  dialogEditorRef.value = editor
}
const destroyEditor = () => {
  dialogEditorRef.value?.destroy()
  dialogEditorRef.value = undefined
}

// Strip HTML helper for table cells
const stripHtml = (html: string) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').slice(0, 100)
}

const list = ref<VersionItem[]>([
  { id: 'V001', platform: 'iOS',       version: '2.3.1', build: '231010', forceUpdate: false, status: 'released',    betaPct: 0,  notes: '修复若干已知问题，优化启动速度，提升稳定性。', notesType: 'text', downloadUrl: 'https://apps.apple.com/jishan', releaseTime: '2026-05-28 10:00' },
  { id: 'V002', platform: 'Android',   version: '2.3.1', build: '231008', forceUpdate: false, status: 'released',    betaPct: 0,  notes: '修复若干已知问题，优化启动速度，提升稳定性。', notesType: 'text', downloadUrl: 'https://play.google.com/jishan', releaseTime: '2026-05-28 10:00' },
  { id: 'V003', platform: 'HarmonyOS', version: '2.3.1', build: '231009', forceUpdate: false, status: 'released',    betaPct: 0,  notes: '鸿蒙专版首发，深度适配鸿蒙原生特性，带来更丝滑的基础体验和高效省电运行。', notesType: 'text', downloadUrl: 'https://appgallery.huawei.com/jishan', releaseTime: '2026-05-28 10:00' },
  { id: 'V004', platform: 'iOS',       version: '2.4.0', build: '240001', forceUpdate: true,  status: 'beta',        betaPct: 20, notes: '<p>新增话题圈功能，全新消息通知体系，性能大幅提升。</p><ul><li>全新设计的<strong>社区话题圈</strong>，支持发布图文话题；</li><li>底层网络请求及图片加载组件升级，启动加载提速 <strong>40%</strong>；</li><li>修复了部分情况下消息通知延迟到达的问题。</li></ul>', notesType: 'rich', downloadUrl: '', releaseTime: '2026-05-30 14:00' },
  { id: 'V005', platform: 'Android',   version: '2.4.0', build: '240001', forceUpdate: true,  status: 'beta',        betaPct: 10, notes: '<p>新增话题圈功能，全新消息通知体系，性能大幅提升。</p><ul><li>全新设计的<strong>社区话题圈</strong>，支持发布图文话题；</li><li>底层网络请求及图片加载组件升级，启动加载提速 <strong>40%</strong>；</li><li>修复了部分情况下消息通知延迟到达的问题。</li></ul>', notesType: 'rich', downloadUrl: '', releaseTime: '2026-05-30 14:00' },
  { id: 'V006', platform: 'HarmonyOS', version: '2.4.0', build: '240002', forceUpdate: true,  status: 'beta',        betaPct: 15, notes: '<p>新增话题圈功能，全新消息通知体系，性能大幅提升。</p><ul><li>全新设计的<strong>社区话题圈</strong>，支持发布图文话题；</li><li>底层网络请求及图片加载组件升级，启动加载提速 <strong>40%</strong>；</li><li>修复了部分情况下消息通知延迟到达的问题。</li></ul>', notesType: 'rich', downloadUrl: '', releaseTime: '2026-05-30 14:00' },
  { id: 'V007', platform: 'iOS',       version: '2.2.0', build: '220015', forceUpdate: false, status: 'deprecated',  betaPct: 0,  notes: '早期版本，已停止支持。', notesType: 'text', downloadUrl: '', releaseTime: '2026-03-15 09:00' },
  { id: 'V008', platform: 'Android',   version: '2.2.0', build: '220016', forceUpdate: false, status: 'deprecated',  betaPct: 0,  notes: '早期安卓版本，已下架。', notesType: 'text', downloadUrl: '', releaseTime: '2026-03-15 09:00' },
  { id: 'V009', platform: 'HarmonyOS', version: '2.2.0', build: '220017', forceUpdate: false, status: 'deprecated',  betaPct: 0,  notes: '早期鸿蒙尝鲜版，已完成历史使命下线。', notesType: 'text', downloadUrl: '', releaseTime: '2026-03-15 09:00' },
])

// ── Latest versions summary cards ────────────────────────────────
const latestVersions = computed(() => {
  const getLatest = (platform: string) =>
    list.value.filter(v => v.platform === platform && v.status !== 'deprecated')
      .sort((a, b) => b.build.localeCompare(a.build))[0]
  const ios = getLatest('iOS')
  const android = getLatest('Android')
  const harmony = getLatest('HarmonyOS')
  return [
    { platform: 'iOS', version: ios ? `v${ios.version}` : '--', forceUpdate: ios?.forceUpdate ?? false, icon: 'Apple', color: '#000' },
    { platform: 'Android', version: android ? `v${android.version}` : '--', forceUpdate: android?.forceUpdate ?? false, icon: 'PhoneFilled', color: '#3DDC84' },
    { platform: 'HarmonyOS', version: harmony ? `v${harmony.version}` : '--', forceUpdate: harmony?.forceUpdate ?? false, icon: 'Cpu', color: '#0A59F7' },
  ]
})

// ── Filters ──────────────────────────────────────────────────────
const filterPlatform = ref('')
const filterStatus = ref('')
const filterForce = ref('')

const filteredList = computed(() => {
  return list.value.filter(v => {
    const matchPlatform = !filterPlatform.value || v.platform === filterPlatform.value
    const matchStatus = !filterStatus.value || v.status === filterStatus.value
    const matchForce = !filterForce.value || String(v.forceUpdate) === filterForce.value
    return matchPlatform && matchStatus && matchForce
  })
})

const resetFilters = () => {
  filterPlatform.value = ''
  filterStatus.value = ''
  filterForce.value = ''
  currentPage.value = 1
}

// ── Pagination ───────────────────────────────────────────────────
const currentPage = ref(1)
const pageSize = ref(5) // default 5 for gorgeous pagination display since we have 9 items

const totalCount = computed(() => filteredList.value.length)

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredList.value.slice(start, start + pageSize.value)
})

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

// ── Checkboxes & Selection Logic ─────────────────────────────────
const selectedIds = ref<string[]>([])

const isCurrentPageAllSelected = computed(() => {
  return paginatedList.value.length > 0 && paginatedList.value.every(r => selectedIds.value.includes(r.id))
})

const isCurrentPageIndeterminate = computed(() => {
  return paginatedList.value.some(r => selectedIds.value.includes(r.id)) && !isCurrentPageAllSelected.value
})

const toggleSelect = (id: string, val: boolean) => {
  if (val) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value = [...selectedIds.value, id]
    }
  } else {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

const handleSelectCurrentPage = (val: boolean) => {
  const pageIds = paginatedList.value.map(r => r.id)
  if (val) {
    const merged = new Set([...selectedIds.value, ...pageIds])
    selectedIds.value = [...merged]
  } else {
    selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id))
  }
}

// Watch filters to clear selections
watch([filterPlatform, filterStatus, filterForce], () => {
  selectedIds.value = []
})

// ── Bulk Actions ──────────────────────────────────────────────────
const handleBatchDeprecate = () => {
  ElMessageBox.confirm(
    `确定要批量下线选中的 ${selectedIds.value.length} 个版本记录吗？`,
    '系统提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    list.value.forEach(item => {
      if (selectedIds.value.includes(item.id)) {
        item.status = 'deprecated'
      }
    })
    ElMessage.success('批量下线成功')
    selectedIds.value = []
  }).catch(() => {})
}

const handleBatchDelete = () => {
  ElMessageBox.confirm(
    `确定要批量删除选中的 ${selectedIds.value.length} 个版本记录吗？此操作不可逆！`,
    '安全警告',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    list.value = list.value.filter(item => !selectedIds.value.includes(item.id))
    ElMessage.success('批量删除成功')
    selectedIds.value = []
    currentPage.value = 1
  }).catch(() => {})
}

// ── Helpers ──────────────────────────────────────────────────────
const statusLabel = (s: string) => ({ released: '已发布', beta: '灰度中', deprecated: '已下线' }[s] || s)
const statusTagType = (s: string): any => ({ released: 'success', beta: 'warning', deprecated: 'info' }[s] || '')

// ── Dialog ───────────────────────────────────────────────────────
const dialogVisible = ref(false)
const editingId = ref('')
const saving = ref(false)
const formRef = ref<FormInstance>()

const blankForm = () => ({
  platform: 'iOS' as 'iOS' | 'Android' | 'HarmonyOS',
  version: '',
  build: '',
  forceUpdate: false,
  status: 'released' as 'released' | 'beta' | 'deprecated',
  betaPct: 20,
  notes: '',
  notesType: 'text' as 'text' | 'rich',
  downloadUrl: '',
})

const form = reactive(blankForm())

const rules = {
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  version:  [{ required: true, message: '请输入版本号', trigger: 'blur' }],
  build:    [{ required: true, message: '请输入 Build 号', trigger: 'blur' }],
  notes: [
    {
      validator: (_: any, value: string, callback: Function) => {
        if (form.notesType === 'rich') {
          if (!value || value === '<p><br></p>') callback(new Error('请输入更新说明'))
          else callback()
        } else {
          if (!value || !value.trim()) callback(new Error('请输入更新说明'))
          else callback()
        }
      },
      trigger: 'blur'
    }
  ],
}

const handleNotesTypeChange = (val: 'text' | 'rich') => {
  if (val === 'text') {
    // Strip HTML if switching to text
    form.notes = form.notes ? form.notes.replace(/<[^>]*>/g, '') : ''
  } else {
    // Convert newlines to paragraphs if switching to rich
    if (form.notes && !form.notes.includes('<p>')) {
      form.notes = form.notes.split('\n').map(line => `<p>${line}</p>`).join('')
    }
  }
}

const openDialog = (row?: VersionItem) => {
  editingId.value = row?.id || ''
  if (row) {
    Object.assign(form, { ...row, notesType: row.notesType || 'text' })
  } else {
    Object.assign(form, blankForm())
  }
  dialogVisible.value = true
}

const handleSubmit = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  setTimeout(() => {
    if (editingId.value) {
      const item = list.value.find(v => v.id === editingId.value)
      if (item) Object.assign(item, form)
      ElMessage.success('版本信息已更新')
    } else {
      list.value.unshift({
        id: 'V' + Date.now().toString().slice(-3),
        ...form,
        releaseTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
      })
      ElMessage.success('版本已创建')
    }
    dialogVisible.value = false
    saving.value = false
  }, 300)
}

const deprecate = (row: VersionItem) => {
  row.status = 'deprecated'
  ElMessage.success(`v${row.version} 已下线`)
}

const deleteVersion = (id: string) => {
  list.value = list.value.filter(v => v.id !== id)
  ElMessage.success('已删除')
}
</script>

<style scoped>
.version-container { display: flex; flex-direction: column; gap: 16px; }

.page-header {
  display: flex; justify-content: space-between; align-items: center; padding: 20px 24px;
}
.header-left h2 { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 3px; }
.header-left p  { font-size: 13px; color: var(--text-muted); }

/* ── Latest version cards ── */
.latest-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}

.latest-card {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-platform {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.platform-icon { font-size: 20px; }

.harmony-svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* ── Filters ── */
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

.platform-cell {
  display: flex; align-items: center; gap: 6px; justify-content: center;
  font-weight: 600; font-size: 13px;
}

.harmony-svg-icon-table {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.version-badge {
  font-family: monospace;
  font-weight: 700;
  font-size: 14px;
  color: var(--primary, #5856d6);
}

.beta-pct {
  font-weight: 700;
  color: #e6a23c;
}

.notes-preview-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  max-width: 100%;
}

.notes-type-tag {
  flex-shrink: 0;
}

.notes-text {
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.popover-notes-content {
  font-size: 13px;
  line-height: 1.6;
  max-height: 250px;
  overflow-y: auto;
  color: var(--text-main, #303133);
}

.popover-notes-content p {
  margin: 0 0 6px 0;
}
.popover-notes-content p:last-child {
  margin-bottom: 0;
}
.popover-notes-content ul {
  padding-left: 18px;
  margin: 4px 0;
}

.plain-pre-wrap {
  white-space: pre-wrap;
  word-break: break-all;
}

.empty-placeholder { color: #c0c4cc; }

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
  height: 200px !important;
  overflow-y: auto;
  font-size: 14px;
}
</style>
