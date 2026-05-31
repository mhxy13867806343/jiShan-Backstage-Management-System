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
        <el-form-item label="内容关键字">
          <el-input v-model="searchForm.content" placeholder="输入关键字搜索内容" clearable />
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
        <el-tab-pane label="已发布" name="online" />
        <el-tab-pane label="草稿" name="offline" />
        <el-tab-pane label="全部内容" name="all" />
      </el-tabs>

      <!-- Batch Action Bar -->
      <div class="batch-action-bar" v-if="selectedIds.length > 0">
        <el-icon><InfoFilled /></el-icon>
        <span>已选 <b>{{ selectedIds.length }}</b> 条（支持跨页选择）</span>
        <el-button type="danger" size="small" icon="Delete" @click="handleBatchDelete">
          批量删除
        </el-button>
        <el-button size="small" @click="selectedIds = []">取消选择</el-button>
      </div>

      <el-table
        :data="tableData"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        ref="tableRef"
      >
        <!-- 手动 checkbox 列，支持跨分页保留 -->
        <el-table-column width="50" align="center">
          <template #header>
            <el-checkbox
              :model-value="isCurrentPageAllSelected"
              :indeterminate="isCurrentPageIndeterminate"
              @change="handleSelectCurrentPage"
            />
          </template>
          <template #default="{ row }">
            <el-checkbox
              :model-value="selectedIds.includes(row.post_id)"
              @change="(val: boolean) => toggleSelect(row.post_id, val)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="post_id" label="内容ID" width="100" align="center" />
        <el-table-column prop="user_id" label="发布人ID" width="95" align="center" />
        <el-table-column label="发布人信息" width="180" align="center">
          <template #default="{ row }">
            <div class="user-info-cell">
              <div class="user-avatar-row">
                <el-avatar :size="26" :src="row.avatar" style="margin-right: 6px;" />
                <span class="user-nickname">{{ row.nickname }}</span>
                <el-tag
                  size="small"
                  :type="getUserGender(row.user_id) === '男' ? 'primary' : 'danger'"
                  class="gender-badge"
                >
                  {{ getUserGender(row.user_id) }}
                </el-tag>
              </div>
              <div class="user-phone font-mono">{{ getUserPhone(row.user_id) }}</div>
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

        <el-table-column label="关联话题" width="160" align="center">
          <template #default="{ row }">
            <div class="topic-list" v-if="parseTopics(row.content).length">
              <el-tag
                v-for="topic in parseTopics(row.content)"
                :key="topic"
                size="small"
                type="info"
                class="topic-badge"
              >
                {{ topic }}
              </el-tag>
            </div>
            <span v-else class="empty-placeholder">--</span>
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
            <el-button size="small" type="primary" plain icon="View" @click="handleViewDetail(row)">
              详情
            </el-button>
            <el-button
              v-if="row.status === 'online'"
              size="small" type="danger" plain icon="Compass"
              @click="handleOffline(row)"
            >
              下架
            </el-button>
            <el-button
              v-else
              size="small" type="success" plain icon="Refresh"
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
    <el-drawer v-model="detailDrawerVisible" title="内容发布详情" size="520px" destroy-on-close>
      <div v-if="selectedPost" class="drawer-post-content">
        <div class="drawer-header-meta glass-effect">
          <div class="user-meta-info">
            <el-avatar :size="50" :src="selectedPost.avatar" />
            <div class="user-meta-text">
              <div class="meta-name-row">
                <span class="user-meta-name">{{ selectedPost.nickname }}</span>
                <el-tag size="small" :type="getUserGender(selectedPost.user_id) === '男' ? 'primary' : 'danger'" style="margin-left: 6px;">
                  {{ getUserGender(selectedPost.user_id) }}
                </el-tag>
              </div>
              <span class="user-meta-id font-mono">发布人ID: {{ selectedPost.user_id }}</span>
              <span class="user-meta-phone font-mono">手机号: {{ getUserPhone(selectedPost.user_id) }}</span>
            </div>
          </div>
          <el-tag :type="selectedPost.status === 'online' ? 'success' : 'danger'">
            {{ selectedPost.status === 'online' ? '已上架中' : '内容已被下架' }}
          </el-tag>
        </div>

        <div class="drawer-body-card premium-card">
          <div class="card-label-heading">内容正文</div>
          <p class="full-content-text">{{ selectedPost.content }}</p>
          <div class="post-time-badge">发布于: {{ selectedPost.pubTime }}</div>
        </div>

        <div v-if="selectedPost.images && selectedPost.images.length" class="drawer-carousel-card premium-card">
          <div class="card-label-heading">附带图片 ({{ selectedPost.images.length }}张)</div>
          <el-carousel :interval="4000" type="card" height="180px" indicator-position="outside">
            <el-carousel-item v-for="(img, idx) in selectedPost.images" :key="idx">
              <el-image class="carousel-image" :src="img" :preview-src-list="selectedPost.images" :initial-index="idx" fit="cover" preview-teleported />
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="drawer-stats-row">
          <div class="stats-item"><span class="stats-label">点赞数</span><span class="stats-value font-mono">{{ selectedPost.likes }}</span></div>
          <div class="stats-item"><span class="stats-label">评论数</span><span class="stats-value font-mono">{{ selectedPost.comments }}</span></div>
          <div class="stats-item"><span class="stats-label">分享数</span><span class="stats-value font-mono">{{ selectedPost.shares }}</span></div>
        </div>

        <div class="drawer-actions-container">
          <el-button type="primary" icon="ChatLineSquare" style="width: 100%; margin-bottom: 12px;" @click="gotoComments(selectedPost.post_id)">
            查看并监管本内容的全部评论
          </el-button>
          <el-button v-if="selectedPost.status === 'online'" type="danger" plain style="width: 100%; margin-left: 0;" icon="Compass" @click="handleOffline(selectedPost)">
            下架本条不合规内容
          </el-button>
          <el-button v-else type="success" plain style="width: 100%; margin-left: 0;" icon="Refresh" @click="handleRestore(selectedPost)">
            恢复本条内容上架显示
          </el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMockDataStore } from '@/store/mockData'
import { adminApi } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
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
  status: '',
  content: ''
})

const selectedPost = ref<any>(null)
const detailDrawerVisible = ref(false)

// ── Cross-page selection (ref array — reliable reactivity) ─────────────────────
const selectedIds = ref<string[]>([])

const isCurrentPageAllSelected = computed(() =>
  tableData.value.length > 0 && tableData.value.every(r => selectedIds.value.includes(r.post_id))
)
const isCurrentPageIndeterminate = computed(() =>
  tableData.value.some(r => selectedIds.value.includes(r.post_id)) && !isCurrentPageAllSelected.value
)

const toggleSelect = (id: string, val: boolean) => {
  if (val && !selectedIds.value.includes(id)) {
    selectedIds.value = [...selectedIds.value, id]
  } else if (!val) {
    selectedIds.value = selectedIds.value.filter(x => x !== id)
  }
}

const handleSelectCurrentPage = (val: boolean) => {
  const pageIds = tableData.value.map(r => r.post_id)
  if (val) {
    const merged = new Set([...selectedIds.value, ...pageIds])
    selectedIds.value = [...merged]
  } else {
    selectedIds.value = selectedIds.value.filter(id => !pageIds.includes(id))
  }
}

// dummy — keep for el-table but we use our own checkbox
const handleSelectionChange = () => {}

// ── Batch Delete (Offline) ─────────────────────────────────────────
const handleBatchDelete = () => {
  const ids = [...selectedIds.value]
  const count = ids.length
  ElMessageBox.confirm(
    `确定要批量下架选中的 <b>${count}</b> 条内容吗？下架后前端将不再对用户展示。`,
    '批量下架确认',
    { confirmButtonText: '确认下架', cancelButtonText: '取消', type: 'warning', dangerouslyUseHTMLString: true, confirmButtonClass: 'el-button--danger' }
  ).then(async () => {
    let successCount = 0
    for (const id of ids) {
      try {
        const res = await adminApi.setPostOffline(id)
        if (res.code === 200) successCount++
      } catch (err) {
        console.error(`Batch offline failed for ${id}`, err)
      }
    }
    selectedIds.value = []
    fetchPosts()
    ElMessage.success(`已成功批量下架 ${successCount} 条内容`)
  }).catch(() => {})
}

// ── Helpers ──────────────────────────────────────────────────────
const parseTopics = (content: string): string[] => {
  if (!content) return []
  const matches = content.match(/#[^\s#]+/g)
  return matches ? matches.map(tag => tag.trim()) : []
}

const getUserPhone = (userId: string) => {
  const user = mockStore.users.find(u => u.user_id === userId)
  return user ? user.phone : '--'
}

const getUserGender = (userId: string) => {
  const genderMap: Record<string, string> = {
    '10001': '女', '10002': '男', '10003': '女', '10004': '男',
    '10005': '女', '10006': '男', '10007': '女', '10008': '男', '10009': '女'
  }
  return genderMap[userId] || '男'
}

// ── Data Fetch ───────────────────────────────────────────────────
const fetchPosts = async () => {
  try {
    const res = await adminApi.getPosts({
      user_id: searchForm.user_id || undefined,
      nickname: searchForm.nickname || undefined,
      status: searchForm.status || undefined,
      content: searchForm.content || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    tableData.value = res.list
    totalCount.value = res.total
  } catch (err) {
    console.error('fetchPosts error', err)
  }
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
  searchForm.content = ''
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

const handleViewDetail = async (row: any) => {
  try {
    const post = await adminApi.getPostById(row.post_id)
    if (post) {
      selectedPost.value = post
      detailDrawerVisible.value = true
    } else {
      ElMessage.error('内容不存在')
    }
  } catch (err) {
    console.error('handleViewDetail error', err)
  }
}

const handleOffline = (row: any) => {
  ElMessageBox.confirm(
    `确定要下架内容ID为 "${row.post_id}" 的发布内容吗？下架后前端将不再对用户展示该内容。`,
    '安全提示',
    { confirmButtonText: '确定下架', cancelButtonText: '取消', type: 'warning', confirmButtonClass: 'el-button--danger' }
  ).then(async () => {
    try {
      const res = await adminApi.setPostOffline(row.post_id)
      if (res.code === 200) {
        ElMessage.success('该内容已被下架')
        fetchPosts()
        if (detailDrawerVisible.value && selectedPost.value?.post_id === row.post_id) {
          selectedPost.value.status = 'offline'
        }
      } else {
        ElMessage.error('操作失败')
      }
    } catch (err) {
      console.error('handleOffline error', err)
    }
  }).catch(() => {})
}

const handleRestore = (row: any) => {
  ElMessageBox.confirm(
    `确定要恢复内容ID "${row.post_id}" 重新上架吗？`,
    '提示',
    { confirmButtonText: '确定上架', cancelButtonText: '取消', type: 'success' }
  ).then(async () => {
    try {
      const res = await adminApi.setPostOnline(row.post_id)
      if (res.code === 200) {
        ElMessage.success('内容已成功恢复上架')
        fetchPosts()
        if (detailDrawerVisible.value && selectedPost.value?.post_id === row.post_id) {
          selectedPost.value.status = 'online'
        }
      } else {
        ElMessage.error('操作失败')
      }
    } catch (err) {
      console.error('handleRestore error', err)
    }
  }).catch(() => {})
}

const gotoComments = (post_id: string) => {
  detailDrawerVisible.value = false
  router.push({ path: '/comment', query: { post_id } })
}

onMounted(() => {
  if (route.query.user_id) {
    searchForm.user_id = String(route.query.user_id)
    activeTab.value = 'all'
  }
  fetchPosts()
})

watch(
  () => route.query.user_id,
  (newUserId) => {
    if (newUserId) {
      searchForm.user_id = String(newUserId)
      activeTab.value = 'all'
    } else {
      searchForm.user_id = ''
    }
    currentPage.value = 1
    fetchPosts()
  }
)
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

/* ── Batch action bar ── */
.batch-action-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #fff7e6;
  border: 1px solid #ffd591;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #874d00;
  animation: slideDown 0.2s ease;
}

.batch-action-bar b {
  color: #d46b08;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-6px); }
  to   { opacity: 1; transform: translateY(0); }
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

.content-thumbnail:hover { transform: scale(1.05); }

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

.drawer-body-card { padding: 20px; }

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

.drawer-carousel-card { padding: 20px; }

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

.stats-label { font-size: 12px; color: var(--text-light); }
.stats-value { font-size: 18px; font-weight: 700; color: var(--text-main); }

.drawer-actions-container { padding: 10px 0; }

.topic-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.topic-badge { font-weight: 500; border-radius: 4px; }
.empty-placeholder { color: #c0c4cc; }

.user-info-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.user-avatar-row {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.user-phone { font-size: 11px; color: var(--text-light); }

.gender-badge {
  padding: 0 4px;
  height: 16px;
  line-height: 14px;
  font-size: 10px;
  border-radius: 3px;
}

.drawer-header-meta :deep(.user-meta-text) {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.drawer-header-meta :deep(.meta-name-row) {
  display: flex;
  align-items: center;
}

.drawer-header-meta :deep(.user-meta-phone) {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 1px;
}
</style>
