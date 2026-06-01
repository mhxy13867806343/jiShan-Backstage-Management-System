<template>
  <div class="menu-list-container">
    <!-- Premium Glassmorphic Filter Card -->
    <el-card class="filter-card">
      <div class="filter-header">
        <div class="title-section">
          <el-icon class="title-icon"><Grid /></el-icon>
          <span class="title-text">菜单与路由管理</span>
        </div>
        <el-button type="primary" class="add-btn" @click="handleCreate">
          <el-icon style="margin-right: 4px;"><Plus /></el-icon>新增根菜单
        </el-button>
      </div>

      <el-form :inline="true" :model="queryParams" class="query-form">
        <el-form-item label="菜单名称/路由名称">
          <el-input 
            v-model="queryParams.keyword" 
            placeholder="请输入关键字..." 
            clearable 
            class="query-input"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="选择状态" clearable style="width: 130px;">
            <el-option label="启用" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="search-btn" @click="handleQuery">
            <el-icon style="margin-right: 4px;"><Search /></el-icon>查询
          </el-button>
          <el-button @click="resetQuery">
            <el-icon style="margin-right: 4px;"><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Main Table Card -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        :row-key="isFiltered ? 'menuId' : 'menuId'"
        border
        default-expand-all
        class="custom-table"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <!-- Title & Icon -->
        <el-table-column label="菜单名称" prop="title" min-width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center;">
              <el-icon v-if="scope.row.icon" class="menu-row-icon">
                <component :is="scope.row.icon" />
              </el-icon>
              <span class="menu-title-text">{{ scope.row.title }}</span>
            </div>
          </template>
        </el-table-column>

        <!-- Route Name -->
        <el-table-column label="路由名称" prop="name" min-width="120">
          <template #default="scope">
            <el-tag size="small" type="info" class="monospace-tag">{{ scope.row.name }}</el-tag>
          </template>
        </el-table-column>

        <!-- Route Path -->
        <el-table-column label="路由路径" prop="path" min-width="140">
          <template #default="scope">
            <code class="code-path">{{ scope.row.path }}</code>
          </template>
        </el-table-column>

        <!-- Component Path -->
        <el-table-column label="组件路径" prop="component" min-width="180">
          <template #default="scope">
            <span v-if="scope.row.component" class="code-path component-active">{{ scope.row.component }}</span>
            <el-tag v-else size="small" type="warning" effect="plain">目录 (无组件)</el-tag>
          </template>
        </el-table-column>

        <!-- Sort Order -->
        <el-table-column label="排序" prop="sort" width="80" align="center">
          <template #default="scope">
            <el-tag size="small" type="success" effect="light">{{ scope.row.sort }}</el-tag>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column label="状态" prop="status" width="90" align="center">
          <template #default="scope">
            <el-tag 
              :type="scope.row.status === 'active' ? 'success' : 'danger'" 
              size="small" 
              effect="dark"
            >
              {{ scope.row.status === 'active' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- Operations -->
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button 
              v-if="!scope.row.component"
              type="primary" 
              link 
              size="small" 
              @click="handleAddSub(scope.row)"
            >
              <el-icon><Plus /></el-icon>新增子项
            </el-button>
            <el-button 
              type="warning" 
              link 
              size="small" 
              @click="handleEdit(scope.row)"
            >
              <el-icon><Edit /></el-icon>编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              size="small" 
              @click="handleDelete(scope.row)"
            >
              <el-icon><Delete /></el-icon>删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增菜单' : '编辑菜单'"
      width="580px"
      destroy-on-close
      class="menu-dialog"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="menu-form"
      >
        <!-- Parent Menu Selection -->
        <el-form-item label="上级菜单" prop="parentId">
          <el-select 
            v-model="form.parentId" 
            placeholder="请选择上级菜单 (不选为根菜单)" 
            clearable 
            style="width: 100%;"
          >
            <el-option label="根菜单 (无上级)" :value="null" />
            <el-option 
              v-for="opt in parentOptions" 
              :key="opt.menuId" 
              :label="opt.title" 
              :value="opt.menuId" 
            />
          </el-select>
        </el-form-item>

        <!-- Title -->
        <el-form-item label="菜单名称" prop="title">
          <el-input v-model="form.title" placeholder="如：用户管理, 数据看板" />
        </el-form-item>

        <!-- Route Name -->
        <el-form-item label="路由名称" prop="name">
          <el-input v-model="form.name" placeholder="英文驼峰，如：UserList" />
        </el-form-item>

        <!-- Route Path -->
        <el-form-item label="路由路径" prop="path">
          <el-input v-model="form.path" placeholder="如：/user 或 user" />
        </el-form-item>

        <!-- Component Path -->
        <el-form-item label="组件路径" prop="component">
          <el-input v-model="form.component" placeholder="如：user/List.vue (目录则留空)" clearable />
          <div class="form-tip">留空代表这是一个折叠子菜单的“目录组”，不需要映射页面。</div>
        </el-form-item>

        <!-- Dynamic Icon Picker -->
        <el-form-item label="菜单图标" prop="icon">
          <el-popover
            placement="bottom-start"
            :width="440"
            trigger="click"
            popper-class="icon-picker-popover"
          >
            <template #reference>
              <el-input v-model="form.icon" placeholder="点击选择图标..." readonly style="cursor: pointer;">
                <template #prefix>
                  <el-icon v-if="form.icon"><component :is="form.icon" /></el-icon>
                </template>
              </el-input>
            </template>
            <div class="icon-picker-list">
              <div 
                v-for="ico in iconList" 
                :key="ico" 
                class="icon-picker-item"
                :class="{ 'active': form.icon === ico }"
                @click="form.icon = ico"
              >
                <el-icon><component :is="ico" /></el-icon>
                <span class="icon-name">{{ ico }}</span>
              </div>
            </div>
          </el-popover>
        </el-form-item>

        <!-- Sort & Status -->
        <div style="display: flex; gap: 20px;">
          <el-form-item label="显示排序" prop="sort" style="flex: 1;">
            <el-input-number v-model="form.sort" :min="1" :max="999" style="width: 100%;" />
          </el-form-item>

          <el-form-item label="菜单状态" prop="status" style="flex: 1;">
            <el-radio-group v-model="form.status">
              <el-radio-button label="active">启用</el-radio-button>
              <el-radio-button label="inactive">禁用</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </div>

        <!-- Breadcrumbs Mock Tags -->
        <el-form-item label="面包屑导航" prop="breadcrumbsStr">
          <el-input v-model="form.breadcrumbsStr" placeholder="逗号分隔，如：系统配置,菜单管理" />
          <div class="form-tip">用于上方导航的面包屑多级路径显示。</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminApi, type ApiMenuItem } from '@/api/admin'
import { useMenuStore } from '@/store/menu'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

// Dynamic Pinia Menu Store
const menuStore = useMenuStore()

// State
const loading = ref(false)
const tableData = ref<ApiMenuItem[]>([])
const flatMenusList = ref<ApiMenuItem[]>([])
const isFiltered = ref(false)

const queryParams = ref({
  keyword: '',
  status: ''
})

// Dynamic Icon Options list (Element Plus standard icons)
const iconList = [
  'Odometer', 'User', 'Document', 'ChatLineSquare', 'Smartphone', 
  'UserFilled', 'Bell', 'Promotion', 'List', 'Upload', 'Setting', 
  'PriceTag', 'Location', 'Memo', 'Message', 'Lock', 'Checked', 
  'Grid', 'Platform', 'Warning', 'Share', 'Menu', 'HomeFilled'
]

// Dialog State
const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

const form = ref({
  menuId: '',
  parentId: null as string | null,
  title: '',
  name: '',
  path: '',
  component: '',
  icon: '',
  sort: 1,
  status: 'active' as 'active' | 'inactive',
  breadcrumbsStr: ''
})

// Rules
const rules: FormRules = {
  title: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入路由名称', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入路由路径', trigger: 'blur' }
  ]
}

// Fetch all flat menus list to choose parents dynamically
const fetchFlatMenus = async () => {
  try {
    const res = await adminApi.getMenus()
    const rawList = Array.isArray(res) 
      ? res 
      : (Array.isArray((res as any)?.list) 
          ? (res as any).list 
          : (Array.isArray((res as any)?.data?.list) 
              ? (res as any).data.list 
              : (Array.isArray((res as any)?.data) 
                  ? (res as any).data 
                  : [])))
    
    // Map status enabled/disabled to active/inactive cleanly for UI
    flatMenusList.value = rawList.map((item: any) => ({
      ...item,
      status: (item.status === 'enabled' || item.status === 'active') ? 'active' : 'inactive'
    }))
  } catch (err) {
    console.error('Failed to load flat menus list:', err)
  }
}

// Fetch Grid data
const getList = async () => {
  loading.value = true
  try {
    const hasFilters = queryParams.value.keyword || queryParams.value.status
    if (hasFilters) {
      isFiltered.value = true
      const res = await adminApi.getMenus(queryParams.value)
      const rawList = Array.isArray(res) 
        ? res 
        : (Array.isArray((res as any)?.list) 
            ? (res as any).list 
            : (Array.isArray((res as any)?.data?.list) 
                ? (res as any).data.list 
                : (Array.isArray((res as any)?.data) 
                    ? (res as any).data 
                    : [])))
      tableData.value = rawList.map((item: any) => ({
        ...item,
        status: (item.status === 'enabled' || item.status === 'active') ? 'active' : 'inactive'
      }))
    } else {
      isFiltered.value = false
      const tree = await adminApi.getMenuTree({ onlyActive: false })
      const rawTree = Array.isArray(tree) 
        ? tree 
        : (Array.isArray((tree as any)?.list) 
            ? (tree as any).list 
            : (Array.isArray((tree as any)?.data?.list) 
                ? (tree as any).data.list 
                : (Array.isArray((tree as any)?.data) 
                    ? (tree as any).data 
                    : [])))
      
      // Adapt status recursively for trees
      const adaptTreeStatus = (nodes: any[]): any[] => {
        return nodes.map((node: any) => ({
          ...node,
          status: (node.status === 'enabled' || node.status === 'active') ? 'active' : 'inactive',
          children: node.children ? adaptTreeStatus(node.children) : []
        }))
      }
      tableData.value = adaptTreeStatus(rawTree)
    }
  } catch (err) {
    console.error('Failed to get menus data:', err)
    ElMessage.error('获取菜单路由列表失败')
  } finally {
    loading.value = false
  }
}

// Parent Options computed dropdown
const parentOptions = computed(() => {
  return flatMenusList.value.filter(m => !m.component && m.menuId !== form.value.menuId)
})

// Query & Reset
const handleQuery = () => {
  getList()
}

const resetQuery = () => {
  queryParams.value = {
    keyword: '',
    status: ''
  }
  getList()
}

// Open dialog to create root item
const handleCreate = () => {
  dialogType.value = 'add'
  form.value = {
    menuId: '',
    parentId: null,
    title: '',
    name: '',
    path: '',
    component: '',
    icon: 'Document',
    sort: flatMenusList.value.length + 1,
    status: 'active',
    breadcrumbsStr: ''
  }
  dialogVisible.value = true
}

// Open dialog to create sub item
const handleAddSub = (row: ApiMenuItem) => {
  dialogType.value = 'add'
  form.value = {
    menuId: '',
    parentId: row.menuId,
    title: '',
    name: '',
    path: '',
    component: '',
    icon: 'Document',
    sort: 1,
    status: 'active',
    breadcrumbsStr: row.title
  }
  dialogVisible.value = true
}

// Open dialog to edit item
const handleEdit = (row: ApiMenuItem) => {
  dialogType.value = 'edit'
  form.value = {
    menuId: row.menuId,
    parentId: row.parentId,
    title: row.title,
    name: row.name,
    path: row.path,
    component: row.component || '',
    icon: row.icon || '',
    sort: row.sort,
    status: (row.status === 'enabled' || row.status === 'active') ? 'active' : 'inactive',
    breadcrumbsStr: (row.breadcrumbs || []).join(',')
  }
  dialogVisible.value = true
}

// Form Submission
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        const payload = {
          parentId: form.value.parentId,
          title: form.value.title,
          name: form.value.name,
          path: form.value.path,
          component: form.value.component,
          icon: form.value.icon,
          sort: form.value.sort,
          status: (form.value.status === 'active' ? 'enabled' : 'disabled') as 'enabled' | 'disabled',
          breadcrumbs: form.value.breadcrumbsStr ? form.value.breadcrumbsStr.split(',').map(s => s.trim()) : []
        }

        if (dialogType.value === 'add') {
          await adminApi.addMenu(payload)
          ElMessage.success('新增菜单成功')
        } else {
          await adminApi.updateMenu(form.value.menuId, payload)
          ElMessage.success('编辑菜单成功')
        }
        
        dialogVisible.value = false
        
        // Refresh local grids
        await getList()
        await fetchFlatMenus()

        // 🌟 WOW EFFECT: Instantly refresh left sidebar menu structure in real-time
        await menuStore.fetchMenuTree(true)
      } catch (err) {
        console.error('Submit menu failed:', err)
        ElMessage.error('提交菜单表单失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// Delete item
const handleDelete = (row: ApiMenuItem) => {
  ElMessageBox.confirm(
    `确定要删除菜单“${row.title}”吗？若该菜单有子项，其所有子项都将被级联删除！`,
    '删除警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      await adminApi.deleteMenu(row.menuId)
      ElMessage.success('菜单已成功级联删除')
      
      // Refresh local grids
      await getList()
      await fetchFlatMenus()

      // 🌟 WOW EFFECT: Instantly refresh left sidebar menu structure in real-time
      await menuStore.fetchMenuTree(true)
    } catch (err) {
      console.error('Delete menu failed:', err)
      ElMessage.error('删除菜单失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  getList()
  fetchFlatMenus()
})
</script>

<script lang="ts">
// Make this view cached under keep-alive
export default {
  name: 'MenuList'
}
</script>

<style scoped>
.menu-list-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.4s ease-out;
}

/* Premium Filter Card Styling */
.filter-card {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 12px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
  color: #1890ff;
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #000000d9;
}

.query-form {
  margin-top: 10px;
}

.query-input {
  width: 220px;
}

.search-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
}

.add-btn {
  background: linear-gradient(135deg, #52c41a 0%, #389e0d 100%);
  border: none;
}

/* Table Card Styling */
.table-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.custom-table :deep(.el-table__header-wrapper) th {
  background-color: #fafafa !important;
  color: #000000d9;
  font-weight: 600;
}

.menu-row-icon {
  font-size: 16px;
  color: #1890ff;
  margin-right: 8px;
}

.menu-title-text {
  font-weight: 500;
  color: #000000d9;
}

.monospace-tag {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.code-path {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 12px;
  background-color: #f5f5f5;
  padding: 2px 6px;
  border-radius: 4px;
  color: #c41d7f;
  border: 1px solid #f0f0f0;
}

.component-active {
  color: #096dd9;
  background-color: #e6f7ff;
  border-color: #bae7ff;
}

/* Form Styles */
.form-tip {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.5;
}

/* Dynamic Icon Selector Popover */
.icon-picker-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  max-height: 280px;
  overflow-y: auto;
  padding: 8px;
}

.icon-picker-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 64px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-picker-item:hover {
  border-color: #1890ff;
  color: #1890ff;
  background-color: #e6f7ff;
  transform: translateY(-2px);
}

.icon-picker-item.active {
  border-color: #1890ff;
  color: #ffffff;
  background-color: #1890ff;
}

.icon-name {
  font-size: 10px;
  text-align: center;
  max-width: 90%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
