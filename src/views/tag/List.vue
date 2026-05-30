<template>
  <div class="tag-management-container">
    <!-- Header panel -->
    <div class="header-action-bar premium-card">
      <div class="header-text-info">
        <h2>标签与话题配置管理</h2>
        <p>配置即闪广场社区话题标签列表。在此管理的话题将同步呈现在前台App与后台统计分析中。</p>
      </div>
    </div>

    <!-- Main Tabs Wrap -->
    <el-tabs v-model="activeTab" class="tag-tabs premium-card">
      <!-- TAB 1: TOPIC CONFIGURATION & ANTI-FRAUD -->
      <el-tab-pane name="config">
        <template #label>
          <span class="tab-label-custom">
            <el-icon><PriceTag /></el-icon> 🏷️ 话题配置与反诈分析
          </span>
        </template>

        <div class="tab-content-wrapper" style="padding-top: 15px;">
          <!-- Inline Toolbar with quick adder -->
          <div class="toolbar-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #e8e8e8; padding-bottom: 15px; flex-wrap: wrap; gap: 12px;">
            <div class="panel-title" style="font-size: 15px; font-weight: 700; color: var(--text-main); border-left: 3px solid var(--primary); padding-left: 8px;">
              社区动态推荐话题配置
            </div>
            
            <div class="quick-add-form" style="display: flex; align-items: center;">
              <el-input 
                v-model="newTagName" 
                placeholder="请输入话题名称（无需带#）" 
                clearable 
                style="width: 240px; margin-right: 12px;"
                @keyup.enter="handleCreateTag"
              >
                <template #prefix>
                  <span class="prefix-hash">#</span>
                </template>
              </el-input>
              <el-button type="primary" icon="Plus" @click="handleCreateTag">新增标签</el-button>
            </div>
          </div>

          <!-- Tags Card Grid -->
          <div class="tags-grid-wrapper">
            <el-row :gutter="20">
              <el-col 
                v-for="tag in mockStore.tags" 
                :key="tag" 
                :xs="24" :sm="12" :md="8" :lg="6"
              >
                <el-card class="tag-card premium-card hover-transform" shadow="never">
                  <div class="tag-card-content">
                    <div class="tag-meta">
                      <div class="hash-icon-badge">#</div>
                      <div class="tag-info">
                        <h3 class="tag-title">{{ tag }}</h3>
                        <span class="tag-usage-count">
                          已关联 <b class="count-num">{{ getTagPostCount(tag) }}</b> 篇动态
                        </span>
                        <span class="tag-usage-count" style="margin-top: 4px; display: block; color: var(--danger);">
                          <el-icon style="vertical-align: middle; margin-right: 2px;"><Warning /></el-icon>
                          被骗关联次数：<b class="scam-num">{{ getTagScamCount(tag) }}</b> 次
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
                      @click="handleDeleteTag(tag)"
                    >
                      删除
                    </el-button>
                  </div>
                </el-card>
              </el-col>

              <el-col v-if="!mockStore.tags.length" :span="24">
                <el-empty description="暂无平台配置的话题标签，请在上方快捷新增" />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-tab-pane>

      <!-- TAB 2: TOPIC SEARCH HEAT STATISTICS -->
      <el-tab-pane name="search_stats">
        <template #label>
          <span class="tab-label-custom">
            <el-icon><Search /></el-icon> 🔍 话题搜索热度统计
          </span>
        </template>
        
        <div class="tab-content-wrapper" style="padding-top: 15px;">
          <!-- Toolbar Header -->
          <div class="toolbar-header" style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8e8e8; padding-bottom: 15px;">
            <div class="panel-title" style="font-size: 15px; font-weight: 700; color: var(--text-main); border-left: 3px solid var(--primary); padding-left: 8px;">
              平台话题用户搜索行为排行
            </div>
            <div class="search-desc" style="font-size: 12px; color: var(--text-muted);">
              展示前台 App 用户搜索框检索该标签的总频次与流行度趋势。
            </div>
          </div>
          
          <!-- Table of search stats -->
          <el-table :data="sortedSearchStats" style="width: 100%;" border>
            <el-table-column label="搜索排名" width="100" align="center">
              <template #default="{ $index }">
                <span class="rank-badge" :class="`rank-${$index + 1}`">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="话题标签" align="center">
              <template #default="{ row }">
                <span class="tag-label-pill"># {{ row.tag }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="关联动态数" prop="postCount" width="150" align="center">
              <template #default="{ row }">
                <b class="count-num">{{ row.postCount }}</b> 篇
              </template>
            </el-table-column>
            
            <el-table-column label="被骗关联次数" prop="scamCount" width="160" align="center">
              <template #default="{ row }">
                <span style="color: var(--danger); font-weight: bold;">{{ row.scamCount }} 次</span>
              </template>
            </el-table-column>
            
            <el-table-column label="被搜索总次数" prop="searchCount" width="180" align="center">
              <template #default="{ row }">
                <span class="search-count-text">{{ row.searchCount.toLocaleString() }} 次</span>
              </template>
            </el-table-column>
            
            <el-table-column label="热度走向" width="160" align="center">
              <template #default="{ row }">
                <el-tag :type="row.trendType" size="small" class="trend-tag">
                  {{ row.trendText }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMockDataStore } from '@/store/mockData'
import { ElMessage, ElMessageBox } from 'element-plus'

const mockStore = useMockDataStore()
const activeTab = ref('config')
const newTagName = ref('')

// Calculate usage count of this tag across mock posts
const getTagPostCount = (tag: string) => {
  const searchTerm = `#${tag}`
  return mockStore.posts.filter(p => p.content.includes(searchTerm)).length
}

// Calculate scammed count dynamically with realistic fallback
const getTagScamCount = (tag: string) => {
  const searchTerm = `#${tag}`
  const scamKeywords = ['骗', '诈骗', '杀猪盘', '套路', '上当', '虚假', '刷单', '被扣', '举报']
  const postsWithTag = mockStore.posts.filter(p => p.content.includes(searchTerm))
  const keywordCount = postsWithTag.filter(p => 
    scamKeywords.some(keyword => p.content.includes(keyword))
  ).length
  
  if (keywordCount > 0) return keywordCount
  
  // Deterministic mock count to make every tag look active and realistic
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash += tag.charCodeAt(i)
  }
  return (hash % 12) + 1
}

// Compute dynamic, highly realistic user search statistics
const sortedSearchStats = computed(() => {
  const list = mockStore.tags.map(tag => {
    let hash = 0
    for (let i = 0; i < tag.length; i++) {
      hash += tag.charCodeAt(i) * (i + 3)
    }
    const searchCount = (hash % 8500) + 1200
    
    let trendType: 'danger' | 'warning' | 'info' | 'success' = 'info'
    let trendText = '➡️ 平稳表现'
    const trendMod = hash % 4
    if (trendMod === 0) {
      trendType = 'danger'
      trendText = '🔥 持续攀升'
    } else if (trendMod === 1) {
      trendType = 'warning'
      trendText = '📈 稳步上升'
    } else if (trendMod === 2) {
      trendType = 'info'
      trendText = '➡️ 平稳表现'
    } else {
      trendType = 'success'
      trendText = '📉 略有回落'
    }

    return {
      tag,
      postCount: getTagPostCount(tag),
      scamCount: getTagScamCount(tag),
      searchCount,
      trendType,
      trendText
    }
  })
  
  return list.sort((a, b) => b.searchCount - a.searchCount)
})

const handleCreateTag = () => {
  const name = newTagName.value.trim().replace(/^#+/, '')
  if (!name) {
    ElMessage.warning('标签名称不能为空')
    return
  }

  const success = mockStore.addTag(name)
  if (success) {
    ElMessage.success(`标签话题“#${name}”创建成功！已动态下发至模拟器推荐列表。`)
    newTagName.value = ''
  } else {
    ElMessage.warning('该标签已存在')
  }
}

const handleDeleteTag = (tag: string) => {
  const usageCount = getTagPostCount(tag)
  const warnMsg = usageCount > 0 
    ? `当前已有 ${usageCount} 篇动态使用了话题“#${tag}”，删除该标签将不会移除帖子中的文字话题，但将不再推荐展示，确定要删除吗？`
    : `确定要删除标签话题“#${tag}”吗？`

  ElMessageBox.confirm(
    warnMsg,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: usageCount > 0 ? 'warning' : 'info',
      confirmButtonClass: usageCount > 0 ? 'el-button--danger' : ''
    }
  ).then(() => {
    const success = mockStore.deleteTag(tag)
    if (success) {
      ElMessage.success('标签话题已成功删除')
    } else {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.tag-management-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
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

.tag-tabs {
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

.quick-add-form {
  display: flex;
  align-items: center;
}

.prefix-hash {
  font-weight: bold;
  color: var(--primary);
  font-size: 14px;
}

/* Card Grid Styles */
.tags-grid-wrapper {
  margin-top: 10px;
}

.tag-card {
  margin-bottom: 20px;
  border: 1px solid var(--border-color) !important;
  background-color: white;
  border-radius: 12px !important;
}

.tag-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.tag-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hash-icon-badge {
  width: 36px;
  height: 36px;
  background-color: #eff6ff;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tag-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tag-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-main);
  margin: 0;
}

.tag-usage-count {
  font-size: 11px;
  color: var(--text-muted);
}

.count-num {
  color: #3b82f6;
  font-weight: bold;
}

.scam-num {
  color: var(--danger);
  font-weight: 700;
  font-family: var(--font-mono);
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

/* Search stats table specific styling */
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: 700;
  font-size: 12px;
  color: var(--text-muted);
  background-color: #f1f5f9;
}

.rank-1 {
  background-color: #fef3c7;
  color: #d97706;
  border: 1px solid #fde68a;
}

.rank-2 {
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}

.rank-3 {
  background-color: #ffedd5;
  color: #ea580c;
  border: 1px solid #fed7aa;
}

.tag-label-pill {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
}

.search-count-text {
  font-weight: bold;
  color: var(--primary);
  font-family: var(--font-mono);
}

.trend-tag {
  font-weight: 700;
}
</style>
