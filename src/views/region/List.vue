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
    <el-tabs v-model="activeTab" class="region-tabs premium-card">
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
                :key="region" 
                :xs="24" :sm="12" :md="8" :lg="6"
              >
                <el-card class="region-card hover-transform" shadow="never">
                  <div class="region-card-content">
                    <div class="region-meta">
                      <div class="loc-icon-badge">
                        <el-icon><LocationInformation /></el-icon>
                      </div>
                      <div class="region-info">
                        <h3 class="region-title">{{ region }}</h3>
                        <span class="region-usage-count">
                          已选发布 <b class="count-num">{{ getRegionPostCount(region) }}</b> 篇动态
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
                      @click="handleDeleteRegion(region)"
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

      <!-- TAB 2: NATIONWIDE 4-LEVEL REGION BROWSER (FLAT CATALOG TABLE WITH A-Z FILTER) -->
      <el-tab-pane name="nationwide_cascader">
        <template #label>
          <span class="tab-label-custom">
            <el-icon><MapLocation /></el-icon> 🇨🇳 全国四级行政区划 (系统预置)
          </span>
        </template>
        
        <div class="tab-content-wrapper">
          <!-- A-Z Alphabetical Index Filter Bar -->
          <div class="alphabet-filter-bar">
            <span class="alphabet-label">按拼音首字母检索：</span>
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
              <el-form-item label="省份名称">
                <el-input 
                  v-model="nationwideQuery.province" 
                  placeholder="请输入省份关键字 (如: 广东)" 
                  clearable 
                  style="width: 220px;"
                  @keyup.enter="handleNationwideQuery"
                />
              </el-form-item>
              <el-form-item label="街道/乡镇">
                <el-input 
                  v-model="nationwideQuery.street" 
                  placeholder="请输入街道关键字 (如: 五山)" 
                  clearable 
                  style="width: 220px;"
                  @keyup.enter="handleNationwideQuery"
                />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" icon="Search" @click="handleNationwideQuery">搜索</el-button>
                <el-button icon="Refresh" @click="resetNationwideQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- Flat Catalog Table -->
          <el-table :data="paginatedNationwideList" style="width: 100%;" border>
            <el-table-column label="行政区划代码" prop="value" width="160" align="center">
              <template #default="{ row }">
                <span class="font-mono text-muted">{{ row.value }}</span>
              </template>
            </el-table-column>
            <el-table-column label="省份 / 直辖市" prop="province" align="center" />
            <el-table-column label="地级市" prop="city" align="center" />
            <el-table-column label="区 / 县" prop="district" align="center" />
            <el-table-column label="街道 / 乡镇" prop="street" align="center" />
            <el-table-column label="行政级别" prop="level" width="180" align="center">
              <template #default="{ row }">
                <el-tag type="info" size="small">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="数据状态" width="160" align="center">
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useMockDataStore } from '@/store/mockData'
import { adminApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const mockStore = useMockDataStore()
const activeTab = ref('active_regions')
const newRegionName = ref('')
const regions = ref<string[]>([])

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
// TAB 2: NATIONWIDE 4-LEVEL REGION TABLE LIST IMPLEMENTATION WITH A-Z FILTER
// ----------------------------------------------------

const nationwideQuery = reactive({
  province: '',
  street: ''
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
  '浙江省': 'Z'
}

// Initial 4-level region data representing Provinces, Cities, Districts, and Streets in China
const nationwideRegions = ref<any[]>([
  {
    value: '110000',
    label: '北京市',
    children: [
      {
        value: '110100',
        label: '北京市市辖区',
        children: [
          {
            value: '110105',
            label: '朝阳区',
            children: [
              { value: '110105001', label: '建外街道' },
              { value: '110105002', label: '朝外街道' },
              { value: '110105003', label: '三里屯街道' },
              { value: '110105004', label: '望京街道' }
            ]
          },
          {
            value: '110101',
            label: '东城区',
            children: [
              { value: '110101001', label: '东华门街道' },
              { value: '110101002', label: '景山街道' },
              { value: '110101003', label: '交道口街道' }
            ]
          }
        ]
      }
    ]
  },
  {
    value: '440000',
    label: '广东省',
    children: [
      {
        value: '440100',
        label: '广州市',
        children: [
          {
            value: '440106',
            label: '天河区',
            children: [
              { value: '440106001', label: '石牌街道' },
              { value: '440106002', label: '五山街道' },
              { value: '440106003', label: '员村街道' },
              { value: '440106004', label: '沙河街道' }
            ]
          },
          {
            value: '440105',
            label: '海珠区',
            children: [
              { value: '440105001', label: '赤岗街道' },
              { value: '440105002', label: '新港街道' },
              { value: '440105003', label: '昌岗街道' }
            ]
          }
        ]
      },
      {
        value: '440300',
        label: '深圳市',
        children: [
          {
            value: '440304',
            label: '福田区',
            children: [
              { value: '440304001', label: '沙头街道' },
              { value: '440304002', label: '莲花街道' },
              { value: '440304003', label: '华强北街道' },
              { value: '440304004', label: '福田街道' }
            ]
          },
          {
            value: '440305',
            label: '南山区',
            children: [
              { value: '440305001', label: '粤海街道' },
              { value: '440305002', label: '桃源街道' },
              { value: '440305003', label: '西丽街道' }
            ]
          }
        ]
      }
    ]
  },
  {
    value: '510000',
    label: '四川省',
    children: [
      {
        value: '510100',
        label: '成都市',
        children: [
          {
            value: '510107',
            label: '武侯区',
            children: [
              { value: '510107001', label: '火车南站街道' },
              { value: '510107002', label: '浆洗街街道' },
              { value: '510107003', label: '双楠街道' },
              { value: '510107004', label: '望江路街道' }
            ]
          },
          {
            value: '510105',
            label: '青羊区',
            children: [
              { value: '510105001', label: '草市街街道' },
              { value: '510105002', label: '西御河街道' },
              { value: '510105003', label: '少城街道' }
            ]
          }
        ]
      }
    ]
  },
  {
    value: '330000',
    label: '浙江省',
    children: [
      {
        value: '330100',
        label: '杭州市',
        children: [
          {
            value: '330106',
            label: '西湖区',
            children: [
              { value: '330106001', label: '翠苑街道' },
              { value: '330106002', label: '古荡街道' },
              { value: '330106003', label: '转塘街道' },
              { value: '330106004', label: '留下街道' }
            ]
          },
          {
            value: '330102',
            label: '上城区',
            children: [
              { value: '330102001', label: '清波街道' },
              { value: '330102002', label: '湖滨街道' },
              { value: '330102003', label: '小营街道' }
            ]
          }
        ]
      }
    ]
  }
])

// Dynamically flatten the 4-level region tree
const flatNationwideList = computed(() => {
  const result: any[] = []
  
  const traverse = (node: any, province = '', city = '', district = '') => {
    if (!node.children || node.children.length === 0) {
      // Map active tag pattern, e.g., "天河·五山"
      const distName = district.replace('区', '').replace('县', '')
      const strName = node.label.replace('街道', '').replace('镇', '')
      const appLocationFormat = `${distName}·${strName}`
      const isAlreadyActive = regions.value.includes(appLocationFormat)
      
      result.push({
        value: node.value,
        province,
        city: city || '市辖区',
        district,
        street: node.label,
        level: '四级 (街道/乡镇)',
        status: isAlreadyActive ? '1' : '0'
      })
    } else {
      node.children.forEach((child: any) => {
        let nextProvince = province
        let nextCity = city
        let nextDistrict = district
        
        if (!province) {
          nextProvince = node.label
        } else if (!city) {
          nextCity = node.label
        } else if (!district) {
          nextDistrict = node.label
        }
        
        traverse(child, nextProvince, nextCity, nextDistrict)
      })
    }
  }
  
  nationwideRegions.value.forEach(prov => {
    traverse(prov)
  })
  
  return result
})

// Dynamic computation of active searchable letters (based on preloaded data)
const activeLetters = computed(() => {
  const letters = new Set<string>()
  flatNationwideList.value.forEach(item => {
    const letter = provinceLetterMap[item.province]
    if (letter) letters.add(letter)
  })
  return Array.from(letters)
})

// Apply searches, filters & Alphabetical letter index
const filteredNationwideList = computed(() => {
  let list = [...flatNationwideList.value]
  
  // Filter by Alphabetical index letter
  if (selectedLetter.value !== 'ALL') {
    list = list.filter(item => {
      const letter = provinceLetterMap[item.province]
      return letter === selectedLetter.value
    })
  }
  
  // Filter by Search Query
  if (nationwideQuery.province) {
    list = list.filter(item => item.province.includes(nationwideQuery.province))
  }
  if (nationwideQuery.street) {
    list = list.filter(item => item.street.includes(nationwideQuery.street))
  }
  
  return list
})

const nationwideTotal = computed(() => filteredNationwideList.value.length)

const paginatedNationwideList = computed(() => {
  const start = (nationwidePage.value - 1) * nationwidePageSize.value
  return filteredNationwideList.value.slice(start, start + nationwidePageSize.value)
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
  nationwideQuery.street = ''
  selectedLetter.value = 'ALL'
  nationwidePage.value = 1
  ElMessage.success('筛选过滤条件已重置')
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
