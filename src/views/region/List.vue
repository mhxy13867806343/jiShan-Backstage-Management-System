<template>
  <div class="region-management-container">
    <!-- Header banner -->
    <div class="header-action-bar premium-card">
      <div class="header-text-info">
        <h2>地区与定位配置管理</h2>
        <p>配置即闪 App 动态发布可选的定位列表。支持通过全国四级行政区划目录展示查阅，也可以快捷自定义常用地标。</p>
      </div>
    </div>

    <!-- Main Tabs -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick" class="region-tabs premium-card">
      <!-- TAB 1: ACTIVE LOCATIONS -->
      <el-tab-pane name="active_regions">
        <template #label>
          <span class="tab-label-custom">
            <el-icon><Location /></el-icon> 📍 常用定位地标 (App 激活)
          </span>
        </template>
        
        <div class="tab-content-wrapper">
          <div class="toolbar-header">
            <div class="panel-title">当前已激活的 App 可选位置</div>
            <!-- Quick add inline form -->
            <div class="quick-add-form">
              <el-input 
                v-model="newRegionName" 
                placeholder="地标名称（例如：广州·天河）" 
                clearable 
                style="width: 240px; margin-right: 12px;"
                @keyup.enter="handleCreateRegion"
              >
                <template #prefix>
                  <el-icon class="prefix-loc-icon"><Location /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" icon="Plus" @click="handleCreateRegion">新增地区</el-button>
            </div>
          </div>

          <!-- Regions Card Grid -->
          <div class="regions-grid-wrapper">
            <el-row :gutter="20">
              <el-col 
                v-for="region in regions" 
                :key="region.regionId || region.name" 
                :xs="24" :sm="12" :md="8" :lg="6"
              >
                <el-card class="region-card hover-transform" shadow="never">
                  <div class="region-card-content">
                    <div class="region-meta">
                      <div class="loc-icon-badge">
                        <el-icon><LocationInformation /></el-icon>
                      </div>
                      <div class="region-info">
                        <h3 class="region-title">{{ region.name }}</h3>
                        <span class="region-usage-count">
                          已选发布 <b class="count-num">{{ getRegionPostCount(region.name) }}</b> 篇动态
                        </span>
                      </div>
                    </div>

                    <!-- Action button -->
                    <el-button 
                      type="danger" 
                      plain 
                      size="small" 
                      icon="Delete"
                      class="delete-btn"
                      @click="handleDeleteRegion(region.name)"
                    >
                      删除
                    </el-button>
                  </div>
                </el-card>
              </el-col>

              <el-col v-if="!regions.length" :span="24">
                <el-empty description="暂无可选地标，请在右上方快捷增加或从全国区划导入" />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>

      <!-- TAB 2: THREE-LEVEL REGION TREE TABLE WITH A-Z FILTER -->
      <el-tab-pane name="nationwide_cascader">
        <template #label>
          <span class="tab-label-custom">
            <el-icon><MapLocation /></el-icon> 🇨🇳 三级地区树 (系统预置)
          </span>
        </template>
        
        <div class="tab-content-wrapper">
          <!-- A-Z Alphabetical Index Filter Bar -->
          <div class="alphabet-filter-bar">
            <span class="alphabet-label">按拼音首字母检索省份：</span>
            <div class="alphabet-letters">
              <span 
                v-for="letter in alphabet" 
                :key="letter"
                class="letter-pill"
                :class="{
                  'is-active': selectedLetter === letter,
                  'is-disabled': letter !== 'ALL' && !activeLetters.includes(letter)
                }"
                @click="selectLetter(letter)"
              >
                {{ letter === 'ALL' ? '全部' : letter }}
              </span>
            </div>
          </div>

          <!-- Search Panel -->
          <div class="nationwide-search-bar" style="margin-bottom: 15px;">
            <el-form :inline="true" :model="nationwideQuery" class="ruoyi-form-inline">
              <el-form-item label="地区名称">
                <el-input 
                  v-model="nationwideQuery.province" 
                  placeholder="请输入地区名称关键字 (如: 广东、广州、天河)" 
                  clearable 
                  style="width: 320px;"
                  @keyup.enter="handleNationwideQuery"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleNationwideQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetNationwideQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- Tree Table for Three-level Address Tree -->
          <el-table 
            v-loading="treeLoading"
            :data="paginatedTreeList" 
            row-key="code"
            :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
            style="width: 100%;" 
            border
          >
            <el-table-column label="地区名称" prop="name" align="left" header-align="center" width="320">
              <template #default="{ row }">
                <span class="region-name-cell" style="display: inline-flex; align-items: center; gap: 8px;">
                  <el-icon v-if="row.level === 1" style="color: #409eff;"><Grid /></el-icon>
                  <el-icon v-else-if="row.level === 2" style="color: #e6a23c;"><OfficeBuilding /></el-icon>
                  <el-icon v-else style="color: #67c23a;"><Location /></el-icon>
                  {{ row.name }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="行政区划代码" prop="code" width="220" align="center">
              <template #default="{ row }">
                <span class="font-mono text-muted">{{ row.code }}</span>
              </template>
            </el-table-column>
            <el-table-column label="行政级别" prop="levelLabel" width="220" align="center">
              <template #default="{ row }">
                <el-tag :type="getLevelTagType(row.level)" size="small">
                  {{ row.levelLabel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数据状态" width="180" align="center">
              <template #default="{ row }">
                <span 
                  class="ruoyi-badge" 
                  :class="row.status === '1' ? 'badge-success' : 'badge-info'"
                >
                  {{ row.status === '1' ? '已激活可选' : '正常预置' }}
                </span>
              </template>
            </el-table-column>
          </el-table>

          <!-- Pagination Footer -->
          <div class="ruoyi-pagination-bar" style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px;">
            <span class="pagination-info-text" style="font-size: 13px; color: #606266; font-weight: 600;">
              显示第 {{ (nationwidePage - 1) * nationwidePageSize + 1 }} 到第 {{ Math.min(nationwidePage * nationwidePageSize, nationwideTotal) }} 条记录，总共 {{ nationwideTotal }} 条记录
            </span>
            <el-pagination
              v-model:current-page="nationwidePage"
              v-model:page-size="nationwidePageSize"
              :page-sizes="[5, 10, 20]"
              layout="prev, pager, next"
              :total="nationwideTotal"
              background
            />
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useMockDataStore } from '@/store/mockData'
import { adminApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const mockStore = useMockDataStore()
const activeTab = ref('active_regions')
const newRegionName = ref('')
const regions = ref<any[]>([])

const fetchRegions = async () => {
  try {
    regions.value = await adminApi.getRegions()
  } catch (err) {
    console.error('Fetch regions failed', err)
  }
}

onMounted(() => {
  fetchRegions()
})

// Calculate usage of this location in content text
const getRegionPostCount = (region: string) => {
  const searchTerm = `[发布于 ${region}]`
  return mockStore.posts.filter(p => p.content.includes(searchTerm)).length
}

const handleCreateRegion = async () => {
  const name = newRegionName.value.trim()
  if (!name) {
    ElMessage.warning('位置名称不能为空')
    return
  }

  try {
    await adminApi.addRegion(name)
    ElMessage.success(`位置地标“${name}”创建成功！已动态装载至位置列表中。`)
    newRegionName.value = ''
    fetchRegions()
  } catch (err) {
    console.error(err)
  }
}

const handleDeleteRegion = (region: string) => {
  const usageCount = getRegionPostCount(region)
  const warnMsg = usageCount > 0 
    ? `当前已有 ${usageCount} 篇动态标记在位置“${region}”，删除后已发布的数据不受影响，但手机前台发布时将无法选择该位置。确认删除？`
    : `确定要删除可选定位“${region}”吗？`

  ElMessageBox.confirm(
    warnMsg,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: usageCount > 0 ? 'warning' : 'info',
      confirmButtonClass: usageCount > 0 ? 'el-button--danger' : ''
    }
  ).then(async () => {
    try {
      await adminApi.deleteRegion(region)
      ElMessage.success('定位地标已成功删除')
      fetchRegions()
    } catch (err) {
      console.error(err)
    }
  }).catch(() => {})
}

// ----------------------------------------------------
// TAB 2: THREE-LEVEL REGION TREE TABLE IMPLEMENTATION
// ----------------------------------------------------

const nationwideQuery = reactive({
  province: ''
})
const nationwidePage = ref(1)
const nationwidePageSize = ref(10)

// Alphabetical Index Filter variables
const selectedLetter = ref('ALL')
const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')]

const provinceLetterMap: Record<string, string> = {
  '北京市': 'B',
  '广东省': 'G',
  '四川省': 'S',
  '浙江省': 'Z',
  '天津市': 'T',
  '上海市': 'S',
  '重庆市': 'C',
  '河北省': 'H',
  '山西省': 'S',
  '辽宁省': 'L',
  '吉林省': 'J',
  '黑龙江省': 'H',
  '江苏省': 'J',
  '安徽省': 'A',
  '福建省': 'F',
  '江西省': 'J',
  '山东省': 'S',
  '河南省': 'H',
  '湖北省': 'H',
  '湖南省': 'H',
  '海南省': 'H',
  '贵州省': 'G',
  '云南省': 'Y',
  '陕西省': 'S',
  '甘肃省': 'G',
  '青海省': 'Q',
  '台湾省': 'T',
  '内蒙古自治区': 'N',
  '广西壮族自治区': 'G',
  '西藏自治区': 'X',
  '宁夏回族自治区': 'N',
  '新疆维吾尔自治区': 'X',
  '香港特别行政区': 'X',
  '澳门特别行政区': 'A'
}

const treeLoading = ref(false)
const addressTree = ref<any[]>([])

const fetchAddressTree = async () => {
  treeLoading.value = true
  try {
    const res = await adminApi.getAddressTree()
    const rawTree = res.data || []
    
    // Parse the tree to enrich it with levels and activation status
    const enrichNode = (node: any, level = 1): any => {
      let levelLabel = ''
      if (level === 1) levelLabel = '第一级 (省份/直辖市)'
      else if (level === 2) levelLabel = '第二级 (地级市)'
      else levelLabel = '第三级 (区/县)'
      
      const nodeName = node.name || node.label || ''
      const isAlreadyActive = regions.value.some(r => {
        const name = typeof r === 'string' ? r : (r.name || '')
        return name.includes(nodeName) || 
          (nodeName.length > 1 && name.includes(nodeName.replace('区', '').replace('县', '').replace('市', '')))
      })
      
      return {
        code: node.code || node.value,
        name: nodeName,
        value: node.value || node.code,
        label: node.label || node.name,
        level,
        levelLabel,
        status: isAlreadyActive ? '1' : '0',
        children: (node.children || []).map((child: any) => enrichNode(child, level + 1))
      }
    }
    
    addressTree.value = rawTree.map((item: any) => enrichNode(item, 1))
  } catch (err) {
    console.error('Fetch address tree failed', err)
    ElMessage.error('获取地区树数据失败')
  } finally {
    treeLoading.value = false
  }
}

const handleTabClick = (pane: any) => {
  const name = pane.props.name
  console.log('Region tab clicked:', name)
  if (name === 'nationwide_cascader') {
    fetchAddressTree()
  } else if (name === 'active_regions') {
    fetchRegions()
  }
}

// Watch active tab to fetch data on demand when switching tabs
watch(activeTab, (newTab) => {
  if (newTab === 'nationwide_cascader') {
    fetchAddressTree()
  } else if (newTab === 'active_regions') {
    fetchRegions()
  }
})

// Dynamic computation of active searchable letters (based on fetched provinces)
const activeLetters = computed(() => {
  const letters = new Set<string>()
  addressTree.value.forEach(item => {
    const letter = provinceLetterMap[item.name]
    if (letter) letters.add(letter)
  })
  return Array.from(letters)
})

// Apply searches, A-Z letter index filtering and recursive children matches
const filteredTreeList = computed(() => {
  if (!addressTree.value || addressTree.value.length === 0) return []
  
  let list = addressTree.value
  
  // Filter by Alphabetical index letter
  if (selectedLetter.value !== 'ALL') {
    list = list.filter(item => {
      const letter = provinceLetterMap[item.name] || 'A'
      return letter === selectedLetter.value
    })
  }
  
  const query = nationwideQuery.province.trim()
  if (!query) return list
  
  const filterNode = (node: any): any | null => {
    const selfMatches = node.name.includes(query)
    
    if (selfMatches) {
      return { ...node }
    }
    
    if (node.children && node.children.length > 0) {
      const matchedChildren = node.children
        .map((child: any) => filterNode(child))
        .filter((child: any) => child !== null)
      
      if (matchedChildren.length > 0) {
        return {
          ...node,
          children: matchedChildren
        }
      }
    }
    
    return null
  }
  
  return list
    .map(node => filterNode(node))
    .filter(node => node !== null)
})

const nationwideTotal = computed(() => filteredTreeList.value.length)

const paginatedTreeList = computed(() => {
  const start = (nationwidePage.value - 1) * nationwidePageSize.value
  return filteredTreeList.value.slice(start, start + nationwidePageSize.value)
})

const handleNationwideQuery = () => {
  nationwidePage.value = 1
}

const selectLetter = (letter: string) => {
  if (letter !== 'ALL' && !activeLetters.value.includes(letter)) return
  selectedLetter.value = letter
  nationwidePage.value = 1
}

const resetNationwideQuery = () => {
  nationwideQuery.province = ''
  selectedLetter.value = 'ALL'
  nationwidePage.value = 1
  ElMessage.success('筛选过滤条件已重置')
}

const getLevelTagType = (level: number) => {
  if (level === 1) return 'primary'
  if (level === 2) return 'warning'
  return 'success'
}
</script>

<style scoped>
.region-management-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.header-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
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

.region-tabs {
  padding: 20px 24px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

.tab-label-custom {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  font-size: 14px;
}

.tab-content-wrapper {
  padding: 15px 0 5px 0;
}

.toolbar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 15px;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-main);
  border-left: 3px solid var(--primary);
  padding-left: 8px;
}

.quick-add-form {
  display: flex;
  align-items: center;
}

.prefix-loc-icon {
  color: var(--primary);
  font-size: 14px;
}

/* Card Grid Styles */
.regions-grid-wrapper {
  margin-top: 10px;
}

.region-card {
  margin-bottom: 20px;
  border: 1px solid var(--border-color) !important;
  background-color: white;
  border-radius: 8px !important;
}

.region-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.region-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.loc-icon-badge {
  width: 36px;
  height: 36px;
  background-color: #fff7ed;
  color: #ea580c;
  border: 1px solid #ffedd5;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.region-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.region-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.region-usage-count {
  font-size: 11px;
  color: var(--text-muted);
}

.count-num {
  color: #ea580c;
  font-weight: bold;
}

.delete-btn {
  flex-shrink: 0;
}

.hover-transform {
  transition: transform 0.25s, box-shadow 0.25s;
}

.hover-transform:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.ruoyi-form-inline :deep(.el-form-item) {
  margin-bottom: 0 !important;
  margin-right: 20px !important;
}

.ruoyi-form-inline :deep(.el-form-item__label) {
  font-weight: 700;
  color: #606266;
}

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

.badge-info {
  background-color: #f5f5f5;
  color: #8c8c8c;
  border: 1px solid #d9d9d9;
}

.font-mono {
  font-family: var(--font-mono);
  font-weight: 600;
}

/* Alphabet Filter Bar Styles */
.alphabet-filter-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  background-color: #f8fafc;
  padding: 12px 18px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  margin-bottom: 15px;
}

.alphabet-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-muted);
  margin-right: 10px;
}

.alphabet-letters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.letter-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  color: var(--text-regular);
}

.letter-pill:hover:not(.is-disabled):not(.is-active) {
  background-color: #e2e8f0;
  color: var(--primary);
}

.letter-pill.is-active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(88, 86, 214, 0.3);
}

.letter-pill.is-disabled {
  color: #cbd5e1;
  cursor: not-allowed;
  font-weight: 400;
}
</style>
