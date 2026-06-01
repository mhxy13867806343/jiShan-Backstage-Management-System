<template>
  <div class="comment-list-container">
    <!-- Active post filter notification bar -->
    <div v-if="activePostId" class="filter-alert-box glass-effect">
      <div class="alert-left">
        <el-icon class="alert-icon"><InfoFilled /></el-icon>
        <span class="alert-text">当前正在筛选内容ID为 <b class="font-mono">{{ activePostId }}</b> 的评论。</span>
      </div>
      <el-button type="primary" size="small" plain icon="Close" @click="clearPostFilter">
        清除筛选显示全部
      </el-button>
    </div>

    <!-- Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="内容ID">
          <el-input v-model="searchForm.post_id" placeholder="过滤具体内容ID" clearable />
        </el-form-item>
        <el-form-item label="评论人用户ID">
          <el-input v-model="searchForm.user_id" placeholder="过滤评论人ID" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Data Table Card -->
    <div class="table-card premium-card">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="comment_id" label="评论ID" width="100" align="center" />
        <el-table-column prop="post_id" label="内容ID" width="100" align="center" sortable>
          <template #default="{ row }">
            <el-tag type="info" class="font-mono">{{ row.post_id }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="评论人" width="150">
          <template #default="{ row }">
            <div class="commenter-cell">
              <el-avatar :size="24" :src="row.avatar" style="margin-right: 6px;" />
              <div class="commenter-info">
                <span class="nickname">{{ row.nickname }}</span>
                <span class="user-id font-mono">ID: {{ row.user_id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="评论正文" min-width="220">
          <template #default="{ row }">
            <div class="comment-text-box">
              <p class="comment-body">
                <!-- If reply -->
                <span v-if="row.reply_to_nickname" class="reply-target-tag">
                  @{{ row.reply_to_nickname }} ：
                </span>
                {{ row.content }}
              </p>
              
              <div v-if="row.parent_id" class="comment-parent-badge">
                回复评论ID: <span class="font-mono">{{ row.parent_id }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="pubTime" label="发表时间" width="170" align="center" sortable />

        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button 
              v-role="['superadmin', 'admin']"
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
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
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

const searchForm = reactive({
  post_id: '',
  user_id: ''
})

const activePostId = computed(() => {
  return (route.query.post_id as string) || ''
})

const fetchComments = async () => {
  try {
    const res = await adminApi.getComments({
      post_id: searchForm.post_id || undefined,
      user_id: searchForm.user_id || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    
    tableData.value = res.list
    totalCount.value = res.total
  } catch (err) {
    console.error('fetchComments error', err)
  }
}

// Sync router queries with our searchForm
watch(
  () => route.query.post_id,
  (newPostId) => {
    if (newPostId) {
      searchForm.post_id = newPostId as string
    } else {
      searchForm.post_id = ''
    }
    currentPage.value = 1
    fetchComments()
  },
  { immediate: true }
)

const handleSearch = () => {
  currentPage.value = 1
  // If user searched for something, and it's different from the route query, we update router queries
  if (searchForm.post_id !== activePostId.value) {
    router.replace({ path: '/comment', query: searchForm.post_id ? { post_id: searchForm.post_id } : {} })
  } else {
    fetchComments()
  }
}

const handleReset = () => {
  searchForm.post_id = ''
  searchForm.user_id = ''
  currentPage.value = 1
  if (route.query.post_id) {
    router.replace({ path: '/comment', query: {} })
  } else {
    fetchComments()
  }
}

const clearPostFilter = () => {
  searchForm.post_id = ''
  router.replace({ path: '/comment', query: {} })
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchComments()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchComments()
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要永久删除该评论吗？操作后前端用户将不可见，且对应文章的评论数会自动扣减。`,
    '删除警告',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      const res = await adminApi.deleteComment(row.comment_id)
      if (res.code === 200) {
        ElMessage.success('评论已成功删除')
        fetchComments()
      } else {
        ElMessage.error('删除失败')
      }
    } catch (err) {
      console.error('deleteComment error', err)
    }
  }).catch(() => {})
}

onMounted(() => {
  // If we navigated in with a post_id query, it is handled by watch immediate
  if (!activePostId.value) {
    fetchComments()
  }
})
</script>

<style scoped>
.comment-list-container {
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
  color: var(--secondary);
}

.alert-text {
  font-size: 14px;
  color: var(--text-regular);
}

.filter-panel {
  padding: 20px 24px 0 24px;
}

.table-card {
  padding: 24px;
}

.commenter-cell {
  display: flex;
  align-items: center;
}

.commenter-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.commenter-info .nickname {
  font-weight: 500;
  color: var(--text-main);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.commenter-info .user-id {
  font-size: 10px;
  color: var(--text-light);
  margin-top: 1px;
}

.comment-text-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.comment-body {
  font-size: 13px;
  color: var(--text-main);
  line-height: 1.5;
}

.reply-target-tag {
  color: var(--primary);
  font-weight: 600;
}

.comment-parent-badge {
  font-size: 10px;
  color: var(--text-light);
  background-color: #f1f5f9;
  align-self: flex-start;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
