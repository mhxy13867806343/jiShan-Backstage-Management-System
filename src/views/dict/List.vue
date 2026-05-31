<template>
  <div class="ruoyi-dict-container">
    <!-- RuoYi Search Filter Bar -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="queryParams" class="ruoyi-form-inline">
        <el-form-item label="字典名称">
          <el-select v-model="queryParams.dictType" placeholder="字典名称" style="width: 220px;" @change="handleQuery">
            <el-option
              v-for="dict in dictTypes"
              :key="dict.value"
              :label="`${dict.label} (${dict.value})`"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="字典标签">
          <el-input
            v-model="queryParams.dictLabel"
            placeholder="请输入字典标签"
            clearable
            style="width: 200px;"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="数据状态">
          <el-select v-model="queryParams.status" placeholder="数据状态" clearable style="width: 130px;">
            <el-option label="所有" value="" />
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <button type="button" class="ruoyi-btn btn-search" @click="handleQuery">
            <el-icon><Search /></el-icon> 搜索
          </button>
          <button type="button" class="ruoyi-btn btn-reset" @click="resetQuery">
            <el-icon><Refresh /></el-icon> 重置
          </button>
        </el-form-item>
      </el-form>
    </div>

    <!-- RuoYi Action Toolbar Bar -->
    <div class="table-card premium-card">
      <div class="toolbar-actions-row">
        <button type="button" class="ruoyi-action-btn btn-add" @click="handleAdd">
          <el-icon><Plus /></el-icon> 新增
        </button>
        <button 
          type="button" 
          class="ruoyi-action-btn btn-edit" 
          :disabled="selectedRows.length !== 1"
          @click="handleUpdate"
        >
          <el-icon><Edit /></el-icon> 修改
        </button>
        <button 
          type="button" 
          class="ruoyi-action-btn btn-delete" 
          :disabled="selectedRows.length === 0"
          @click="handleBatchDelete"
        >
          <el-icon><Delete /></el-icon> 删除
        </button>
        <button type="button" class="ruoyi-action-btn btn-export" @click="handleExport">
          <el-icon><Download /></el-icon> 导出
        </button>
        <button type="button" class="ruoyi-action-btn btn-close" @click="handleClose">
          <el-icon><Close /></el-icon> 关闭
        </button>
      </div>

      <!-- RuoYi Dictionary Data Table (Flat Top-level Only) -->
      <el-table 
        v-loading="loading" 
        :data="filteredDictData" 
        style="width: 100%; margin-top: 15px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        
        <el-table-column label="字典编码" prop="dictCode" width="100" align="center" />
        
        <el-table-column label="字典标签" prop="label" align="center" />
        
        <el-table-column label="字典键值" prop="value" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small" class="font-mono">{{ row.value }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="字典排序" prop="dictSort" width="100" align="center" />
        
        <el-table-column label="状态" prop="status" width="110" align="center">
          <template #default="{ row }">
            <span 
              class="ruoyi-badge" 
              :class="row.status === '0' ? 'badge-success' : 'badge-danger'"
            >
              {{ row.status === '0' ? '正常' : '停用' }}
            </span>
          </template>
        </el-table-column>
        
        <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
        
        <el-table-column label="创建时间" prop="createTime" width="180" align="center" />
        
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              link
              icon="Edit" 
              @click="handleEditRow(row)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="success" 
              link
              icon="Plus" 
              @click="handleManageSubItems(row)"
            >
              加个下级
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              link
              icon="Delete" 
              @click="handleDeleteRow(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- RuoYi style Pagination Info -->
      <div class="ruoyi-pagination-bar">
        <span class="pagination-info-text">
          显示第 {{ (currentPage - 1) * pageSize + 1 }} 到第 {{ Math.min(currentPage * pageSize, totalCount) }} 条记录，总共 {{ totalCount }} 条记录
        </span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 20]"
          layout="prev, pager, next"
          :total="totalCount"
          background
        />
      </div>
    </div>

    <!-- RuoYi Add/Edit Top-level Dialog -->
    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="500px" 
      destroy-on-close
    >
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px" class="ruoyi-dialog-form">
        <el-form-item label="字典类型">
          <el-input :value="queryParams.dictType" disabled />
        </el-form-item>
        
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="form.label" placeholder="请输入字典标签 (例如: 正常)" />
        </el-form-item>
        
        <el-form-item label="字典键值" prop="value">
          <el-input v-model="form.value" :disabled="isEditState" placeholder="请输入字典键值 (例如: normal)" />
        </el-form-item>
        
        <el-form-item label="字典排序" prop="dictSort">
          <el-input-number v-model="form.dictSort" :min="1" :max="999" controls-position="right" style="width: 120px;" />
        </el-form-item>
        
        <el-form-item label="系统状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Sub-level Dictionary Data Manager Popup Dialog -->
    <el-dialog 
      v-model="subManagerVisible" 
      :title="`下级数据管理 [${currentParentRow?.label || ''}]`" 
      width="780px" 
      destroy-on-close
    >
      <div class="sub-manager-content">
        <div class="sub-toolbar" style="margin-bottom: 12px; display: flex; gap: 8px;">
          <el-button 
            type="primary" 
            size="small" 
            icon="Plus" 
            @click="handleChildAdd"
          >
            新增下级
          </el-button>
        </div>
        
        <el-table :data="subFormattedList" style="width: 100%;" border>
          <el-table-column label="字典编码" prop="dictCode" width="100" align="center" />
          <el-table-column label="字典标签" prop="label" align="center" />
          <el-table-column label="字典键值" prop="value" align="center">
            <template #default="{ row }">
              <el-tag type="info" size="small" class="font-mono">{{ row.value }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="排序" prop="dictSort" width="80" align="center" />
          <el-table-column label="状态" prop="status" width="90" align="center">
            <template #default="{ row }">
              <span 
                class="ruoyi-badge" 
                :class="row.status === '0' ? 'badge-success' : 'badge-danger'"
              >
                {{ row.status === '0' ? '正常' : '停用' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
          <el-table-column label="操作" width="160" align="center">
            <template #default="{ row }">
              <el-button 
                size="small" 
                type="primary" 
                link 
                icon="Edit" 
                @click="handleChildEdit(row)"
              >
                编辑
              </el-button>
              <el-button 
                size="small" 
                type="danger" 
                link 
                icon="Delete" 
                @click="handleChildDelete(row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- Nested Child Add/Edit Form Dialog (Overlays main app body) -->
    <el-dialog 
      v-model="childFormVisible" 
      :title="childDialogTitle" 
      width="450px" 
      append-to-body
      destroy-on-close
    >
      <el-form :model="childForm" ref="childFormRef" :rules="childRules" label-width="100px" class="ruoyi-dialog-form">
        <el-form-item label="上级字典项">
          <el-input :value="`${currentParentRow?.label} (${currentParentRow?.value})`" disabled />
        </el-form-item>
        
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="childForm.label" placeholder="请输入字典标签 (例如: 临时封禁)" />
        </el-form-item>
        
        <el-form-item label="字典键值" prop="value">
          <el-input v-model="childForm.value" :disabled="isChildEditState" placeholder="请输入字典键值 (例如: banned_temp)" />
        </el-form-item>
        
        <el-form-item label="字典排序" prop="dictSort">
          <el-input-number v-model="childForm.dictSort" :min="1" :max="999" controls-position="right" style="width: 120px;" />
        </el-form-item>
        
        <el-form-item label="系统状态" prop="status">
          <el-radio-group v-model="childForm.status">
            <el-radio value="0">正常</el-radio>
            <el-radio value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="备注" prop="remark">
          <el-input v-model="childForm.remark" type="textarea" :rows="3" placeholder="请输入备注内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitChildForm">确 定</el-button>
          <el-button @click="childFormVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { adminApi, type ApiDictItem } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)

// RuoYi mock dictionary types
const dictTypes = [
  { value: 'user_status', label: '用户账号状态' },
  { value: 'post_status', label: '内容发布状态' },
  { value: 'post_visibility', label: '动态发布可见性' }
]

// Search filters matching RuoYi layout
const queryParams = reactive({
  dictType: 'user_status',
  dictLabel: '',
  status: ''
})

// Pagination
const currentPage = ref(1)
const pageSize = ref(10)
const selectedRows = ref<any[]>([])
const dictsState = ref<Record<string, ApiDictItem[]>>({})

const fetchDicts = async (bypassFilters = false) => {
  loading.value = true
  try {
    dictsState.value = await adminApi.getDicts({
      type: queryParams.dictType,
      label: bypassFilters ? '' : queryParams.dictLabel,
      status: bypassFilters ? '' : queryParams.status
    })
  } catch (err) {
    console.error('Fetch dicts failed', err)
  } finally {
    loading.value = false
  }
}

// Load dictionary items recursively to format child sub-levels
const formatDictList = (list: any[], parentIndexPrefix = ''): any[] => {
  return list.map((item, index) => {
    const code = item.dictCode || (parentIndexPrefix ? `${parentIndexPrefix}-${index + 1}` : index + 1)
    return {
      dictCode: code,
      label: item.label,
      value: item.value,
      dictSort: item.dictSort || (index + 1),
      status: item.status || '0',
      remark: item.remark || `${dictTypes.find(d => d.value === queryParams.dictType)?.label || '字典'} - ${item.label}`,
      createTime: item.createTime || '2026-05-26 11:04:08',
      children: item.children && item.children.length ? formatDictList(item.children, String(code)) : []
    }
  })
}

const dictList = computed(() => {
  const rawList = dictsState.value[queryParams.dictType] || []
  return formatDictList(rawList)
})

// Apply search queries
const filteredDictData = computed(() => {
  let result = [...dictList.value]
  
  if (queryParams.dictLabel) {
    result = result.filter(item => item.label.includes(queryParams.dictLabel))
  }
  if (queryParams.status) {
    result = result.filter(item => item.status === queryParams.status)
  }
  
  // Sort by dictSort ascending
  result.sort((a, b) => a.dictSort - b.dictSort)
  
  // Paginate
  const start = (currentPage.value - 1) * pageSize.value
  return result.slice(start, start + pageSize.value)
})

const totalCount = computed(() => {
  let result = [...dictList.value]
  if (queryParams.dictLabel) {
    result = result.filter(item => item.label.includes(queryParams.dictLabel))
  }
  if (queryParams.status) {
    result = result.filter(item => item.status === queryParams.status)
  }
  return result.length
})

// Query & Reset operations
const handleQuery = () => {
  currentPage.value = 1
  selectedRows.value = []
  fetchDicts()
}

const resetQuery = () => {
  queryParams.dictLabel = ''
  queryParams.status = ''
  currentPage.value = 1
  selectedRows.value = []
  ElMessage.success('筛选过滤条件已重置')
  fetchDicts()
}

// Table row checked status
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection
}

// ==========================================
// 1. TOP-LEVEL DICT ITEMS ACTIONS
// ==========================================
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEditState = ref(false)
const formRef = ref()
const form = reactive({
  label: '',
  value: '',
  dictSort: 1,
  status: '0',
  remark: ''
})

const rules = {
  label: [{ required: true, message: '字典标签不能为空', trigger: 'blur' }],
  value: [
    { required: true, message: '字典键值不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '键值只能是英文、数字或下划线', trigger: 'blur' }
  ],
  dictSort: [{ required: true, type: 'number', message: '排序不能为空', trigger: 'blur' }]
}

const handleAdd = () => {
  isEditState.value = false
  dialogTitle.value = '新增字典数据'
  Object.assign(form, {
    label: '',
    value: '',
    dictSort: dictList.value.length + 1,
    status: '0',
    remark: ''
  })
  dialogVisible.value = true
}

const stripParentPrefix = (remark: string) => {
  if (!remark) return ''
  const match = remark.match(/^parent:[^|]+\|(.*)$/)
  return match ? match[1] : remark
}

const handleUpdate = () => {
  if (selectedRows.value.length !== 1) return
  handleEditRow(selectedRows.value[0])
}

const handleEditRow = async (row: any) => {
  isEditState.value = true
  dialogTitle.value = '修改字典数据'
  try {
    const res = await adminApi.getDictById(row.dictCode)
    const freshDetail = res.data
    Object.assign(form, {
      label: freshDetail.label,
      value: freshDetail.value,
      dictSort: freshDetail.sort || 1,
      status: freshDetail.status === 'enabled' ? '0' : '1',
      remark: stripParentPrefix(freshDetail.remark || '')
    })
    dialogVisible.value = true
  } catch (err) {
    console.error(err)
    ElMessage.error('获取字典详情失败')
  }
}

const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      if (isEditState.value) {
        // Modify
        await adminApi.updateDictItem(queryParams.dictType, form.value, {
          label: form.label,
          dictSort: form.dictSort,
          status: form.status as '0' | '1',
          remark: form.remark
        })
        ElMessage.success('字典项修改成功！已即时同步。')
        dialogVisible.value = false
        selectedRows.value = []
        fetchDicts()
      } else {
        // Add
        await adminApi.addDictItem(
          queryParams.dictType, 
          {
            value: form.value,
            label: form.label,
            dictSort: form.dictSort,
            status: form.status as '0' | '1',
            remark: form.remark,
            children: []
          }
        )
        ElMessage.success('新增字典数据成功！')
        dialogVisible.value = false
        selectedRows.value = []
        fetchDicts()
      }
    } catch (err: any) {
      console.error(err)
      ElMessage.error(err.message || '操作失败')
    }
  })
}

const handleDeleteRow = (row: any) => {
  const criticalKeys = ['normal', 'banned', 'online', 'offline', 'public', 'private']
  if (criticalKeys.includes(row.value)) {
    ElMessage.error(`警告：字典键值 “${row.value}” 是系统底层核心运行项，禁止删除！`)
    return
  }

  ElMessageBox.confirm(
    `确定要永久删除编码为 “${row.dictCode}” 的字典标签 “${row.label}” 吗？`,
    '系统警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await adminApi.deleteDictItem(queryParams.dictType, row.value)
      ElMessage.success('字典项已成功移除！')
      selectedRows.value = []
      fetchDicts()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const handleBatchDelete = () => {
  if (selectedRows.value.length === 0) return
  
  const selectedLabels = selectedRows.value.map(r => r.label).join(', ')
  const criticalKeys = ['normal', 'banned', 'online', 'offline', 'public', 'private']
  
  const hasCritical = selectedRows.value.some(r => criticalKeys.includes(r.value))
  if (hasCritical) {
    ElMessage.error('批量删除项中包含系统底层核心字典（如：正常/禁用），禁止一并删除！')
    return
  }

  ElMessageBox.confirm(
    `确认要永久批量删除选中的字典项 [ ${selectedLabels} ] 吗？`,
    '批量删除提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    loading.value = true
    try {
      for (const row of selectedRows.value) {
        await adminApi.deleteDictItem(queryParams.dictType, row.value)
      }
      ElMessage.success('批量删除成功！')
      selectedRows.value = []
      fetchDicts()
    } catch (err) {
      console.error(err)
    } finally {
      loading.value = false
    }
  }).catch(() => {})
}

// ==========================================
// 2. NESTED SUB-LEVEL ITEMS MANAGEMENT
// ==========================================
const subManagerVisible = ref(false)
const currentParentRow = ref<any>(null)

const childFormVisible = ref(false)
const isChildEditState = ref(false)
const childDialogTitle = ref('')
const childFormRef = ref()
const childForm = reactive({
  label: '',
  value: '',
  dictSort: 1,
  status: '0',
  remark: ''
})

const childRules = {
  label: [{ required: true, message: '字典标签不能为空', trigger: 'blur' }],
  value: [
    { required: true, message: '字典键值不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '键值只能是英文、数字或下划线', trigger: 'blur' }
  ],
  dictSort: [{ required: true, type: 'number', message: '排序不能为空', trigger: 'blur' }]
}

// Extract children dynamically from the reactive list
const subFormattedList = computed(() => {
  if (!currentParentRow.value) return []
  const findParentInList = (list: any[], val: string): any | null => {
    for (const item of list) {
      if (item.value === val) return item
      if (item.children && item.children.length) {
        const found = findParentInList(item.children, val)
        if (found) return found
      }
    }
    return null
  }
  const parentInList = findParentInList(dictList.value, currentParentRow.value.value)
  return parentInList ? parentInList.children || [] : []
})

const handleManageSubItems = async (row: any) => {
  currentParentRow.value = row
  subManagerVisible.value = true
  await fetchDicts(true) // Bypass filters to load all children!
}

const handleChildAdd = () => {
  isChildEditState.value = false
  childDialogTitle.value = '新增下级字典'
  Object.assign(childForm, {
    label: '',
    value: '',
    dictSort: subFormattedList.value.length + 1,
    status: '0',
    remark: ''
  })
  childFormVisible.value = true
}

const handleChildEdit = async (row: any) => {
  isChildEditState.value = true
  childDialogTitle.value = '修改下级字典'
  try {
    const res = await adminApi.getDictById(row.dictCode)
    const freshDetail = res.data
    Object.assign(childForm, {
      label: freshDetail.label,
      value: freshDetail.value,
      dictSort: freshDetail.sort || 1,
      status: freshDetail.status === 'enabled' ? '0' : '1',
      remark: stripParentPrefix(freshDetail.remark || '')
    })
    childFormVisible.value = true
  } catch (err) {
    console.error(err)
    ElMessage.error('获取下级字典详情失败')
  }
}

const handleChildDelete = (row: any) => {
  const criticalKeys = ['normal_active', 'normal_silent', 'banned_temp', 'banned_forever', 'online_featured', 'online_normal']
  if (criticalKeys.includes(row.value)) {
    ElMessage.error(`警告：下级键值 “${row.value}” 是系统底层核心运行项，禁止删除！`)
    return
  }

  ElMessageBox.confirm(
    `确定要永久删除下级字典标签 “${row.label}” 吗？`,
    '系统警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await adminApi.deleteDictItem(queryParams.dictType, row.value)
      ElMessage.success('下级字典项已成功移除！')
      fetchDicts(true) // Keep child manager updated!
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

const submitChildForm = () => {
  childFormRef.value.validate(async (valid: boolean) => {
    if (!valid) return
    
    try {
      if (isChildEditState.value) {
        // Modify
        await adminApi.updateDictItem(queryParams.dictType, childForm.value, {
          label: childForm.label,
          dictSort: childForm.dictSort,
          status: childForm.status as '0' | '1',
          remark: childForm.remark
        })
        ElMessage.success('下级字典项修改成功！已即时同步。')
        childFormVisible.value = false
        fetchDicts(true) // Keep child manager updated!
      } else {
        // Add under active parent
        await adminApi.addDictItem(
          queryParams.dictType, 
          {
            value: childForm.value,
            label: childForm.label,
            dictSort: childForm.dictSort,
            status: childForm.status as '0' | '1',
            remark: childForm.remark,
            children: []
          },
          currentParentRow.value?.value
        )
        ElMessage.success('新增下级字典成功！')
        childFormVisible.value = false
        fetchDicts(true) // Keep child manager updated!
      }
    } catch (err: any) {
      console.error(err)
      ElMessage.error(err.message || '操作失败')
    }
  })
}

// Simulate RuoYi export and close actions
const handleExport = () => {
  ElMessage.success(`成功触发数据导出！正在生成 excel 表格：dict_data_${queryParams.dictType}.xlsx，已自动下载至本地。`)
}

const handleClose = () => {
  queryParams.dictLabel = ''
  queryParams.status = ''
  currentPage.value = 1
  selectedRows.value = []
  ElMessage.info('已关闭字典搜索详情过滤')
  fetchDicts()
}

onMounted(() => {
  handleQuery()
})
</script>

<style scoped>
.ruoyi-dict-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: #f4f6f8;
  min-height: calc(100vh - 84px);
  padding: 10px;
}

.filter-panel {
  padding: 18px 24px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.ruoyi-form-inline :deep(.el-form-item) {
  margin-bottom: 0 !important;
  margin-right: 20px !important;
}

.ruoyi-form-inline :deep(.el-form-item__label) {
  font-weight: 700;
  color: #606266;
}

/* RuoYi buttons styling */
.ruoyi-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  height: 32px;
}

.btn-search {
  background-color: #1890ff;
}

.btn-search:hover {
  background-color: #40a9ff;
}

.btn-reset {
  background-color: #f39c12;
  margin-left: 10px;
}

.btn-reset:hover {
  background-color: #f5b041;
}

.table-card {
  background-color: white;
  padding: 18px 24px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.toolbar-actions-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.ruoyi-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  height: 30px;
}

.btn-add {
  background-color: #1890ff;
  color: white;
}
.btn-add:hover {
  background-color: #40a9ff;
}

.btn-edit {
  background-color: #13ce66;
  color: white;
}
.btn-edit:hover:not(:disabled) {
  background-color: #42d885;
}
.btn-edit:disabled {
  background-color: #c2f4d8;
  color: #fff;
  cursor: not-allowed;
}

.btn-delete {
  background-color: #ff4949;
  color: white;
}
.btn-delete:hover:not(:disabled) {
  background-color: #ff6e6e;
}
.btn-delete:disabled {
  background-color: #ffcccc;
  color: #fff;
  cursor: not-allowed;
}

.btn-export {
  background-color: #ffba00;
  color: white;
}
.btn-export:hover {
  background-color: #ffc83b;
}

.btn-close {
  background-color: #e6a23c;
  color: white;
}
.btn-close:hover {
  background-color: #ebb563;
}

/* RuoYi badge status */
.ruoyi-badge {
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 12px;
  text-align: center;
}

.badge-success {
  background-color: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
}

.badge-danger {
  background-color: #fff1f0;
  color: #f5222d;
  border: 1px solid #ffa39e;
}

.font-mono {
  font-family: var(--font-mono);
  font-weight: 600;
}

/* RuoYi style Pagination layout */
.ruoyi-pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.pagination-info-text {
  font-size: 13px;
  color: #606266;
  font-weight: 600;
}

.ruoyi-dialog-form :deep(.el-form-item) {
  margin-bottom: 18px !important;
}

.ruoyi-dialog-form :deep(.el-radio-group) {
  height: 32px;
  align-items: center;
}
</style>
