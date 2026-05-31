<template>
  <div class="single-ann-container">
    <!-- Header -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>单公告管理</h2>
        <p>设置 App 首页展示的全局置顶公告，发布后所有用户可见。</p>
      </div>
      <el-tag :type="form.statusActive ? 'success' : 'info'" size="large">
        {{ form.statusActive ? '当前状态：已发布' : '当前状态：已停用' }}
      </el-tag>
    </div>

    <!-- Editor + Preview -->
    <div class="editor-layout">
      <!-- Left: Editor -->
      <div class="editor-panel premium-card">
        <div class="panel-title">
          <el-icon><EditPen /></el-icon> 公告内容编辑
        </div>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
          <el-form-item label="公告标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="公告类型">
            <el-radio-group v-model="form.type">
              <el-radio-button value="info">普通通知</el-radio-button>
              <el-radio-button value="warning">重要提醒</el-radio-button>
              <el-radio-button value="danger">紧急公告</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="跳转链接">
            <el-input v-model="form.link" placeholder="可选，点击公告跳转的链接" clearable />
          </el-form-item>

          <el-form-item label="生效时间">
            <el-date-picker v-model="form.startTime" type="datetime" placeholder="开始时间"
              format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width:195px" />
            <span style="margin:0 8px;color:#909399">至</span>
            <el-date-picker v-model="form.endTime" type="datetime" placeholder="结束时间（不填则永久）"
              format="YYYY-MM-DD HH:mm" value-format="YYYY-MM-DD HH:mm" style="width:195px" />
          </el-form-item>

          <el-form-item label="启用状态">
            <el-switch v-model="form.statusActive" active-text="已发布（用户可见）" inactive-text="停用（用户不可见）" />
          </el-form-item>

          <el-form-item label="展示频次">
            <el-radio-group v-model="form.showBehavior">
              <el-radio-button value="every">每次访问时展示</el-radio-button>
              <el-radio-button value="once">只展示一次</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <!-- Rich Text Editor -->
        <div class="rich-label">
          <span class="rich-label-text">公告正文</span>
          <el-tag size="small" type="success">富文本</el-tag>
        </div>
        <div class="wang-editor-wrap">
          <Toolbar :editor="editorRef" :defaultConfig="toolbarConfig" mode="default" class="wang-toolbar" />
          <Editor
            v-model="form.content"
            :defaultConfig="editorConfig"
            mode="default"
            class="wang-editor-body"
            @onCreated="handleCreated"
          />
        </div>
      </div>

      <!-- Right: Phone preview -->
      <div class="preview-panel">
        <div class="panel-title preview-title">
          <el-icon><View /></el-icon> 效果预览
        </div>
        <div class="phone-mockup">
          <div class="phone-frame">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <div class="app-bar">
                <span class="app-bar-title">即闪</span>
                <div class="app-bar-icons">
                  <span class="icon-dot">●</span>
                  <span class="icon-dot">●</span>
                </div>
              </div>

              <transition name="banner-fade">
                <div
                  v-if="form.statusActive && form.title"
                  class="ann-banner"
                  :class="'ann-' + form.type"
                >
                  <el-icon class="ann-icon">
                    <component :is="typeIconMap[form.type]" />
                  </el-icon>
                  <div class="ann-text">
                    <div class="ann-title-preview">{{ form.title }}</div>
                    <div class="ann-content-preview" v-html="form.content || '公告内容将在这里显示...'"></div>
                  </div>
                  <el-icon class="ann-close"><Close /></el-icon>
                </div>
              </transition>

              <div class="feed-skeleton">
                <div class="feed-item" v-for="i in 4" :key="i">
                  <div class="feed-avatar-sk"></div>
                  <div class="feed-lines">
                    <div class="feed-line long"></div>
                    <div class="feed-line short"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="preview-label">
            <span>{{ form.statusActive ? '✅ 公告已开启，用户可见' : '⚠️ 公告已停用，用户不可见' }}</span>
            <el-tag v-if="form.statusActive" size="small" :type="form.showBehavior === 'every' ? 'primary' : 'warning'" style="margin-left: 6px">
              {{ form.showBehavior === 'every' ? '每次访问展示' : '仅首次访问展示' }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-action-bar">
      <div class="action-bar-inner">
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="Check" :loading="saving" @click="handleSave">保存并发布</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, shallowRef, onBeforeUnmount, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'
import { adminApi } from '@/api/admin'

const formRef = ref<FormInstance>()
const saving = ref(false)

// WangEditor
const editorRef = shallowRef<IDomEditor>()
const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['uploadVideo', 'insertVideo', 'group-video']
}
const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入公告正文内容（支持富文本格式）...',
  autoFocus: false,
}
const handleCreated = (editor: IDomEditor) => { editorRef.value = editor }
onBeforeUnmount(() => { editorRef.value?.destroy() })

const typeIconMap: Record<string, string> = {
  info: 'InfoFilled',
  warning: 'WarningFilled',
  danger: 'CircleCloseFilled',
}

const defaultForm = () => ({
  title: '【系统通知】即闪 App 服务升级公告',
  type: 'info' as 'info' | 'warning' | 'danger',
  content: '<p>亲爱的用户，我们将于 <strong>2026-06-01 凌晨 2:00-4:00</strong> 进行服务器维护升级，届时部分功能可能短暂不可用，感谢您的理解与支持。</p>',
  link: '',
  startTime: '2026-06-01 00:00',
  endTime: '',
  statusActive: true,
  showBehavior: 'every' as 'every' | 'once',
})

const form = reactive(defaultForm())

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
}

// ── 单公告配置 ────────────────────────────────────────────────
const STORAGE_KEY = 'jishan_single_banner'
const SINGLE_BANNER_ID = 'SINGLE_BANNER'

const fetchSingleBanner = async () => {
  try {
    const saved = await adminApi.getAnnouncement(SINGLE_BANNER_ID)
    Object.assign(form, { ...saved, statusActive: saved.status === 'active' })
  } catch (err) {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) Object.assign(form, JSON.parse(raw))
    console.error('Fetch single banner failed', err)
  }
}

onMounted(() => {
  fetchSingleBanner()
})

const handleReset = () => {
  const def = defaultForm()
  Object.assign(form, def)
  localStorage.removeItem(STORAGE_KEY)
  ElMessage.info('已重置为默认内容')
}

const handleSave = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  if (!form.content || form.content === '<p><br></p>') {
    ElMessage.warning('请输入公告正文内容')
    return
  }
  saving.value = true
  try {
    const saved = await adminApi.saveAnnouncement({
      id: SINGLE_BANNER_ID,
      title: form.title,
      type: form.type,
      content: form.content,
      link: form.link,
      pinned: true,
      startTime: form.startTime,
      endTime: form.endTime,
      status: form.statusActive ? 'active' : 'inactive'
    })
    const data = (saved as any)?.data ?? saved
    Object.assign(form, { ...data, statusActive: data.status === 'active' })
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...form }))
    await fetchSingleBanner()
    ElMessage.success('单公告已保存并发布 ✓')
  } catch (err) {
    console.error('Save single banner failed', err)
    ElMessage.error('保存失败，请重试')
  } finally {
    saving.value = false
  }
}
</script>

<style>
/* WangEditor global (cannot be scoped) */
.ann-single-toolbar { border-bottom: 1px solid #e2e8f0 !important; background: #f8fafc !important; border-radius: 8px 8px 0 0; }
.ann-single-editor-body { height: 280px !important; overflow-y: auto; font-size: 14px; }
</style>

<style scoped>
.single-ann-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}
.header-left h2 { font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 3px; }
.header-left p  { font-size: 13px; color: var(--text-muted); }

/* ── Two column layout ── */
.editor-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 16px;
  align-items: start;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.editor-panel { padding: 24px; }

/* ── Rich text editor ── */
.rich-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.rich-label-text {
  font-size: 13px;
  color: var(--text-muted);
  font-weight: 500;
}

.wang-editor-wrap {
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
}

.wang-toolbar {
  border-bottom: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
}

.wang-editor-body {
  height: 280px !important;
  overflow-y: auto;
  font-size: 14px;
}

/* ── Preview ── */
.preview-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.preview-title {
  align-self: flex-start;
  border-bottom: none;
  margin-bottom: 0;
}

.phone-mockup { display: flex; flex-direction: column; align-items: center; gap: 10px; }

.phone-frame {
  width: 220px;
  height: 440px;
  background: #1a1a2e;
  border-radius: 36px;
  padding: 14px 10px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1);
  overflow: hidden;
}

.phone-notch {
  width: 60px;
  height: 16px;
  background: #0d0d1a;
  border-radius: 0 0 12px 12px;
  margin: 0 auto 6px;
}

.phone-screen {
  background: #f5f7fa;
  border-radius: 20px;
  height: calc(100% - 24px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.app-bar {
  background: #fff;
  padding: 8px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}
.app-bar-title { font-size: 13px; font-weight: 700; color: #222; }
.app-bar-icons { display: flex; gap: 6px; }
.icon-dot { font-size: 8px; color: #bbb; }

/* ── Banner ── */
.ann-banner {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 8px 10px;
  margin: 6px;
  border-radius: 8px;
  border-left: 3px solid;
  font-size: 10px;
}
.ann-info    { background: #e6f4ff; border-color: #1677ff; }
.ann-warning { background: #fffbe6; border-color: #faad14; }
.ann-danger  { background: #fff2f0; border-color: #ff4d4f; }

.ann-icon { font-size: 12px; margin-top: 1px; flex-shrink: 0; }
.ann-info .ann-icon    { color: #1677ff; }
.ann-warning .ann-icon { color: #faad14; }
.ann-danger .ann-icon  { color: #ff4d4f; }

.ann-text { flex: 1; min-width: 0; }
.ann-title-preview { font-weight: 700; color: #222; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ann-content-preview {
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.ann-content-preview :deep(p) { margin: 0; }
.ann-close { font-size: 10px; color: #bbb; flex-shrink: 0; }

/* ── Feed skeleton ── */
.feed-skeleton { flex: 1; padding: 8px; display: flex; flex-direction: column; gap: 10px; }
.feed-item { display: flex; gap: 8px; align-items: center; }
.feed-avatar-sk { width: 28px; height: 28px; border-radius: 50%; background: #e5e7eb; flex-shrink: 0; }
.feed-lines { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.feed-line { height: 8px; border-radius: 4px; background: #e5e7eb; }
.feed-line.long { width: 80%; }
.feed-line.short { width: 50%; }

/* ── Transitions ── */
.banner-fade-enter-active, .banner-fade-leave-active { transition: all 0.3s ease; }
.banner-fade-enter-from, .banner-fade-leave-to { opacity: 0; transform: translateY(-8px); }

.preview-label { font-size: 12px; color: var(--text-muted); text-align: center; }

/* ── Bottom action bar ── */
.bottom-action-bar {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  z-index: 100;
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(8px);
  border-top: 1px solid var(--border-color);
  box-shadow: 0 -2px 12px rgba(0,0,0,0.06);
  padding: 12px 24px;
}
.action-bar-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
