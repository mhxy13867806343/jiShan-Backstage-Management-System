<template>
  <div class="agreement-container">
    <!-- Top Action Info bar -->
    <div class="header-action-bar premium-card">
      <div class="header-text-info">
        <h2>用户服务协议配置</h2>
        <p>配置即闪前台App用户的服务使用协议条款，支持HTML富文本格式，修改保存后即时生效。</p>
      </div>

      <div class="action-buttons">
        <el-button 
          v-if="!isEdit" 
          type="primary" 
          icon="Edit" 
          @click="isEdit = true"
        >
          编辑协议内容
        </el-button>
        <template v-else>
          <el-button icon="Close" @click="handleCancel">取消</el-button>
          <el-button type="success" icon="Check" :loading="saveLoading" @click="handleSave">
            保存修改
          </el-button>
        </template>
      </div>
    </div>

    <!-- Main Workspace Splitter -->
    <div class="workspace-grid" :class="{ 'edit-mode': isEdit }">
      <!-- Editor Column (only visible in edit mode) -->
      <div v-if="isEdit" class="editor-column premium-card">
        <div class="column-title">
          <el-icon><EditPen /></el-icon>
          <span>HTML 源代码编辑区</span>
        </div>
        <el-input
          v-model="editContent"
          type="textarea"
          :rows="22"
          placeholder="请输入用户协议的HTML内容..."
          class="html-textarea font-mono"
        />
        <div class="editor-tips">
          提示：支持使用标准 HTML 标签，如 <code>&lt;h3&gt;</code>、<code>&lt;p&gt;</code>、<code>&lt;ul&gt;</code> 等来进行排版。
        </div>
      </div>

      <!-- Preview Column -->
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
            <div class="phone-header">服务协议</div>
            <div class="phone-content-body">
              <div class="agreement-html-renderer" v-html="previewContent"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMockDataStore } from '@/store/mockData'
import { ElMessage } from 'element-plus'

const mockStore = useMockDataStore()
const saveLoading = ref(false)
const isEdit = ref(false)
const originalContent = ref('')
const editContent = ref('')

// Compute content for preview: if editing, show editContent, otherwise originalContent
const previewContent = computed(() => {
  return isEdit.value ? editContent.value : originalContent.value
})

const fetchAgreement = () => {
  const data = mockStore.getAgreement('user')
  originalContent.value = data
  editContent.value = data
}

const handleCancel = () => {
  editContent.value = originalContent.value
  isEdit.value = false
  ElMessage.info('已取消编辑')
}

const handleSave = () => {
  saveLoading.value = true
  
  // Simulate local save
  setTimeout(() => {
    mockStore.updateAgreement('user', editContent.value)
    originalContent.value = editContent.value
    isEdit.value = false
    ElMessage.success('用户协议已成功更新并发布！')
    saveLoading.value = false
  }, 200)
}

onMounted(() => {
  fetchAgreement()
})
</script>

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

/* Workspace Splitter */
.workspace-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.workspace-grid.edit-mode {
  grid-template-columns: 1.1fr 0.9fr;
}

@media (max-width: 900px) {
  .workspace-grid.edit-mode {
    grid-template-columns: 1fr;
  }
}

.column-title {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-regular);
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
}

.editor-column {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.html-textarea {
  padding: 16px;
  flex-grow: 1;
}

.html-textarea :deep(.el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  resize: none;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}

.editor-tips {
  padding: 12px 20px;
  background-color: #f1f5f9;
  font-size: 11px;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.preview-column {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.preview-viewport-scroll {
  padding: 24px;
  background-color: #e2e8f0;
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

/* Simulated Mobile Phone Frame for elegant UX */
.mobile-phone-frame {
  width: 360px;
  height: 580px;
  border-radius: 36px;
  background-color: white;
  border: 10px solid #1e293b;
  box-shadow: var(--shadow-lg), 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
}

.phone-content-body {
  flex-grow: 1;
  padding: 16px;
  overflow-y: auto;
  background-color: white;
}

/* Style the HTML output inside renderer to make it extremely beautiful */
.agreement-html-renderer :deep(h2) {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 10px;
  color: #0f172a;
}

.agreement-html-renderer :deep(h3) {
  font-size: 14px;
  font-weight: 600;
  margin: 15px 0 8px 0;
  color: #1e293b;
}

.agreement-html-renderer :deep(p) {
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 10px;
}

.agreement-html-renderer :deep(ul), .agreement-html-renderer :deep(ol) {
  padding-left: 20px;
  margin-bottom: 10px;
}

.agreement-html-renderer :deep(li) {
  font-size: 12px;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 4px;
}
</style>
