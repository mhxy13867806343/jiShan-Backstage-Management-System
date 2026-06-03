<template>
  <div class="share-list-container animate-fade-in">
    <!-- Active post/user filter notification bar -->
    <div v-if="activePostId || activeUserId" class="filter-alert-box glass-effect">
      <div class="alert-left">
        <el-icon class="alert-icon"><InfoFilled /></el-icon>
        <span class="alert-text">
          当前正在筛选
          <template v-if="activePostId">
            内容ID为 <b class="font-mono">{{ activePostId }}</b>
          </template>
          <template v-if="activePostId && activeUserId"> 且 </template>
          <template v-if="activeUserId">
            用户ID为 <b class="font-mono">{{ activeUserId }}</b>
          </template>
          的分享记录。
        </span>
      </div>
      <el-button type="primary" size="small" plain icon="Close" @click="clearActiveFilters">
        清除筛选显示全部
      </el-button>
    </div>

    <!-- Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="内容ID">
          <el-input v-model="searchForm.postId" placeholder="内容ID (精确)" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.userId" placeholder="用户ID (精确)" clearable style="width: 180px;" />
        </el-form-item>
        <el-form-item label="分享平台">
          <el-select v-model="searchForm.platform" placeholder="全部平台" clearable style="width: 150px;">
            <el-option label="全部" value="" />
            <el-option label="微信 (wechat)" value="wechat" />
            <el-option label="微信朋友圈 (timeline)" value="timeline" />
            <el-option label="QQ" value="qq" />
            <el-option label="微博 (weibo)" value="weibo" />
            <el-option label="网页 H5" value="h5" />
          </el-select>
        </el-form-item>
        <el-form-item label="检索关键词">
          <el-input v-model="searchForm.keyword" placeholder="内容 / 昵称 / 用户ID" clearable style="width: 200px;" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Data Table Card -->
    <div class="table-card premium-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="table-title-text">分享记录列表</span>
        </div>
        <div class="toolbar-right">
          <span class="stats-text">
            共找到 <b>{{ totalCount }}</b> 条分享记录
          </span>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="shareId" label="分享ID" width="100" align="center" />

        <el-table-column label="分享人" width="220">
          <template #default="{ row }">
            <div class="user-profile-cell" v-if="row.userId">
              <el-avatar :size="32" :src="row.avatar || undefined" style="margin-right: 8px;">
                {{ row.nickname ? row.nickname.substring(0, 1) : 'U' }}
              </el-avatar>
              <div class="user-profile-info">
                <span class="nickname">{{ row.nickname || '即闪用户' }}</span>
                <span class="user-id font-mono">ID: {{ row.userId }}</span>
              </div>
            </div>
            <div class="anonymous-cell" v-else>
              <el-avatar :size="32" icon="User" style="margin-right: 8px; background-color: #e4e7ed; color: #909399;" />
              <div class="user-profile-info">
                <span class="nickname text-gray">游客用户</span>
                <span class="user-id font-mono">ID: --</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="被分享内容摘要" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="post-content-cell">
              <span class="post-snippet">{{ row.content || '(文字内容为空)' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="内容状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.postStatus === 'online' ? 'success' : 'info'" size="small">
              {{ row.postStatus === 'online' ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="分享平台 / 场景" min-width="180">
          <template #default="{ row }">
            <div class="badge-group">
              <el-tag :type="getPlatformTagType(row.platform)" size="small" effect="dark" style="margin-right: 6px;">
                {{ getPlatformLabel(row.platform) }}
              </el-tag>
              <el-tag v-if="row.scene" type="info" size="small" effect="light">
                {{ getSceneLabel(row.scene) }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="postId" label="内容ID" width="130" align="center">
          <template #default="{ row }">
            <el-link type="primary" class="font-mono" @click="handleFilterPost(row.postId)">
              {{ row.postId }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="分享时间" width="170" align="center" sortable>
          <template #default="{ row }">
            <span>{{ formatDateTime(row.createdAt || row.sharedAt) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="danger" 
              plain 
              icon="Delete" 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="GLOBAL_PAGE_SIZES"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalCount"
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled } from '@element-plus/icons-vue'
import { GLOBAL_PAGE_SIZE, GLOBAL_PAGE_SIZES } from '@/hooks/usePagination'

const route = useRoute()
const router = useRouter()

const tableData = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(GLOBAL_PAGE_SIZE)
const loading = ref(false)

const searchForm = reactive({
  postId: '',
  userId: '',
  platform: '',
  keyword: ''
})

const activePostId = computed(() => (route.query.post_id as string) || '')
const activeUserId = computed(() => (route.query.user_id as string) || '')

const formatDateTime = (val: string) => {
  if (!val) return '--'
  return val.replace('T', ' ').substring(0, 19)
}

const getPlatformLabel = (platform: string) => {
  if (!platform) return '其他'
  const lower = platform.toLowerCase()
  if (lower === 'wechat' || lower === 'weixin') return '微信好友'
  if (lower === 'timeline') return '微信朋友圈'
  if (lower === 'qq') return 'QQ好友'
  if (lower === 'weibo') return '新浪微博'
  if (lower === 'h5') return '网页 H5'
  return platform
}

const getPlatformTagType = (platform: string) => {
  if (!platform) return 'info'
  const lower = platform.toLowerCase()
  if (lower === 'wechat' || lower === 'weixin' || lower === 'timeline') return 'success'
  if (lower === 'qq') return 'primary'
  if (lower === 'weibo') return 'danger'
  if (lower === 'h5') return 'warning'
  return 'info'
}

const getSceneLabel = (scene: string) => {
  if (!scene) return ''
  const lower = scene.toLowerCase()
  if (lower === 'timeline') return '朋友圈'
  if (lower === 'session') return '单聊好友'
  if (lower === 'group') return '微信群聊'
  if (lower === 'feed') return '信息流'
  if (lower === 'detail') return '详情页'
  if (lower === 'profile') return '个人主页'
  return scene
}

const fetchShares = async () => {
  loading.value = true
  try {
    const res = await adminApi.getShares({
      postId: searchForm.postId || undefined,
      userId: searchForm.userId || undefined,
      platform: searchForm.platform || undefined,
      keyword: searchForm.keyword || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    
    tableData.value = res.list || []
    totalCount.value = res.total || 0
  } catch (err) {
    console.error('Failed to fetch shares list:', err)
  } finally {
    loading.value = false
  }
}

// Watch router query parameters to drive filters
watch(
  () => route.query,
  (query) => {
    searchForm.postId = (query.post_id as string) || ''
    searchForm.userId = (query.user_id as string) || ''
    currentPage.value = 1
    fetchShares()
  },
  { immediate: true, deep: true }
)

const handleSearch = () => {
  currentPage.value = 1
  const newQuery: any = {}
  if (searchForm.postId) newQuery.post_id = searchForm.postId
  if (searchForm.userId) newQuery.user_id = searchForm.userId
  
  router.replace({ path: route.path, query: newQuery })
}

const handleReset = () => {
  searchForm.postId = ''
  searchForm.userId = ''
  searchForm.platform = ''
  searchForm.keyword = ''
  currentPage.value = 1
  router.replace({ path: route.path, query: {} })
}

const clearActiveFilters = () => {
  handleReset()
}

const handleFilterPost = (postId: string) => {
  searchForm.postId = postId
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchShares()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchShares()
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要永久删除该分享记录吗？删除后对应文章的分享总数会自动扣减。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await adminApi.deleteShare(row.shareId)
      if (res.code === 200 || res.message === 'success') {
        ElMessage.success('分享记录已成功删除')
        fetchShares()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (err: any) {
      console.error('deleteShare error', err)
      ElMessage.error(err.message || '删除失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.share-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-alert-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  border-radius: 12px;
  background-color: rgba(0, 122, 255, 0.08);
  border: 1px solid rgba(0, 122, 255, 0.15);
  box-shadow: var(--shadow-sm);
}

.alert-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

.alert-text {
  font-size: 14px;
  color: #333333;
}

.filter-panel {
  padding: 20px 24px 0 24px;
}

.table-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-title-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stats-text {
  font-size: 13px;
  color: #909399;
}

.stats-text b {
  color: var(--el-color-primary);
}

.user-profile-cell, .anonymous-cell {
  display: flex;
  align-items: center;
}

.user-profile-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-profile-info .nickname {
  font-weight: 500;
  color: #303133;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-profile-info .nickname.text-gray {
  color: #909399;
  font-weight: normal;
}

.user-profile-info .user-id {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.post-content-cell {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.post-snippet {
  font-size: 13px;
  color: #303133;
}

.badge-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
