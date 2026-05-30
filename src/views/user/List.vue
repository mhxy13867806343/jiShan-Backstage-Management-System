<template>
  <div class="user-list-container">
    <!-- Search Form Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="用户ID">
          <el-input v-model="searchForm.user_id" placeholder="精确匹配用户ID" clearable />
        </el-form-item>
        <el-form-item label="用户昵称">
          <el-input v-model="searchForm.nickname" placeholder="模糊搜索昵称" clearable />
        </el-form-item>
        <el-form-item label="手机号码">
          <el-input v-model="searchForm.phone" placeholder="模糊搜索手机号" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable style="width: 130px;">
            <el-option label="全部" value="" />
            <el-option label="正常" value="normal" />
            <el-option label="已禁用" value="banned" />
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
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="user_id" label="用户ID" width="110" align="center" />
        
        <el-table-column label="用户资料" min-width="180">
          <template #default="{ row }">
            <div class="user-profile-cell">
              <el-avatar :size="40" :src="row.avatar" />
              <div class="user-info-text">
                <span class="user-nickname user-nickname-link" title="点击查看用户发布动态" @click="gotoUserPosts(row)">
                  {{ row.nickname }}
                </span>
                <span class="user-bio-preview">{{ row.bio || '暂无个人简介' }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号码" width="130" align="center" />
        
        <el-table-column prop="regTime" label="注册时间" width="180" align="center" />
        
        <el-table-column label="账号状态" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'normal' ? 'success' : 'danger'">
              <span class="status-dot" :class="row.status === 'normal' ? 'active' : 'danger'"></span>
              {{ row.status === 'normal' ? '正常' : '已禁用' }}
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
              v-if="row.status === 'normal'"
              size="small" 
              type="danger" 
              plain 
              icon="Lock" 
              @click="handleToggleStatus(row, 'banned')"
            >
              禁用
            </el-button>
            <el-button 
              v-else
              size="small" 
              type="success" 
              plain 
              icon="Unlock" 
              @click="handleToggleStatus(row, 'normal')"
            >
              解禁
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="totalCount"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- User Details Drawer -->
    <el-drawer
      v-model="detailDrawerVisible"
      title="业务用户详细资料"
      size="480px"
      direction="rtl"
      destroy-on-close
    >
      <div v-if="selectedUser" class="drawer-user-content">
        <!-- Top Profile card -->
        <div class="detail-header-card glass-effect">
          <el-avatar :size="80" :src="selectedUser.avatar" class="detail-avatar" />
          <h3 class="detail-nickname">{{ selectedUser.nickname }}</h3>
          <p class="detail-bio">“ {{ selectedUser.bio || '暂无个人简介' }} ”</p>
          <el-tag :type="selectedUser.status === 'normal' ? 'success' : 'danger'" class="status-badge">
            {{ selectedUser.status === 'normal' ? '账户正常' : '账户已禁用' }}
          </el-tag>
        </div>

        <!-- Metric badges block -->
        <div class="metrics-summary-grid">
          <div class="detail-metric-item clickable-metric" title="点击查看该用户发布动态" @click="gotoUserPosts(selectedUser)">
            <span class="metric-num text-gradient">{{ selectedUser.postCount }}</span>
            <span class="metric-name link-text-badge">发布内容数 ➔</span>
          </div>
          <div class="detail-metric-item">
            <span class="metric-num text-gradient">{{ selectedUser.commentCount }}</span>
            <span class="metric-name">发表评论数</span>
          </div>
          <div class="detail-metric-item">
            <span class="metric-num text-gradient">{{ selectedUser.likesReceived }}</span>
            <span class="metric-name">获得点赞数</span>
          </div>
        </div>

        <!-- Info list -->
        <div class="detail-info-list premium-card">
          <div class="info-list-title">基本信息账号</div>
          <div class="info-row">
            <span class="info-label">业务用户ID</span>
            <span class="info-val font-mono">{{ selectedUser.user_id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">手机号码</span>
            <span class="info-val">{{ selectedUser.phone }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">新手机号码</span>
            <span class="info-val">{{ selectedUser.newPhone || '暂无' }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">注册时间</span>
            <span class="info-val">{{ selectedUser.regTime }}</span>
          </div>
        </div>



        <!-- Action Drawer Footer -->
        <div class="drawer-action-block">
          <el-button 
            v-if="selectedUser.status === 'normal'" 
            type="danger" 
            style="width: 100%;" 
            icon="Lock" 
            @click="handleToggleStatus(selectedUser, 'banned')"
          >
            禁用该用户账号
          </el-button>
          <el-button 
            v-else 
            type="success" 
            style="width: 100%;" 
            icon="Unlock" 
            @click="handleToggleStatus(selectedUser, 'normal')"
          >
            解除禁用限制
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
const pageSize = ref(10)

const searchForm = reactive({
  user_id: '',
  nickname: '',
  phone: '',
  status: ''
})

const selectedUser = ref<any>(null)
const detailDrawerVisible = ref(false)



const fetchUsers = () => {
  const res = mockStore.getUsers({
    user_id: searchForm.user_id || undefined,
    nickname: searchForm.nickname || undefined,
    phone: searchForm.phone || undefined,
    status: searchForm.status || undefined,
    page: currentPage.value,
    limit: pageSize.value
  })
  
  tableData.value = res.list
  totalCount.value = res.total
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUsers()
}

const handleReset = () => {
  searchForm.user_id = ''
  searchForm.nickname = ''
  searchForm.phone = ''
  searchForm.status = ''
  currentPage.value = 1
  fetchUsers()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchUsers()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUsers()
}

const handleViewDetail = (row: any) => {
  const user = mockStore.getUserById(row.user_id)
  if (user) {
    selectedUser.value = user
    detailDrawerVisible.value = true
  } else {
    ElMessage.error('用户不存在')
  }
}

const handleToggleStatus = (row: any, newStatus: 'normal' | 'banned') => {
  const statusText = newStatus === 'normal' ? '解禁' : '封禁'
  const boxType = newStatus === 'normal' ? 'success' : 'warning'
  
  ElMessageBox.confirm(
    `确定要对用户 “${row.nickname}” 执行${statusText}操作吗？`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: boxType
    }
  ).then(() => {
    const success = mockStore.updateUserStatus(row.user_id, newStatus)
    if (success) {
      ElMessage.success(`用户已成功${statusText}`)
      fetchUsers() // Refresh list
      
      // If drawer is open, update selectedUser state
      if (detailDrawerVisible.value && selectedUser.value?.user_id === row.user_id) {
        selectedUser.value.status = newStatus
      }
    } else {
      ElMessage.error('操作失败')
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchUsers()
})

const gotoUserPosts = (user: any) => {
  detailDrawerVisible.value = false
  router.push({ path: '/content', query: { user_id: user.user_id } })
}
</script>

<style scoped>
.user-list-container {
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

.user-profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-nickname {
  font-weight: 600;
  color: var(--text-main);
  font-size: 14px;
}

.user-bio-preview {
  font-size: 12px;
  color: var(--text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
  margin-top: 2px;
}

/* Drawer Detail Elements */
.drawer-user-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-header-card {
  text-align: center;
  padding: 30px 20px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  background: white;
}

.detail-avatar {
  border: 4px solid white;
  box-shadow: 0 4px 12px rgba(88, 86, 214, 0.2);
  margin-bottom: 12px;
}

.detail-nickname {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 8px;
}

.detail-bio {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.4;
  margin-bottom: 15px;
  font-style: italic;
}

.status-badge {
  font-size: 12px;
}

.metrics-summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.detail-metric-item {
  background: white;
  border: 1px solid var(--border-color);
  padding: 16px 8px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: var(--shadow-sm);
}

.metric-num {
  font-size: 20px;
  font-weight: 700;
}

.metric-name {
  font-size: 11px;
  color: var(--text-light);
  font-weight: 500;
}

.detail-info-list {
  padding: 20px;
}

.info-list-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-main);
  border-left: 3px solid var(--primary);
  padding-left: 8px;
  margin-bottom: 15px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 13px;
  border-bottom: 1px dashed var(--border-color);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--text-muted);
}

.info-val {
  color: var(--text-main);
  font-weight: 500;
}

.drawer-action-block {
  margin-top: 10px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
  padding-bottom: 20px;
}

.user-nickname-link {
  cursor: pointer;
  transition: color 0.2s ease;
}

.user-nickname-link:hover {
  color: var(--primary, #1890ff);
  text-decoration: underline;
}

.clickable-metric {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable-metric:hover {
  border-color: var(--primary, #5856d6);
  background-color: rgba(88, 86, 214, 0.04);
}

.link-text-badge {
  color: var(--primary, #5856d6);
  font-weight: 700;
  text-decoration: underline;
}
</style>
