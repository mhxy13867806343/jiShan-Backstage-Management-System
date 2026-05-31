<template>
  <div class="agreement-container">
    <!-- Header Bar -->
    <div class="header-action-bar premium-card">
      <div class="header-text-info">
        <h2>用户服务协议配置</h2>
        <p>使用富文本编辑器编写即闪 App 的用户服务协议条款，右侧实时预览手机端效果，保存后即时生效。</p>
      </div>
      <div class="action-buttons">
        <el-button icon="RefreshLeft" @click="handleCancel" :disabled="saveLoading">重置内容</el-button>
        <el-button type="success" icon="Check" :loading="saveLoading" @click="handleSave">
          保存并发布
        </el-button>
      </div>
    </div>

    <!-- Two-column layout: Editor + Preview -->
    <div class="workspace-grid">
      <!-- Left: Rich Text Editor -->
      <div class="editor-column premium-card">
        <div class="column-title">
          <el-icon><EditPen /></el-icon>
          <span>富文本编辑器</span>
          <el-tag size="small" type="success" class="ml-auto">实时同步预览</el-tag>
        </div>
        <div class="wang-editor-wrap">
          <Toolbar
            :editor="editorRef"
            :defaultConfig="toolbarConfig"
            mode="default"
            class="wang-toolbar"
          />
          <Editor
            v-model="editContent"
            :defaultConfig="editorConfig"
            mode="default"
            class="wang-editor-body"
            @onCreated="handleCreated"
          />
        </div>
        <!-- Bottom action bar -->
        <div class="editor-footer-bar">
          <el-button icon="RefreshLeft" @click="handleCancel" :disabled="saveLoading">重置内容</el-button>
          <el-button type="success" icon="Check" :loading="saveLoading" @click="handleSave">
            保存并发布
          </el-button>
        </div>
      </div>

      <!-- Right: Phone Preview -->
      <div class="preview-column premium-card">
        <div class="column-title">
          <el-icon><View /></el-icon>
          <span>前台实时效果预览</span>
        </div>
        <div class="preview-viewport-scroll">
          <div class="mobile-phone-frame">
            <div class="phone-status-bar">
              <span>09:41</span>
              <div class="phone-icons">
                <el-icon><Connection /></el-icon>
                <el-icon><BatteryFull /></el-icon>
              </div>
            </div>
            <div class="phone-header">用户协议</div>
            <div class="phone-content-body">
              <div class="agreement-html-renderer" v-html="editContent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { adminApi } from '@/api/admin'
import { ElMessage } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

const saveLoading = ref(false)
const editContent = ref('')
const originalContent = ref('')

// WangEditor instance — must use shallowRef
const editorRef = shallowRef<IDomEditor>()

const toolbarConfig: Partial<IToolbarConfig> = {
  excludeKeys: ['uploadVideo', 'insertVideo', 'group-video']
}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请在此输入用户服务协议内容...',
  autoFocus: false,
}

const handleCreated = (editor: IDomEditor) => {
  editorRef.value = editor
}

const fetchAgreement = async () => {
  try {
    const data = await adminApi.getAgreement('user')
    originalContent.value = data || ''
    editContent.value = data || ''
  } catch (err) {
    console.error('fetchAgreement error', err)
  }
}

const handleCancel = () => {
  editContent.value = originalContent.value
  ElMessage.info('已重置为上次保存的内容')
}

const handleSave = async () => {
  saveLoading.value = true
  try {
    const res = await adminApi.updateAgreement('user', editContent.value)
    if (res.code === 200) {
      originalContent.value = editContent.value
      ElMessage.success('用户协议已成功更新并发布！')
    } else {
      ElMessage.error(res.message || '更新协议失败')
    }
  } catch (err) {
    console.error('handleSave error', err)
  } finally {
    saveLoading.value = false
  }
}

onMounted(() => {
  fetchAgreement()
})

// IMPORTANT: destroy editor on unmount to avoid memory leaks
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})
</script>

<style>
/* WangEditor global styles (cannot be scoped) */
.wang-toolbar {
  border-bottom: 1px solid #e2e8f0 !important;
  background: #f8fafc !important;
  border-radius: 0 !important;
  flex-shrink: 0;
}

.wang-editor-body {
  flex: 1;
  overflow-y: auto;
  font-size: 14px;
  line-height: 1.7;
  min-height: 400px;
}

.w-e-text-container [data-slate-editor] {
  padding: 20px 24px !important;
}
</style>

<style scoped>

.agreement-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.header-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-text-info h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 4px;
}

.header-text-info p {
  font-size: 13px;
  color: var(--text-muted);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.ml-auto {
  margin-left: auto;
}

/* Two-column workspace */
.workspace-grid {
  display: grid;
  grid-template-columns: 1.15fr 0.85fr;
  gap: 20px;
  flex: 1;
  min-height: 0;
}

@media (max-width: 1024px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

/* Column title bar */
.column-title {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-regular);
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
  border-radius: 16px 16px 0 0;
}

/* Editor column */
.editor-column {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 600px;
}

.wang-editor-wrap {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.editor-footer-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid var(--border-color);
  background-color: #f8fafc;
  border-radius: 0 0 16px 16px;
  flex-shrink: 0;
}

/* Preview column */
.preview-column {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.preview-viewport-scroll {
  padding: 24px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 30px;
  border-radius: 0 0 16px 16px;
  min-height: 500px;
}

/* Mobile Phone Frame */
.mobile-phone-frame {
  width: 320px;
  max-height: 560px;
  border-radius: 36px;
  background-color: white;
  border: 10px solid #1e293b;
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.35),
    0 0 0 2px rgba(255,255,255,0.1) inset;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.phone-status-bar {
  height: 28px;
  padding: 0 20px;
  background-color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  flex-shrink: 0;
}

.phone-icons {
  display: flex;
  align-items: center;
  gap: 4px;
}

.phone-header {
  height: 44px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 15px;
  color: var(--text-main);
  background-color: white;
  flex-shrink: 0;
}

.phone-content-body {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: white;
}

/* Styles for rendered HTML in the phone preview */
.agreement-html-renderer :deep(h1),
.agreement-html-renderer :deep(h2) {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #0f172a;
}

.agreement-html-renderer :deep(h3) {
  font-size: 13px;
  font-weight: 600;
  margin: 12px 0 6px 0;
  color: #1e293b;
}

.agreement-html-renderer :deep(p) {
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 8px;
}

.agreement-html-renderer :deep(ul),
.agreement-html-renderer :deep(ol) {
  padding-left: 18px;
  margin-bottom: 8px;
}

.agreement-html-renderer :deep(li) {
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 3px;
}

.agreement-html-renderer :deep(strong) {
  font-weight: 600;
  color: #334155;
}

.agreement-html-renderer :deep(a) {
  color: #6366f1;
  text-decoration: underline;
}
</style>
