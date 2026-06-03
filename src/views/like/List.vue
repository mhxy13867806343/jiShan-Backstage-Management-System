<template>
  <div class="like-list-container animate-fade-in">
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
          的点赞记录。
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
        <el-form-item label="检索关键词">
          <el-input v-model="searchForm.keyword" placeholder="内容 / 昵称 / 用户ID" clearable style="width: 220px;" />
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
          <span class="table-title-text">点赞记录列表</span>
        </div>
        <div class="toolbar-right">
          <span class="stats-text">
            共找到 <b>{{ totalCount }}</b> 条点赞记录
          </span>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column prop="likeId" label="点赞ID" width="100" align="center" />

        <el-table-column label="点赞人" width="220">
          <template #default="{ row }">
            <div class="user-profile-cell">
              <el-avatar :size="32" :src="row.avatar || undefined" style="margin-right: 8px;">
                {{ row.nickname ? row.nickname.substring(0, 1) : 'U' }}
              </el-avatar>
              <div class="user-profile-info">
                <span class="nickname">{{ row.nickname || '即闪用户' }}</span>
                <span class="user-id font-mono">ID: {{ row.userId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="被点赞内容摘要" min-width="250" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="post-content-cell">
              <span class="post-snippet">{{ row.content || '(文字内容为空)' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="内容状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.postStatus === 'online' ? 'success' : 'info'" size="small">
              {{ row.postStatus === 'online' ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="postId" label="内容ID" width="140" align="center">
          <template #default="{ row }">
            <el-link type="primary" class="font-mono" @click="handleFilterPost(row.postId)">
              {{ row.postId }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column prop="createdAt" label="点赞时间" width="170" align="center" sortable>
          <template #default="{ row }">
            <span>{{ formatDateTime(row.createdAt || row.likedAt) }}</span>
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
  keyword: ''
})

const activePostId = computed(() => (route.query.post_id as string) || '')
const activeUserId = computed(() => (route.query.user_id as string) || '')

const formatDateTime = (val: string) => {
  if (!val) return '--'
  return val.replace('T', ' ').substring(0, 19)
}

const fetchLikes = async () => {
  loading.value = true
  try {
    const res = await adminApi.getLikes({
      postId: searchForm.postId || undefined,
      userId: searchForm.userId || undefined,
      keyword: searchForm.keyword || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    
    // Backend standard list/total mapping
    tableData.value = res.list || []
    totalCount.value = res.total || 0
  } catch (err) {
    console.error('Failed to fetch likes list:', err)
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
    fetchLikes()
  },
  { immediate: true, deep: true }
)

const handleSearch = () => {
  currentPage.value = 1
  // Sync page queries
  const newQuery: any = {}
  if (searchForm.postId) newQuery.post_id = searchForm.postId
  if (searchForm.userId) newQuery.user_id = searchForm.userId
  
  router.replace({ path: route.path, query: newQuery })
}

const handleReset = () => {
  searchForm.postId = ''
  searchForm.userId = ''
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
  fetchLikes()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchLikes()
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要永久删除该点赞记录吗？删除后对应文章的点赞总数会自动扣减。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await adminApi.deleteLike(row.likeId)
      if (res.code === 200 || res.message === 'success') {
        ElMessage.success('点赞记录已成功删除')
        fetchLikes()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (err: any) {
      console.error('deleteLike error', err)
      ElMessage.error(err.message || '删除失败')
    }
  }).catch(() => {})
}
</script>

<style scoped>
.like-list-container {
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

.user-profile-cell {
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
