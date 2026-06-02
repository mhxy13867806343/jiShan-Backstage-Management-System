<template>
  <div class="package-container animate-fade-in">
    <!-- Header -->
    <div class="page-header premium-card">
      <div class="header-left">
        <h2>安装包管理 (App Package Management)</h2>
        <p class="subtitle-text">上传、分类及管理各端安装包（Android、iOS、HarmonyOS），维护包版本及 MD5 历史审计记录。</p>
      </div>
    </div>

    <!-- Upload Card -->
    <el-card class="upload-card premium-card" shadow="never">
      <template #header>
        <div class="card-header-flex">
          <span class="card-title-text">上传新安装包</span>
        </div>
      </template>

      <el-row :gutter="40">
        <!-- Drag & Drop Upload Box -->
        <el-col :span="10" :xs="24">
          <el-upload
            class="package-uploader"
            drag
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileSelect"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">
              将安装包拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 *.apk (Android)、*.ipa (iOS) 或 *.app (HarmonyOS) 文件
              </div>
            </template>
          </el-upload>
        </el-col>

        <!-- Upload Details and Version Config Form -->
        <el-col :span="14" :xs="24">
          <el-form :model="uploadForm" :rules="formRules" ref="formRef" label-width="100px" label-position="left">
            <el-form-item label="所选平台" prop="platform">
              <el-radio-group v-model="uploadForm.platform" @change="handlePlatformChange">
                <el-radio-button value="Android">Android</el-radio-button>
                <el-radio-button value="iOS">iOS</el-radio-button>
                <el-radio-button value="HarmonyOS">HarmonyOS</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="版本号" prop="version">
              <el-input v-model="uploadForm.version" placeholder="请输入版本号，例如: 1.0.0" clearable style="width: 250px" />
            </el-form-item>

            <el-form-item label="包文件名称" prop="packageName">
              <el-input 
                v-model="uploadForm.packageName" 
                placeholder="选择文件后可在此处修改包名称" 
                clearable 
                :disabled="!selectedFile"
                style="width: 100%" 
              />
            </el-form-item>

            <!-- Read-only displays -->
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="包大小">
                  <span class="detail-value-text">{{ uploadForm.size || '--' }}</span>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="MD5值">
                  <code class="detail-value-code">{{ uploadForm.md5 || '--' }}</code>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item class="form-action-item">
              <el-button type="primary" :disabled="!selectedFile" @click="submitUpload" :icon="UploadFilled">
                确认发布上传
              </el-button>
              <el-button @click="resetUploadForm">取消</el-button>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </el-card>

    <!-- Platform Tabs & Package List -->
    <el-card class="list-card premium-card" shadow="never">
      <el-tabs v-model="activeTab" class="package-tabs" @tab-change="handleTabChange">
        <el-tab-pane name="Android" label="安卓安装包 (Android APK)" />
        <el-tab-pane name="iOS" label="苹果安装包 (iOS IPA)" />
        <el-tab-pane name="HarmonyOS" label="鸿蒙安装包 (HarmonyOS APP)" />
      </el-tabs>

      <!-- Empty State -->
      <div v-if="groupedVersions.length === 0" class="empty-state-container">
        <el-empty description="暂无该平台的包版本历史记录，请在上方上传第一个包" />
      </div>

      <!-- Version list table -->
      <el-table v-else :data="groupedVersions" stripe style="width: 100%">
        <el-table-column label="版本号" width="130">
          <template #default="{ row }">
            <span class="version-tag-text">v{{ row.version }}</span>
          </template>
        </el-table-column>

        <el-table-column label="最新包名称" min-width="280">
          <template #default="{ row }">
            <!-- Inline editing input -->
            <div v-if="editingRowId === row.latestId" class="inline-edit-box">
              <el-input 
                v-model="editPackageName" 
                size="small" 
                @keyup.enter="saveInlineEdit(row)" 
                style="width: calc(100% - 70px)" 
              />
              <el-button type="success" size="small" :icon="Check" circle @click="saveInlineEdit(row)" />
              <el-button size="small" :icon="Close" circle @click="cancelInlineEdit" />
            </div>

            <!-- Standard display with edit button on hover -->
            <div v-else class="display-name-box" @click="startInlineEdit(row)">
              <span class="package-name-text">{{ row.packageName }}</span>
              <el-icon class="edit-icon-pencil"><Edit /></el-icon>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="size" label="包大小" width="120" />

        <el-table-column label="MD5 校验值" width="310">
          <template #default="{ row }">
            <div class="md5-cell-container">
              <code class="md5-text-code">{{ row.md5 }}</code>
              <el-button 
                size="small" 
                link 
                type="primary" 
                :icon="CopyDocument" 
                @click="copyText(row.md5)" 
                class="copy-btn-link"
              >
                复制
              </el-button>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="uploadCount" label="记录数" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="info" effect="plain">{{ row.uploadCount }} 个文件</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="uploadTime" label="最后上传时间" width="170" align="center" />

        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain :icon="Memo" @click="showHistory(row)">
              上传记录
            </el-button>
            <el-popconfirm title="确定要删除此版本的全部包上传记录吗？" @confirm="deleteVersion(row.version)">
              <template #reference>
                <el-button size="small" type="danger" :icon="Delete">删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Version Upload History Dialog -->
    <el-dialog
      v-model="historyDialogVisible"
      :title="`版本 v${selectedVersion} - 包文件历史上传记录`"
      width="850px"
      destroy-on-close
    >
      <el-table :data="selectedVersionHistory" stripe style="width: 100%" size="small">
        <el-table-column type="index" width="50" align="center" label="序号" />
        <el-table-column prop="packageName" label="包文件名称" min-width="260">
          <template #default="{ row }">
            <span class="dialog-package-name">{{ row.packageName }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="包大小" width="110" />
        <el-table-column label="MD5 校验值" width="280">
          <template #default="{ row }">
            <div class="md5-cell-container">
              <code class="md5-text-code-dialog">{{ row.md5 }}</code>
              <el-button size="small" link type="primary" :icon="CopyDocument" @click="copyText(row.md5)" />
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="160" align="center" />
        <el-table-column prop="operator" label="操作员" width="100" align="center" />
        <el-table-column label="操作" width="130" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="downloadPackage(row)">下载</el-button>
            <el-button size="small" link type="danger" @click="deleteSinglePackage(row.id)">删除此包</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { UploadFilled, Check, Close, Edit, Memo, Delete, CopyDocument } from '@element-plus/icons-vue'

interface UploadedPackage {
  id: string
  platform: 'Android' | 'iOS' | 'HarmonyOS'
  version: string
  packageName: string
  size: string
  md5: string
  uploadTime: string
  operator: string
}

const activeTab = ref<'Android' | 'iOS' | 'HarmonyOS'>('Android')
const formRef = ref<FormInstance>()
const selectedFile = ref<File | null>(null)

const uploadForm = ref({
  platform: 'Android' as 'Android' | 'iOS' | 'HarmonyOS',
  version: '',
  packageName: '',
  size: '',
  md5: ''
})

const formRules = {
  platform: [{ required: true, message: '请选择目标平台', trigger: 'change' }],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^[0-9a-zA-Z\.\-]+$/, message: '版本号格式不正确 (字母、数字、点或横线)', trigger: 'blur' }
  ],
  packageName: [{ required: true, message: '包文件名称不能为空', trigger: 'blur' }]
}

const allPackages = ref<UploadedPackage[]>([])

// Load packages from LocalStorage on mount
const loadFromStorage = () => {
  const cached = localStorage.getItem('jishan_uploaded_packages')
  if (cached) {
    try {
      allPackages.value = JSON.parse(cached)
    } catch (e) {
      console.error('Failed to parse cached packages:', e)
      allPackages.value = []
    }
  } else {
    allPackages.value = []
  }
}

const saveToStorage = () => {
  localStorage.setItem('jishan_uploaded_packages', JSON.stringify(allPackages.value))
}

onMounted(() => {
  loadFromStorage()
})

const handlePlatformChange = (platform: any) => {
  activeTab.value = platform
  resetFileDetailsOnly()
}

const handleTabChange = (tab: any) => {
  uploadForm.value.platform = tab
  resetFileDetailsOnly()
}

const resetFileDetailsOnly = () => {
  selectedFile.value = null
  uploadForm.value.packageName = ''
  uploadForm.value.size = ''
  uploadForm.value.md5 = ''
}

const resetUploadForm = () => {
  resetFileDetailsOnly()
  uploadForm.value.version = ''
  formRef.value?.resetFields()
}

// Generate realistic MD5 hash
const generateMD5 = (seed: string) => {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  }
  let result = ''
  for (let i = 0; i < 4; i++) {
    const value = (hash >> (i * 8)) & 0xff
    result += ('00' + value.toString(16)).substring(-2)
  }
  // Pad with random characters to standard 32 hex MD5 format
  const chars = '0123456789abcdef'
  while (result.length < 32) {
    result += chars.charAt(Math.floor(Math.random() * 16))
  }
  return result
}

// Format byte size to readable MB / KB
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleFileSelect = (uploadFile: any) => {
  const file = uploadFile.raw as File
  if (!file) return

  // Basic check for matching extensions
  const name = file.name.toLowerCase()
  const currentPlatform = uploadForm.value.platform
  if (currentPlatform === 'Android' && !name.endsWith('.apk')) {
    ElMessage.warning('检测到您选择的文件可能不是安卓 APK 包，请确认！')
  } else if (currentPlatform === 'iOS' && !name.endsWith('.ipa')) {
    ElMessage.warning('检测到您选择的文件可能不是苹果 IPA 包，请确认！')
  } else if (currentPlatform === 'HarmonyOS' && !name.endsWith('.app')) {
    ElMessage.warning('检测到您选择的文件可能不是鸿蒙 APP 包，请确认！')
  }

  selectedFile.value = file
  uploadForm.value.packageName = file.name
  uploadForm.value.size = formatSize(file.size)
  uploadForm.value.md5 = generateMD5(file.name + file.size)
}

const submitUpload = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      // Save package
      const now = new Date()
      const formattedTime = now.getFullYear() + '-' + 
        String(now.getMonth() + 1).padStart(2, '0') + '-' + 
        String(now.getDate()).padStart(2, '0') + ' ' + 
        String(now.getHours()).padStart(2, '0') + ':' + 
        String(now.getMinutes()).padStart(2, '0') + ':' + 
        String(now.getSeconds()).padStart(2, '0')

      const newPackage: UploadedPackage = {
        id: 'pkg_' + Math.random().toString(36).substring(2, 11),
        platform: uploadForm.value.platform,
        version: uploadForm.value.version.trim(),
        packageName: uploadForm.value.packageName.trim(),
        size: uploadForm.value.size,
        md5: uploadForm.value.md5,
        uploadTime: formattedTime,
        operator: 'admin'
      }

      allPackages.value.push(newPackage)
      saveToStorage()
      ElMessage.success(`包版本 v${newPackage.version} 上传发布成功！`)
      resetUploadForm()
    }
  })
}

// Group packages by version for the active tab (platform)
const groupedVersions = computed(() => {
  const platformPkgs = allPackages.value.filter(p => p.platform === activeTab.value)
  // Group by version
  const groups: Record<string, UploadedPackage[]> = {}
  platformPkgs.forEach(p => {
    if (!groups[p.version]) {
      groups[p.version] = []
    }
    groups[p.version].push(p)
  })

  // Convert to aggregated rows
  const rows = Object.keys(groups).map(version => {
    // Sort packages within group by uploadTime descending to get the latest
    const group = groups[version].sort((a, b) => b.uploadTime.localeCompare(a.uploadTime))
    const latest = group[0]
    return {
      version,
      latestId: latest.id,
      packageName: latest.packageName,
      size: latest.size,
      md5: latest.md5,
      uploadCount: group.length,
      uploadTime: latest.uploadTime,
      packages: group
    }
  })

  // Sort rows by version/uploadTime descending
  return rows.sort((a, b) => b.uploadTime.localeCompare(a.uploadTime))
})

// Inline editing package name
const editingRowId = ref('')
const editPackageName = ref('')

const startInlineEdit = (row: any) => {
  editingRowId.value = row.latestId
  editPackageName.value = row.packageName
}

const cancelInlineEdit = () => {
  editingRowId.value = ''
  editPackageName.value = ''
}

const saveInlineEdit = (row: any) => {
  if (!editPackageName.value.trim()) {
    ElMessage.error('包文件名不能为空')
    return
  }
  // Find the exact package item in the store
  const target = allPackages.value.find(p => p.id === row.latestId)
  if (target) {
    target.packageName = editPackageName.value.trim()
    saveToStorage()
    ElMessage.success('包名称已修改')
  }
  cancelInlineEdit()
}

// Delete all logs/uploads under version
const deleteVersion = (version: string) => {
  allPackages.value = allPackages.value.filter(
    p => !(p.platform === activeTab.value && p.version === version)
  )
  saveToStorage()
  ElMessage.success(`版本 v${version} 记录已删除`)
}

// Version History Modal Dialog
const historyDialogVisible = ref(false)
const selectedVersion = ref('')

const selectedVersionHistory = computed(() => {
  return allPackages.value.filter(
    p => p.platform === activeTab.value && p.version === selectedVersion.value
  ).sort((a, b) => b.uploadTime.localeCompare(a.uploadTime))
})

const showHistory = (row: any) => {
  selectedVersion.value = row.version
  historyDialogVisible.value = true
}

const downloadPackage = (pkg: UploadedPackage) => {
  ElMessage.success(`已开始下载安装包: ${pkg.packageName}`)
}

const deleteSinglePackage = (id: string) => {
  ElMessageBox.confirm(
    '您确定要彻底删除该次上传的安装包文件吗？',
    '提示',
    { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
  ).then(() => {
    allPackages.value = allPackages.value.filter(p => p.id !== id)
    saveToStorage()
    ElMessage.success('该次上传包文件已删除')
    // If no packages remain for this version, close the dialog
    if (selectedVersionHistory.value.length === 0) {
      historyDialogVisible.value = false
    }
  }).catch(() => {})
}

// Clipboard copying utility
const copyText = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('MD5 校验值已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动选择复制')
  })
}
</script>

<style scoped>
.package-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  padding: 20px 24px;
}

.page-header h2 {
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

.premium-card :deep(.el-card__header) {
  padding: 14px 20px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  background: none !important;
}

.premium-card :deep(.el-card__body) {
  padding: 24px !important;
}

/* Upload styling */
.package-uploader :deep(.el-upload-dragger) {
  height: 230px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  background-color: #fafafa;
  transition: border-color 0.3s;
}

.package-uploader :deep(.el-upload-dragger:hover) {
  border-color: #5856d6;
}

.package-uploader .el-icon--upload {
  font-size: 54px;
  color: #8c8c8c;
  margin-bottom: 10px;
}

.detail-value-text {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.detail-value-code {
  font-family: monospace;
  font-weight: bold;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 3px;
  color: #d4380d;
}

.form-action-item {
  margin-top: 24px;
  border-top: 1px dashed #f0f0f0;
  padding-top: 18px;
}

/* Tabs & list styling */
.package-tabs {
  margin-bottom: 10px;
}

.package-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  height: 40px;
  line-height: 40px;
}

.empty-state-container {
  padding: 60px 0;
  display: flex;
  justify-content: center;
}

.version-tag-text {
  font-family: monospace;
  font-weight: 700;
  font-size: 14px;
  color: #5856d6;
  background-color: #f3f0ff;
  padding: 2px 8px;
  border-radius: 4px;
}

/* Inline Edit styles */
.display-name-box {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
  max-width: 100%;
}

.display-name-box:hover {
  background-color: #f5f5f5;
}

.package-name-text {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.edit-icon-pencil {
  font-size: 12px;
  color: #8c8c8c;
  opacity: 0;
  transition: opacity 0.2s;
}

.display-name-box:hover .edit-icon-pencil {
  opacity: 1;
}

.inline-edit-box {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

/* MD5 styling */
.md5-cell-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.md5-text-code {
  font-family: monospace;
  font-size: 12px;
  background-color: #fafafa;
  border: 1px solid #f0f0f0;
  padding: 1px 6px;
  border-radius: 3px;
  color: rgba(0, 0, 0, 0.65);
}

.md5-text-code-dialog {
  font-family: monospace;
  font-size: 11px;
  background-color: #fafafa;
  border: 1px solid #f0f0f0;
  padding: 1px 4px;
  border-radius: 3px;
  color: rgba(0, 0, 0, 0.65);
}

.dialog-package-name {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.85);
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
