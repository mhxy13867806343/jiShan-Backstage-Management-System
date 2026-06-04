<template>
  <div class="feedback-container">
    <!-- Header Summary Card -->
    <div class="page-header-bar premium-card">
      <div class="header-text">
        <h2>用户意见反馈与动态表单管理 (Feedback & Dynamic Form Configurator)</h2>
        <p>支持后台自定义表单字段与排版布局，前端前台App根据配置动态渲染生成反馈页面，实现零代码业务定制。</p>
      </div>
      <div class="header-stats">
        <div class="stat-bubble">
          <span class="num">{{ submissions.length }}</span>
          <span class="label">反馈总量</span>
        </div>
        <div class="stat-bubble pending">
          <span class="num">{{ submissions.filter(s => s.status === 'pending').length }}</span>
          <span class="label">待处理</span>
        </div>
        <div class="stat-bubble resolved">
          <span class="num">{{ submissions.filter(s => s.status === 'resolved').length }}</span>
          <span class="label">已处理</span>
        </div>
      </div>
    </div>

    <!-- Mode Tabs -->
    <el-tabs v-model="activeTab" class="feedback-tabs">
      <!-- TAB 1: 表单设计与实时预览 -->
      <el-tab-pane label="表单配置与前台仿真 (Form Builder & Simulation)" name="configurator">
        <div class="config-grid">
          <!-- Left Column: Form Builder Configurator -->
          <div class="config-left-card premium-card">
            <div class="card-label-heading">表单字段配置器 (Form Field Designer)</div>
            
            <div class="field-designer-actions">
              <el-button type="primary" icon="Plus" size="small" @click="openAddFieldDialog">
                添加自定义表单项
              </el-button>
              <el-button icon="Refresh" size="small" @click="resetFormSchema">
                恢复默认推荐字段
              </el-button>
            </div>

            <!-- Fields Schema List -->
            <div class="schema-fields-list">
              <div v-for="(field, index) in formSchema" :key="field.key" class="schema-field-item glass-effect">
                <div class="field-drag-arrows">
                  <el-button 
                    link 
                    icon="ArrowUp" 
                    :disabled="index === 0" 
                    @click="moveField(index, 'up')" 
                  />
                  <el-button 
                    link 
                    icon="ArrowDown" 
                    :disabled="index === formSchema.length - 1" 
                    @click="moveField(index, 'down')" 
                  />
                </div>
                
                <div class="field-main-info">
                  <div class="field-title-row">
                    <span class="field-label">{{ field.label }}</span>
                    <el-tag size="small" type="info" class="field-type-tag">{{ getFieldTypeName(field.type) }}</el-tag>
                    <el-tag size="small" v-if="field.required" type="danger" effect="plain" class="field-req-tag">必填</el-tag>
                  </div>
                  <div class="field-key font-mono">ID / Key: {{ field.key }}</div>
                  <div class="field-placeholder" v-if="field.placeholder">提示语: {{ field.placeholder }}</div>
                  <div class="field-options font-mono" v-if="field.options && field.options.length">
                    候选项: [{{ field.options.join(', ') }}]
                  </div>
                </div>

                <div class="field-actions">
                  <el-button type="primary" plain circle icon="Edit" size="small" @click="editField(index)" />
                  <el-button type="danger" plain circle icon="Delete" size="small" @click="deleteField(index)" />
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: iOS Smartphone Mockup Viewer -->
          <div class="phone-viewport-column premium-card">
            <div class="column-title-heading">
              <el-icon><Smartphone /></el-icon>
              <span>前台 App 动态表单动态渲染屏</span>
            </div>

            <div class="viewport-box">
              <div class="iphone-mockup">
                <!-- Ear Speaker Notch -->
                <div class="iphone-notch"></div>
                
                <!-- Status bar -->
                <div class="phone-status-bar">
                  <span class="status-time">16:58</span>
                  <div class="status-right-icons">
                    <el-icon><Connection /></el-icon>
                    <span class="network-type">5G</span>
                    <el-icon><BatteryFull /></el-icon>
                  </div>
                </div>

                <!-- Phone Header -->
                <div class="phone-header">
                  <span class="screen-title">意见与建议反馈</span>
                </div>

                <!-- Screen Body (Dynamic Form Renders here) -->
                <div class="phone-screen-body">
                  <div class="preview-tips-banner">
                    <el-icon><InfoFilled /></el-icon>
                    <span>以下输入项已根据您在左侧的配置动态生成</span>
                  </div>

                  <el-form :model="previewForm" ref="previewFormRef" label-position="top" class="dynamic-rendered-form">
                    <el-form-item 
                      v-for="field in formSchema" 
                      :key="field.key" 
                      :label="field.label" 
                      :required="field.required"
                      :prop="field.key"
                      class="rendered-form-item"
                    >
                      <!-- Render TYPE: input -->
                      <el-input 
                        v-if="field.type === 'input'" 
                        v-model="previewForm[field.key]" 
                        :placeholder="field.placeholder || ('请输入' + field.label)" 
                        class="sim-input"
                      />

                      <!-- Render TYPE: textarea -->
                      <el-input 
                        v-else-if="field.type === 'textarea'" 
                        v-model="previewForm[field.key]" 
                        type="textarea" 
                        :rows="3"
                        :placeholder="field.placeholder || ('请详细描述您的问题...')" 
                        class="sim-textarea"
                      />

                      <!-- Render TYPE: select -->
                      <el-select 
                        v-else-if="field.type === 'select'" 
                        v-model="previewForm[field.key]" 
                        :placeholder="field.placeholder || '请选择'"
                        style="width: 100%;"
                        class="sim-select"
                      >
                        <el-option v-for="opt in field.options" :key="opt" :label="opt" :value="opt" />
                      </el-select>

                      <!-- Render TYPE: rate -->
                      <el-rate 
                        v-else-if="field.type === 'rate'" 
                        v-model="previewForm[field.key]" 
                        class="sim-rate"
                      />

                      <!-- Render TYPE: switch -->
                      <el-switch 
                        v-else-if="field.type === 'switch'" 
                        v-model="previewForm[field.key]" 
                        class="sim-switch"
                      />

                      <!-- Render TYPE: radio -->
                      <el-radio-group 
                        v-else-if="field.type === 'radio'" 
                        v-model="previewForm[field.key]" 
                        class="sim-radio-group"
                      >
                        <el-radio v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</el-radio>
                      </el-radio-group>
                    </el-form-item>

                    <div style="margin-top: 24px; padding-bottom: 20px;">
                      <button type="button" class="sim-submit-btn" @click="submitMockFeedback">
                        确认提交反馈
                      </button>
                    </div>
                  </el-form>
                </div>

                <!-- iPhone Home Bar -->
                <div class="iphone-home-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- TAB 2: 反馈收集列表 -->
      <el-tab-pane label="反馈收集列表 (Feedback Submissions)" name="submissions">
        <!-- Filter Panel -->
        <div class="filter-panel premium-card">
          <el-form :inline="true" :model="searchQuery">
            <el-form-item label="手机号码">
              <el-input v-model="searchQuery.phone" placeholder="搜索联系电话" clearable />
            </el-form-item>
            <el-form-item label="反馈类型">
              <el-select v-model="searchQuery.category" placeholder="全部类型" clearable style="width: 150px;">
                <el-option label="功能建议" value="功能建议" />
                <el-option label="系统故障" value="系统故障" />
                <el-option label="内容纠错" value="内容纠错" />
                <el-option label="其他问题" value="其他问题" />
              </el-select>
            </el-form-item>
            <el-form-item label="处理状态">
              <el-select v-model="searchQuery.status" placeholder="选择状态" clearable style="width: 130px;">
                <el-option label="待处理" value="pending" />
                <el-option label="已处理" value="resolved" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
              <el-button icon="Refresh" @click="handleReset">重置</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Data Table Card -->
        <div class="table-card premium-card">
          <el-table :data="filteredSubmissions" style="width: 100%" stripe>
            <el-table-column prop="id" label="反馈ID" width="90" align="center" />
            <el-table-column prop="phone" label="联系电话" width="130" align="center" />
            <el-table-column prop="category" label="类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="getCategoryTag(row.category)">{{ row.category }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="反馈标题" min-width="150" show-overflow-tooltip />
            <el-table-column prop="content" label="反馈详情描述" min-width="250" show-overflow-tooltip />
            <el-table-column prop="createTime" label="提交时间" width="170" align="center" sortable />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === 'resolved' ? 'success' : 'warning'" effect="dark">
                  {{ row.status === 'resolved' ? '已处理' : '待处理' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" align="center" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" plain icon="View" @click="viewDetail(row)">
                  查看详情
                </el-button>
                <el-button 
                  v-if="row.status === 'pending'"
                  size="small" 
                  type="success" 
                  plain 
                  icon="Check" 
                  @click="resolveFeedback(row.id)"
                >
                  处理标记
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  plain 
                  icon="Delete" 
                  @click="deleteFeedback(row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Dialog: Add / Edit Field Config -->
    <el-dialog 
      v-model="fieldDialogVisible" 
      :title="fieldForm.index !== undefined ? '修改表单项配置' : '添加表单项配置'" 
      width="500px"
      destroy-on-close
    >
      <el-form :model="fieldForm" :rules="fieldRules" ref="fieldFormRef" label-width="110px">
        <el-form-item label="字段 Key/ID" prop="key">
          <el-input 
            v-model="fieldForm.key" 
            placeholder="仅限小写英文及下划线，例如 category" 
            :disabled="fieldForm.index !== undefined"
          />
        </el-form-item>
        
        <el-form-item label="显示标题" prop="label">
          <el-input v-model="fieldForm.label" placeholder="例如 问题分类" />
        </el-form-item>

        <el-form-item label="输入项类型" prop="type">
          <el-select v-model="fieldForm.type" placeholder="请选择字段类型" style="width: 100%;">
            <el-option label="单行文本输入 (Input)" value="input" />
            <el-option label="多行文本区域 (Textarea)" value="textarea" />
            <el-option label="下拉选择框 (Select)" value="select" />
            <el-option label="数字星级评分 (Rate)" value="rate" />
            <el-option label="开关按钮 (Switch)" value="switch" />
            <el-option label="单选框组合 (Radio)" value="radio" />
          </el-select>
        </el-form-item>

        <el-form-item label="是否必填项">
          <el-switch v-model="fieldForm.required" />
        </el-form-item>

        <el-form-item label="占位/提示语">
          <el-input v-model="fieldForm.placeholder" placeholder="显示在前台输入栏的灰色占位符" />
        </el-form-item>

        <el-form-item 
          v-if="['select', 'radio'].includes(fieldForm.type)" 
          label="下拉候选项" 
          prop="optionsText"
        >
          <el-input 
            v-model="fieldForm.optionsText" 
            type="textarea" 
            :rows="3" 
            placeholder="请输入可选内容，用英文逗号 ',' 隔开，例如：闪退挂起,UI卡顿,其他" 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="fieldDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveField">保存表单项</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Dialog: Feedback Detail View -->
    <el-dialog v-model="detailDialogVisible" title="收集的意见反馈详情" width="580px" destroy-on-close align-center>
      <div v-if="selectedFeedback" class="feedback-detail-card">
        <div class="detail-header-row">
          <div class="f-info">
            <span class="f-phone font-mono">联系电话: {{ selectedFeedback.phone || '未填写' }}</span>
            <span class="f-time">提交于: {{ selectedFeedback.createTime }}</span>
          </div>
          <el-tag :type="selectedFeedback.status === 'resolved' ? 'success' : 'warning'" effect="dark">
            {{ selectedFeedback.status === 'resolved' ? '已处理完成' : '待跟踪处理' }}
          </el-tag>
        </div>

        <div class="detail-body-list">
          <div class="detail-field-item">
            <div class="lbl">反馈类别:</div>
            <div class="val"><el-tag size="small">{{ selectedFeedback.category || '未指定' }}</el-tag></div>
          </div>
          
          <div class="detail-field-item">
            <div class="lbl">反馈标题:</div>
            <div class="val text-bold">{{ selectedFeedback.title || '无标题' }}</div>
          </div>

          <div class="detail-field-item block">
            <div class="lbl">具体内容描述:</div>
            <div class="val pre-wrap">{{ selectedFeedback.content || '未提供具体说明' }}</div>
          </div>

          <!-- Dynamic Raw Data Config rendering -->
          <div class="detail-field-item block raw-json-card">
            <div class="lbl">提交的原始表单元数据 (JSON Map):</div>
            <div class="val">
              <pre class="font-mono">{{ JSON.stringify(selectedFeedback.rawData, null, 2) }}</pre>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'

interface FormField {
  key: string
  label: string
  type: 'input' | 'textarea' | 'select' | 'rate' | 'switch' | 'radio'
  required: boolean
  placeholder?: string
  options?: string[]
}

interface FeedbackSubmission {
  id: string
  phone: string
  category: string
  title: string
  content: string
  status: 'pending' | 'resolved'
  createTime: string
  rawData: Record<string, any>
}

const activeTab = ref('configurator')

// ── Form Schemas ──
const defaultSchema: FormField[] = [
  {
    key: 'phone',
    label: '手机号码',
    type: 'input',
    required: true,
    placeholder: '请留下您的联系手机，以便我们进行回复'
  },
  {
    key: 'category',
    label: '反馈类型',
    type: 'select',
    required: true,
    options: ['功能建议', '系统故障', '内容纠错', '其他问题'],
    placeholder: '请选择反馈类型'
  },
  {
    key: 'title',
    label: '反馈标题',
    type: 'input',
    required: true,
    placeholder: '请简述反馈内容标题，例如：评论加载太慢'
  },
  {
    key: 'content',
    label: '详细描述内容',
    type: 'textarea',
    required: true,
    placeholder: '请详细描述您在使用即闪APP时遇到的异常情况或建议'
  },
  {
    key: 'satisfaction',
    label: '系统满意度评价',
    type: 'rate',
    required: false
  }
]

const formSchema = ref<FormField[]>([])
const previewForm = ref<Record<string, any>>({})

// ── Submissions Data ──
const submissions = ref<FeedbackSubmission[]>([])
const searchQuery = reactive({
  phone: '',
  category: '',
  status: ''
})

const filteredSubmissions = computed(() => {
  return submissions.value.filter(s => {
    const matchPhone = !searchQuery.phone || s.phone.includes(searchQuery.phone)
    const matchCategory = !searchQuery.category || s.category === searchQuery.category
    const matchStatus = !searchQuery.status || s.status === searchQuery.status
    return matchPhone && matchCategory && matchStatus
  }).sort((a, b) => b.id.localeCompare(a.id))
})

// ── Field Dialog Form ──
const fieldDialogVisible = ref(false)
const fieldFormRef = ref<FormInstance>()
const fieldForm = ref({
  index: undefined as number | undefined,
  key: '',
  label: '',
  type: 'input' as 'input' | 'textarea' | 'select' | 'rate' | 'switch' | 'radio',
  required: false,
  placeholder: '',
  optionsText: ''
})

const validateFieldKey = (_rule: any, value: string, callback: any) => {
  if (!value) {
    return callback(new Error('请输入字段 Key'))
  }
  if (!/^[a-z_][a-z0-9_]*$/.test(value)) {
    return callback(new Error('字段Key仅支持小写字母和下划线开头，不能含有特殊字符'))
  }
  // Check if exists
  if (fieldForm.value.index === undefined) {
    const exists = formSchema.value.some(f => f.key === value)
    if (exists) {
      return callback(new Error('该字段 Key 已经存在'))
    }
  }
  callback()
}

const fieldRules = {
  key: [{ validator: validateFieldKey, trigger: 'blur' }],
  label: [{ required: true, message: '请输入显示标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择输入项类型', trigger: 'change' }]
}

// ── Details View ──
const detailDialogVisible = ref(false)
const selectedFeedback = ref<FeedbackSubmission | null>(null)

// ── Lifecycle ──
onMounted(() => {
  // Load configuration schema
  const savedSchema = localStorage.getItem('feedback_form_schema')
  if (savedSchema) {
    try {
      formSchema.value = JSON.parse(savedSchema)
    } catch {
      formSchema.value = [...defaultSchema]
    }
  } else {
    formSchema.value = [...defaultSchema]
  }

  // Pre-seed mock submissions if empty
  const savedSubmissions = localStorage.getItem('feedback_submissions')
  if (savedSubmissions) {
    try {
      submissions.value = JSON.parse(savedSubmissions)
    } catch {
      submissions.value = []
    }
  } else {
    // Generate pre-seeded mock feedback
    submissions.value = [
      {
        id: 'FB10001',
        phone: '18072783978',
        category: '系统故障',
        title: '用户头像无法上传',
        content: '每次点击更换头像后，选择图片虽然提示成功了，但刷新后还是展示默认生成的Dicebear头像，希望排查一下缓存写入逻辑。',
        status: 'pending',
        createTime: '2026-06-04 15:42:01',
        rawData: { phone: '18072783978', category: '系统故障', title: '用户头像无法上传', content: '每次点击更换头像后...', satisfaction: 2 }
      },
      {
        id: 'FB10002',
        phone: '13867806343',
        category: '功能建议',
        title: '希望能支持多视频混传',
        content: '目前前台App发布动态只允许上传一张视频，平时拍探店面包房的时候往往需要混剪上传多段短片，如果能像小红书那样支持发布多段就好了！',
        status: 'resolved',
        createTime: '2026-06-03 11:20:00',
        rawData: { phone: '13867806343', category: '功能建议', title: '希望能支持多视频混传', content: '目前前台App发布动态...', satisfaction: 5 }
      }
    ]
    localStorage.setItem('feedback_submissions', JSON.stringify(submissions.value))
  }

  resetPreviewForm()
})

const resetPreviewForm = () => {
  const model: Record<string, any> = {}
  formSchema.value.forEach(f => {
    if (f.type === 'switch') {
      model[f.key] = false
    } else if (f.type === 'rate') {
      model[f.key] = 0
    } else {
      model[f.key] = ''
    }
  })
  previewForm.value = model
}

// ── Form configuration actions ──
const openAddFieldDialog = () => {
  fieldForm.value = {
    index: undefined,
    key: '',
    label: '',
    type: 'input',
    required: false,
    placeholder: '',
    optionsText: ''
  }
  fieldDialogVisible.value = true
}

const editField = (index: number) => {
  const f = formSchema.value[index]
  fieldForm.value = {
    index: index as any,
    key: f.key,
    label: f.label,
    type: f.type,
    required: f.required,
    placeholder: f.placeholder || '',
    optionsText: f.options ? f.options.join(',') : ''
  }
  fieldDialogVisible.value = true
}

const saveField = async () => {
  if (!fieldFormRef.value) return
  await fieldFormRef.value.validate((valid) => {
    if (valid) {
      const opts = ['select', 'radio'].includes(fieldForm.value.type) && fieldForm.value.optionsText
        ? fieldForm.value.optionsText.split(',').map(s => s.trim()).filter(Boolean)
        : undefined

      const targetField: FormField = {
        key: fieldForm.value.key,
        label: fieldForm.value.label,
        type: fieldForm.value.type,
        required: fieldForm.value.required,
        placeholder: fieldForm.value.placeholder || undefined,
        options: opts
      }

      if (fieldForm.value.index !== undefined) {
        // Edit Mode
        formSchema.value[fieldForm.value.index] = targetField
        ElMessage.success('字段配置更新成功')
      } else {
        // Add Mode
        formSchema.value.push(targetField)
        ElMessage.success('成功添加表单项')
      }

      localStorage.setItem('feedback_form_schema', JSON.stringify(formSchema.value))
      resetPreviewForm()
      fieldDialogVisible.value = false
    }
  })
}

const deleteField = (index: number) => {
  const f = formSchema.value[index]
  ElMessageBox.confirm(`确定要移除表单字段 “${f.label} (${f.key})” 吗？删除后前台仿真中将不再显示该输入项。`, '移除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    formSchema.value.splice(index, 1)
    localStorage.setItem('feedback_form_schema', JSON.stringify(formSchema.value))
    resetPreviewForm()
    ElMessage.success('字段已成功删除')
  }).catch(() => {})
}

const moveField = (index: number, direction: 'up' | 'down') => {
  const targetIndex = direction === 'up' ? index - 1 : index + 1
  const temp = formSchema.value[index]
  formSchema.value[index] = formSchema.value[targetIndex]
  formSchema.value[targetIndex] = temp
  localStorage.setItem('feedback_form_schema', JSON.stringify(formSchema.value))
}

const resetFormSchema = () => {
  ElMessageBox.confirm('确定要恢复至系统推荐的默认反馈表单布局配置吗？这会覆盖您目前的自定义表单项。', '还原确认', {
    confirmButtonText: '确认还原',
    cancelButtonText: '取消',
    type: 'info'
  }).then(() => {
    formSchema.value = [...defaultSchema]
    localStorage.setItem('feedback_form_schema', JSON.stringify(formSchema.value))
    resetPreviewForm()
    ElMessage.success('表单已被重置为默认推荐字段')
  }).catch(() => {})
}

const getFieldTypeName = (type: string) => {
  const map: Record<string, string> = {
    input: '单行文本输入',
    textarea: '多行文本框',
    select: '下拉选择器',
    rate: '星级评分',
    switch: '开关滑块',
    radio: '单选按钮组'
  }
  return map[type] || type
}

// ── Front-end Form Submit Simulation ──
const submitMockFeedback = () => {
  // Validate constraints
  for (const field of formSchema.value) {
    const val = previewForm.value[field.key]
    if (field.required) {
      if (val === undefined || val === null || val === '') {
        ElMessage.error(`前台提交失败：请填写“${field.label}”！`)
        return
      }
    }
  }

  // Create submission mapping
  // Map standard keys or fall back to first input/textarea values
  const phoneVal = String(previewForm.value['phone'] || previewForm.value['tel'] || '19900008888')
  
  // Find category select or use type select
  const catField = formSchema.value.find(f => f.type === 'select')
  const categoryVal = catField ? previewForm.value[catField.key] : '意见反馈'

  const titleField = formSchema.value.find(f => f.key === 'title' || f.key === 'subject')
  const titleVal = titleField ? previewForm.value[titleField.key] : '前台手机模拟反馈'

  const contentField = formSchema.value.find(f => f.key === 'content' || f.key === 'desc' || f.type === 'textarea')
  const contentVal = contentField ? previewForm.value[contentField.key] : '用户未填写具体反馈描述'

  const newId = 'FB' + (10000 + submissions.value.length + 1)
  const newSubmit: FeedbackSubmission = {
    id: newId,
    phone: phoneVal,
    category: categoryVal || '其他问题',
    title: titleVal || '自定义字段反馈',
    content: contentVal,
    status: 'pending',
    createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
    rawData: { ...previewForm.value }
  }

  submissions.value.unshift(newSubmit)
  localStorage.setItem('feedback_submissions', JSON.stringify(submissions.value))
  
  ElMessage({
    message: '🎉 恭喜！前台模拟反馈成功提交！请前往第二页【反馈收集列表】查看最新数据。',
    type: 'success',
    duration: 5000
  })

  resetPreviewForm()
}

// ── Submissions Table actions ──
const handleSearch = () => {
  // Computed property handles search query reactively
}

const handleReset = () => {
  searchQuery.phone = ''
  searchQuery.category = ''
  searchQuery.status = ''
}

const getCategoryTag = (cat: string) => {
  const map: Record<string, string> = {
    '系统故障': 'danger',
    '功能建议': 'primary',
    '内容纠错': 'warning',
    '其他问题': 'info'
  }
  return map[cat] || ''
}

const viewDetail = (row: FeedbackSubmission) => {
  selectedFeedback.value = row
  detailDialogVisible.value = true
}

const resolveFeedback = (id: string) => {
  const f = submissions.value.find(item => item.id === id)
  if (f) {
    f.status = 'resolved'
    localStorage.setItem('feedback_submissions', JSON.stringify(submissions.value))
    ElMessage.success(`反馈 ID ${id} 处理完毕并已做标记！`)
  }
}

const deleteFeedback = (id: string) => {
  ElMessageBox.confirm(`确定永久删除该意见反馈数据 (ID: ${id}) 吗？`, '删除确认', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    submissions.value = submissions.value.filter(item => item.id !== id)
    localStorage.setItem('feedback_submissions', JSON.stringify(submissions.value))
    ElMessage.success('该反馈已被永久删除')
  }).catch(() => {})
}
</script>

<style scoped>
.feedback-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.header-text h2 {
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 4px;
}

.header-text p {
  font-size: 13px;
  color: #8c8c8c;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat-bubble {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f5f5;
  border-radius: 8px;
  padding: 10px 18px;
  min-width: 90px;
  border: 1px solid #e8e8e8;
}

.stat-bubble .num {
  font-size: 22px;
  font-weight: 700;
  color: #1890ff;
}

.stat-bubble .label {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 2px;
}

.stat-bubble.pending .num { color: #faad14; }
.stat-bubble.resolved .num { color: #52c41a; }

.feedback-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 14px;
}

.config-grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 20px;
  align-items: start;
}

.config-left-card {
  padding: 24px;
}

.card-label-heading {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 16px;
  border-left: 3px solid var(--primary);
  padding-left: 8px;
}

.field-designer-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.schema-fields-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 520px;
  overflow-y: auto;
  padding-right: 4px;
}

.schema-field-item {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: white;
  transition: all 0.25s ease;
}

.schema-field-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--primary);
}

.field-drag-arrows {
  display: flex;
  flex-direction: column;
  margin-right: 14px;
}

.field-drag-arrows :deep(.el-button) {
  padding: 2px;
  height: 20px;
}

.field-main-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.field-label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-main);
}

.field-type-tag {
  border-radius: 4px;
  font-weight: 500;
}

.field-req-tag {
  font-size: 10px;
  height: 16px;
  line-height: 14px;
  padding: 0 4px;
}

.field-key {
  font-size: 11px;
  color: var(--text-light);
}

.field-placeholder {
  font-size: 12px;
  color: var(--text-muted);
}

.field-options {
  font-size: 11px;
  color: #722ed1;
  background: #f9f0ff;
  padding: 2px 6px;
  border-radius: 4px;
  align-self: start;
}

.field-actions {
  display: flex;
  gap: 6px;
}

/* ── Phone view port ── */
.phone-viewport-column {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.column-title-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-main);
  font-size: 14px;
  margin-bottom: 16px;
}

.viewport-box {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.iphone-mockup {
  position: relative;
  width: 320px;
  height: 600px;
  border-radius: 36px;
  border: 10px solid #1a1a1a;
  background: #f7f9fc;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.iphone-notch {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 22px;
  background: #1a1a1a;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  z-index: 10;
}

.phone-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 38px;
  padding: 12px 20px 0 20px;
  font-size: 11px;
  font-weight: 600;
  color: #000;
  z-index: 5;
}

.status-right-icons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.network-type {
  font-size: 9px;
  font-weight: 700;
}

.phone-header {
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #e8e8e8;
  background: #ffffff;
}

.screen-title {
  font-weight: 700;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
}

.phone-screen-body {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background-color: #f7f9fc;
}

.preview-tips-banner {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e6f7ff;
  border: 1px solid #91d5ff;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 10px;
  color: #0050b3;
  line-height: 1.3;
}

.dynamic-rendered-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rendered-form-item :deep(.el-form-item__label) {
  padding-bottom: 2px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  color: #333333 !important;
  line-height: 1.2 !important;
}

.sim-input :deep(.el-input__inner) {
  font-size: 12px;
  height: 32px;
}

.sim-textarea :deep(.el-textarea__inner) {
  font-size: 12px;
}

.sim-submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #1890ff 0%, #722ed1 100%);
  color: white;
  border: none;
  height: 38px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.25);
  transition: all 0.2s ease;
}

.sim-submit-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(24, 144, 255, 0.35);
}

.iphone-home-bar {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 110px;
  height: 4px;
  background: #000000;
  border-radius: 2px;
  z-index: 10;
}

/* ── Submissions Sub-tab ── */
.filter-panel {
  padding: 20px 24px 0 24px;
  margin-bottom: 20px;
}

.table-card {
  padding: 24px;
}

.feedback-detail-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 14px;
}

.detail-header-row .f-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.detail-header-row .f-phone {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-main);
}

.detail-header-row .f-time {
  font-size: 11px;
  color: var(--text-light);
}

.detail-body-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-field-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid #fafafa;
  padding-bottom: 8px;
}

.detail-field-item.block {
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.detail-field-item .lbl {
  font-weight: 600;
  font-size: 13px;
  color: var(--text-muted);
  width: 100px;
}

.detail-field-item.block .lbl {
  width: auto;
}

.detail-field-item .val {
  font-size: 13px;
  color: var(--text-main);
}

.detail-field-item .val.pre-wrap {
  white-space: pre-wrap;
  line-height: 1.5;
  background: #f7f9fc;
  padding: 10px 14px;
  border-radius: 6px;
  border: 1px solid #e8e8e8;
  width: 100%;
}

.raw-json-card {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  border-bottom: none !important;
}

.raw-json-card pre {
  margin: 4px 0 0 0;
  background: #0f172a;
  color: #38bdf8;
  padding: 12px;
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.4;
  overflow-x: auto;
  max-height: 180px;
  width: 100%;
}

.premium-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
  background-color: #ffffff;
}
</style>
