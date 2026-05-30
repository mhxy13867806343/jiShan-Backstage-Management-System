<template>
  <div class="content-list-container">
    <!-- Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="发布人ID">
          <el-input v-model="searchForm.user_id" placeholder="精确匹配发布人ID" clearable />
        </el-form-item>
        <el-form-item label="发布人昵称">
          <el-input v-model="searchForm.nickname" placeholder="输入昵称搜索" clearable />
        </el-form-item>
        <el-form-item label="上架状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option label="已上架" value="online" />
            <el-option label="已下架" value="offline" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Data Table Card -->
    <div class="table-card premium-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange" class="content-tabs">
        <el-tab-pane label="全部内容" name="all" />
        <el-tab-pane label="已发布" name="online" />
        <el-tab-pane label="草稿" name="offline" />
      </el-tabs>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="post_id" label="内容ID" width="100" align="center" />
        <el-table-column prop="user_id" label="发布人ID" width="100" align="center" />
        <el-table-column prop="nickname" label="发布人昵称" width="130" align="center">
          <template #default="{ row }">
            <div class="user-cell">
              <el-avatar :size="24" :src="row.avatar" style="margin-right: 6px;" />
              <span class="user-nickname">{{ row.nickname }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column label="内容概要" min-width="200">
          <template #default="{ row }">
            <div class="content-snippet-container">
              <p class="content-snippet">{{ row.content }}</p>
              <div v-if="row.images && row.images.length" class="image-thumbnail-list">
                <el-image 
                  v-for="(img, idx) in row.images" 
                  :key="idx"
                  class="content-thumbnail"
                  :src="img" 
                  :preview-src-list="row.images"
                  :initial-index="idx"
                  fit="cover"
                  preview-teleported
                />
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="likes" label="点赞数" width="90" align="center" sortable />
        <el-table-column prop="comments" label="评论数" width="90" align="center" sortable />
        <el-table-column prop="shares" label="分享数" width="90" align="center" sortable />
        
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'online' ? 'success' : 'danger'">
              {{ row.status === 'online' ? '已上架' : '已下架' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              plain 
              icon="View" 
              @click="handleViewDetail(row)"
            >
              详情
            </el-button>
            
            <el-button 
              v-if="row.status === 'online'"
              size="small" 
              type="danger" 
              plain 
              icon="Compass" 
              @click="handleOffline(row)"
            >
              下架
            </el-button>
            <el-button 
              v-else
              size="small" 
              type="success" 
              plain 
              icon="Refresh" 
              @click="handleRestore(row)"
            >
              恢复上架
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 15]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- Content Detail Drawer -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="内容发布详情"
      size="520px"
      destroy-on-close
    >
      <div v-if="selectedPost" class="drawer-post-content">
        <!-- Publisher Meta -->
        <div class="drawer-header-meta glass-effect">
          <div class="user-meta-info">
            <el-avatar :size="50" :src="selectedPost.avatar" />
            <div class="user-meta-text">
              <span class="user-meta-name">{{ selectedPost.nickname }}</span>
              <span class="user-meta-id font-mono">发布人ID: {{ selectedPost.user_id }}</span>
            </div>
          </div>
          <el-tag :type="selectedPost.status === 'online' ? 'success' : 'danger'">
            {{ selectedPost.status === 'online' ? '已上架中' : '内容已被下架' }}
          </el-tag>
        </div>

        <!-- Full Text Content -->
        <div class="drawer-body-card premium-card">
          <div class="card-label-heading">内容正文</div>
          <p class="full-content-text">{{ selectedPost.content }}</p>
          <div class="post-time-badge">
            发布于: {{ selectedPost.pubTime }}
          </div>
        </div>

        <!-- Dynamic Carousel for images -->
        <div v-if="selectedPost.images && selectedPost.images.length" class="drawer-carousel-card premium-card">
          <div class="card-label-heading">附带图片 ({{ selectedPost.images.length }}张)</div>
          <el-carousel :interval="4000" type="card" height="180px" indicator-position="outside">
            <el-carousel-item v-for="(img, idx) in selectedPost.images" :key="idx">
              <el-image 
                class="carousel-image"
                :src="img" 
                :preview-src-list="selectedPost.images"
                :initial-index="idx"
                fit="cover"
                preview-teleported
              />
            </el-carousel-item>
          </el-carousel>
        </div>

        <!-- Statistical indicators -->
        <div class="drawer-stats-row">
          <div class="stats-item">
            <span class="stats-label">点赞数</span>
            <span class="stats-value font-mono">{{ selectedPost.likes }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">评论数</span>
            <span class="stats-value font-mono">{{ selectedPost.comments }}</span>
          </div>
          <div class="stats-item">
            <span class="stats-label">分享数</span>
            <span class="stats-value font-mono">{{ selectedPost.shares }}</span>
          </div>
        </div>

        <!-- Module Bridge Action buttons -->
        <div class="drawer-actions-container">
          <el-button 
            type="primary" 
            icon="ChatLineSquare" 
            style="width: 100%; margin-bottom: 12px;" 
            @click="gotoComments(selectedPost.post_id)"
          >
            查看并监管本内容的全部评论
          </el-button>

          <el-button 
            v-if="selectedPost.status === 'online'" 
            type="danger" 
            plain
            style="width: 100%; margin-left: 0;" 
            icon="Compass" 
            @click="handleOffline(selectedPost)"
          >
            下架本条不合规内容
          </el-button>
          <el-button 
            v-else 
            type="success" 
            plain
            style="width: 100%; margin-left: 0;" 
            icon="Refresh" 
            @click="handleRestore(selectedPost)"
          >
            恢复本条内容上架显示
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMockDataStore } from '@/store/mockData'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const mockStore = useMockDataStore()
const tableData = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(5)
const activeTab = ref('all')

const searchForm = reactive({
  user_id: '',
  nickname: '',
  status: ''
})

const selectedPost = ref<any>(null)
const detailDrawerVisible = ref(false)

const fetchPosts = () => {
  const res = mockStore.getPosts({
    user_id: searchForm.user_id || undefined,
    nickname: searchForm.nickname || undefined,
    status: searchForm.status || undefined,
    page: currentPage.value,
    limit: pageSize.value
  })
  
  tableData.value = res.list
  totalCount.value = res.total
}

const handleTabChange = (name: any) => {
  searchForm.status = name === 'all' ? '' : name
  currentPage.value = 1
  fetchPosts()
}

const handleSearch = () => {
  currentPage.value = 1
  activeTab.value = searchForm.status || 'all'
  fetchPosts()
}

const handleReset = () => {
  searchForm.user_id = ''
  searchForm.nickname = ''
  searchForm.status = ''
  activeTab.value = 'all'
  currentPage.value = 1
  fetchPosts()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchPosts()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchPosts()
}

const handleViewDetail = (row: any) => {
  const post = mockStore.getPostById(row.post_id)
  if (post) {
    selectedPost.value = post
    detailDrawerVisible.value = true
  } else {
    ElMessage.error('内容不存在')
  }
}

const handleOffline = (row: any) => {
  ElMessageBox.confirm(
    `确定要下架内容ID为 “${row.post_id}” 的发布内容吗？下架后前端将不再对用户展示该内容。`,
    '安全提示',
    {
      confirmButtonText: '确定下架',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(() => {
    const success = mockStore.setPostOffline(row.post_id)
    if (success) {
      ElMessage.success('该内容已被下架')
      fetchPosts() // Refresh list
      
      // Update state in drawer if open
      if (detailDrawerVisible.value && selectedPost.value?.post_id === row.post_id) {
        selectedPost.value.status = 'offline'
      }
    } else {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

const handleRestore = (row: any) => {
  ElMessageBox.confirm(
    `确定要恢复内容ID “${row.post_id}” 重新上架吗？`,
    '提示',
    {
      confirmButtonText: '确定上架',
      cancelButtonText: '取消',
      type: 'success'
    }
  ).then(() => {
    const success = mockStore.setPostOnline(row.post_id)
    if (success) {
      ElMessage.success('内容已成功恢复上架')
      fetchPosts()
      
      // Update state in drawer if open
      if (detailDrawerVisible.value && selectedPost.value?.post_id === row.post_id) {
        selectedPost.value.status = 'online'
      }
    } else {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

// Redirect router to Comment page with query post_id
const gotoComments = (post_id: string) => {
  detailDrawerVisible.value = false
  router.push({ path: '/comment', query: { post_id } })
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.content-list-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-panel {
  padding: 20px 24px 0 24px;
}

.table-card {
  padding: 24px;
}

.content-tabs {
  margin-bottom: 16px;
}

.content-tabs :deep(.el-tabs__item) {
  font-weight: 600;
  font-size: 14px;
}

.user-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-nickname {
  font-weight: 500;
  color: var(--text-regular);
}

.content-snippet-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.content-snippet {
  font-size: 13px;
  color: var(--text-main);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-thumbnail-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.content-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  box-shadow: var(--shadow-sm);
  cursor: zoom-in;
  border: 1px solid var(--border-color);
  transition: all 0.2s ease;
}

.content-thumbnail:hover {
  transform: scale(1.05);
}

/* Drawer CSS details */
.drawer-post-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drawer-header-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--border-color);
}

.user-meta-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-meta-text {
  display: flex;
  flex-direction: column;
}

.user-meta-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text-main);
}

.user-meta-id {
  font-size: 11px;
  color: var(--text-light);
  margin-top: 2px;
}

.drawer-body-card {
  padding: 20px;
}

.card-label-heading {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
  border-left: 3px solid var(--primary);
  padding-left: 8px;
}

.full-content-text {
  font-size: 14px;
  color: var(--text-main);
  line-height: 1.6;
  white-space: pre-wrap;
}

.post-time-badge {
  font-size: 12px;
  color: var(--text-light);
  margin-top: 15px;
  text-align: right;
}

.drawer-carousel-card {
  padding: 20px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  cursor: zoom-in;
}

.drawer-stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.stats-item {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.stats-label {
  font-size: 12px;
  color: var(--text-light);
}

.stats-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
}

.drawer-actions-container {
  padding: 10px 0;
}
</style>
