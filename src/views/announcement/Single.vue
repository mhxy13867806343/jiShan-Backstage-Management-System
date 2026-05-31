<template>
  <div class="single-ann-container">
    <!-- Header -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>单公告管理</h2>
        <p>设置 App 首页展示的全局置顶公告，发布后所有用户可见。</p>
      </div>
      <el-tag :type="form.status === 'active' ? 'success' : 'info'" size="large">
        {{ form.status === 'active' ? '当前状态：已发布' : '当前状态：已停用' }}
      </el-tag>
    </div>

    <!-- Editor + Preview 两栏布局 -->
    <div class="editor-layout">
      <!-- Left: 编辑区 -->
      <div class="editor-panel premium-card">
        <div class="panel-title">
          <el-icon><Edit /></el-icon> 公告内容编辑
        </div>

        <el-form :model="form" :rules="rules" ref="formRef" label-width="90px">
          <el-form-item label="公告标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="50" show-word-limit />
          </el-form-item>

          <el-form-item label="公告类型" prop="type">
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
            <el-date-picker
              v-model="form.startTime"
              type="datetime"
              placeholder="开始时间"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 200px"
            />
            <span style="margin: 0 8px; color: #909399;">至</span>
            <el-date-picker
              v-model="form.endTime"
              type="datetime"
              placeholder="结束时间（不填则永久）"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
              style="width: 200px"
            />
          </el-form-item>

          <el-form-item label="公告正文" prop="content">
            <el-input
              v-model="form.content"
              type="textarea"
              :rows="5"
              placeholder="请输入公告正文内容"
              maxlength="500"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="启用状态">
            <el-switch
              v-model="form.statusActive"
              active-text="已发布（用户可见）"
              inactive-text="停用（用户不可见）"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- Right: 手机预览 -->
      <div class="preview-panel">
        <div class="panel-title preview-title">
          <el-icon><View /></el-icon> 效果预览
        </div>
        <div class="phone-mockup">
          <div class="phone-frame">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <!-- App Bar -->
              <div class="app-bar">
                <span class="app-bar-title">即闪</span>
                <div class="app-bar-icons">
                  <span class="icon-dot">●</span>
                  <span class="icon-dot">●</span>
                </div>
              </div>

              <!-- Announcement Banner -->
              <transition name="banner-fade">
                <div
                  v-if="form.statusActive && (form.title || form.content)"
                  class="ann-banner"
                  :class="'ann-' + form.type"
                >
                  <el-icon class="ann-icon">
                    <component :is="typeIconMap[form.type]" />
                  </el-icon>
                  <div class="ann-text">
                    <div class="ann-title-preview">{{ form.title || '公告标题' }}</div>
                    <div class="ann-content-preview">{{ form.content || '公告内容将在这里显示...' }}</div>
                  </div>
                  <el-icon class="ann-close">
                    <Close />
                  </el-icon>
                </div>
              </transition>

              <!-- Feed skeleton -->
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
            {{ form.statusActive ? '✅ 公告已开启，用户可见' : '⚠️ 公告已停用，用户不可见' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Action Bar -->
    <div class="bottom-action-bar">
      <div class="action-bar-inner">
        <el-button icon="RefreshLeft" @click="handleReset">重置</el-button>
        <el-button type="primary" icon="Check" :loading="saving" @click="handleSave">
          保存并发布
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const formRef = ref<FormInstance>()
const saving = ref(false)

const typeIconMap: Record<string, string> = {
  info: 'InfoFilled',
  warning: 'WarningFilled',
  danger: 'CircleCloseFilled',
}

const defaultForm = () => ({
  title: '【系统通知】即闪 App 服务升级公告',
  type: 'info' as 'info' | 'warning' | 'danger',
  content: '亲爱的用户，我们将于 2026-06-01 凌晨 2:00-4:00 进行服务器维护升级，届时部分功能可能短暂不可用，感谢您的理解与支持。',
  link: '',
  startTime: '2026-06-01 00:00',
  endTime: '',
  statusActive: true,
  status: 'active' as 'active' | 'inactive',
})

const form = reactive(defaultForm())

const rules = {
  title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }],
}

const handleReset = () => {
  Object.assign(form, defaultForm())
  ElMessage.info('已重置')
}

const handleSave = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  setTimeout(() => {
    form.status = form.statusActive ? 'active' : 'inactive'
    saving.value = false
    ElMessage.success('单公告已保存并发布')
  }, 500)
}
</script>

<style scoped>
.single-ann-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;
}

/* ── Header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 3px;
}

.header-left p {
  font-size: 13px;
  color: var(--text-muted);
}

/* ── Layout ── */
.editor-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
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

.editor-panel {
  padding: 24px;
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
  padding: 16px 20px 0;
  border-bottom: none;
  margin-bottom: 12px;
}

.phone-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.phone-frame {
  width: 240px;
  height: 460px;
  background: #1a1a2e;
  border-radius: 36px;
  padding: 14px 10px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.1);
  position: relative;
  overflow: hidden;
}

.phone-notch {
  width: 60px;
  height: 18px;
  background: #0d0d1a;
  border-radius: 0 0 12px 12px;
  margin: 0 auto 6px;
}

.phone-screen {
  background: #f5f7fa;
  border-radius: 20px;
  height: calc(100% - 28px);
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

.app-bar-title {
  font-size: 13px;
  font-weight: 700;
  color: #222;
}

.app-bar-icons {
  display: flex;
  gap: 6px;
}

.icon-dot {
  font-size: 8px;
  color: #bbb;
}

/* ── Announcement Banner in preview ── */
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

.ann-icon {
  font-size: 12px;
  margin-top: 1px;
  flex-shrink: 0;
}

.ann-info .ann-icon    { color: #1677ff; }
.ann-warning .ann-icon { color: #faad14; }
.ann-danger .ann-icon  { color: #ff4d4f; }

.ann-text { flex: 1; min-width: 0; }

.ann-title-preview {
  font-weight: 700;
  color: #222;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ann-content-preview {
  color: #666;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.ann-close {
  font-size: 10px;
  color: #bbb;
  flex-shrink: 0;
}

/* ── Feed skeleton ── */
.feed-skeleton {
  flex: 1;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feed-item {
  display: flex;
  gap: 8px;
  align-items: center;
}

.feed-avatar-sk {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  flex-shrink: 0;
}

.feed-lines { flex: 1; display: flex; flex-direction: column; gap: 5px; }

.feed-line {
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
}

.feed-line.long { width: 80%; }
.feed-line.short { width: 50%; }

/* ── Banner animation ── */
.banner-fade-enter-active,
.banner-fade-leave-active { transition: all 0.3s ease; }
.banner-fade-enter-from,
.banner-fade-leave-to { opacity: 0; transform: translateY(-8px); }

.preview-label {
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
}

/* ── Bottom action bar ── */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
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
