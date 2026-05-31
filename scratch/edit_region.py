import os

region_path = "/Users/hooksvue/Desktop/jiShan Backstage Management System/src/views/region/List.vue"

with open(region_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's replace the tab nationwide_cascader completely
# Start marker: <!-- TAB 2: NATIONWIDE 4-LEVEL REGION BROWSER (FLAT CATALOG TABLE WITH A-Z FILTER) -->
# End marker: </el-tab-pane> (the second one)
# Let's find the exact block for nationwide_cascader tab
start_marker = "<!-- TAB 2: NATIONWIDE 4-LEVEL REGION BROWSER (FLAT CATALOG TABLE WITH A-Z FILTER) -->"
end_marker = "</el-tab-pane>"

start_idx = content.find(start_marker)
if start_idx == -1:
    print("Could not find start marker in template!")
    exit(1)

# Find the next </el-tab-pane> after start_marker
end_idx = content.find(end_marker, start_idx)
if end_idx == -1:
    print("Could not find end marker in template!")
    exit(1)

# Ensure we include the closing tag </el-tab-pane>
end_idx += len(end_marker)

replacement_tab = """<!-- TAB 2: THREE-LEVEL REGION TREE TABLE WITH A-Z FILTER -->
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
      </el-tab-pane>"""

# Replace in template
template_replaced = content[:start_idx] + replacement_tab + content[end_idx:]

# Let's find script block in template_replaced
script_start = template_replaced.find("<script setup")
script_end = template_replaced.find("</script>") + len("</script>")

if script_start == -1 or script_end == -1:
    print("Could not find script block!")
    exit(1)

# Replacement script setup
replacement_script = """<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
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
      const isAlreadyActive = regions.value.some(r => 
        r.includes(nodeName) || 
        (nodeName.length > 1 && r.includes(nodeName.replace('区', '').replace('县', '').replace('市', '')))
      )
      
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

// Watch active tab to fetch data on demand when switching tabs
watch(activeTab, (newTab) => {
  if (newTab === 'nationwide_cascader') {
    fetchAddressTree()
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
</script>"""

final_content = template_replaced[:script_start] + replacement_script + template_replaced[script_end:]

with open(region_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("List.vue updated successfully with address tree table!")
