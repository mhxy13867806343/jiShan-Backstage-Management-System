<template>
  <div class="user-online-container animate-fade-in">
    <!-- Header -->
    <div class="page-header-bar">
      <h2>用户端在线监控 (User Online Status)</h2>
      <p class="subtitle-text">实时查看并监管用户端的在线与离线活跃状态，监测最近活动行为。</p>
    </div>

    <!-- Statistics Cards -->
    <div class="stats-cards-grid">
      <div class="stat-card stat-total premium-card">
        <div class="stat-icon-wrapper">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">全部用户</span>
          <span class="stat-value">{{ totalAllCount }}</span>
        </div>
      </div>
      
      <div class="stat-card stat-online premium-card">
        <div class="stat-icon-wrapper">
          <el-icon><Monitor /></el-icon>
          <span class="pulse-dot"></span>
        </div>
        <div class="stat-info">
          <span class="stat-label">当前在线</span>
          <span class="stat-value text-success">{{ onlineCount }}</span>
        </div>
      </div>

      <div class="stat-card stat-offline premium-card">
        <div class="stat-icon-wrapper">
          <el-icon><Notification /></el-icon>
        </div>
        <div class="stat-info">
          <span class="stat-label">当前离线</span>
          <span class="stat-value text-gray">{{ offlineCount }}</span>
        </div>
      </div>
    </div>

    <!-- Filter Panel -->
    <div class="filter-panel premium-card">
      <el-form :inline="true" :model="searchForm" class="demo-form-inline">
        <el-form-item label="在线状态">
          <el-radio-group v-model="searchForm.status" @change="handleSearch" size="default">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="online">在线</el-radio-button>
            <el-radio-button label="offline">离线</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="检索关键词" style="margin-left: 20px;">
          <el-input 
            v-model="searchForm.keyword" 
            placeholder="用户 ID / 昵称 / 手机号" 
            clearable 
            style="width: 260px;" 
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- Data Table Card -->
    <div class="table-card premium-card">
      <div class="table-toolbar">
        <div class="toolbar-left">
          <span class="table-title-text">
            {{ getStatusTitle() }}用户列表 (共 <b>{{ totalCount }}</b> 条记录)
          </span>
        </div>
        <div class="toolbar-right">
          <span class="window-info-text" v-if="onlineWindowSeconds">
            系统判定规则：最近 <b>{{ Math.floor(onlineWindowSeconds / 60) }}分钟</b> 内有接口互动的用户判定为在线
          </span>
        </div>
      </div>

      <el-table :data="tableData" style="width: 100%" v-loading="loading">
        <el-table-column label="在线状态" width="130" align="center">
          <template #default="{ row }">
            <el-tag :type="row.isOnline ? 'success' : 'info'" effect="light" class="status-tag">
              <span class="status-indicator-dot" :class="{ 'pulse-active': row.isOnline }"></span>
              {{ row.onlineStatusText || (row.isOnline ? '在线' : '离线') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="用户信息" min-width="200">
          <template #default="{ row }">
            <div class="user-profile-cell">
              <el-avatar :size="36" :src="row.avatar || undefined" style="margin-right: 10px;">
                {{ row.nickname ? row.nickname.substring(0, 1) : 'U' }}
              </el-avatar>
              <div class="user-profile-info">
                <span class="nickname">{{ row.nickname }}</span>
                <span class="user-id font-mono">ID: {{ row.userId }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="手机号码" width="140" align="center" />

        <el-table-column label="客户端类型 / 设备" min-width="150">
          <template #default="{ row }">
            <div class="client-info-cell" v-if="row.clientType || row.clientSubtype">
              <el-tag size="small" :type="getClientTagType(row.clientType)" class="client-type-tag">
                {{ row.clientType }}
              </el-tag>
              <span class="device-text" v-if="row.clientSubtype">{{ row.clientSubtype }}</span>
            </div>
            <span class="empty-text" v-else>--</span>
          </template>
        </el-table-column>

        <el-table-column label="账号状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="row.accountStatus === 'normal' ? 'success' : 'danger'" size="small">
              {{ row.accountStatus === 'normal' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="最近活跃状态" min-width="180">
          <template #default="{ row }">
            <div class="active-status-cell">
              <span class="duration-text" :class="{ 'text-success': row.isOnline }">
                {{ formatInactiveDuration(row.inactiveSeconds, row.isOnline) }}
              </span>
              <span class="time-text font-mono" v-if="row.lastActiveAt || row.lastTime">
                ({{ row.lastActiveAt || row.lastTime }})
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="regTime" label="注册时间" width="170" align="center" />
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
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
import { ref, reactive, onMounted } from 'vue'
import { adminApi } from '@/api/admin'
import { Search, Refresh } from '@element-plus/icons-vue'

const loading = ref(false)
const tableData = ref<any[]>([])
const totalCount = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// Summary Statistics
const totalAllCount = ref(0)
const onlineCount = ref(0)
const offlineCount = ref(0)
const onlineWindowSeconds = ref(300)

const searchForm = reactive({
  status: 'all',
  keyword: ''
})

const getStatusTitle = () => {
  if (searchForm.status === 'online') return '在线'
  if (searchForm.status === 'offline') return '离线'
  return '全部'
}

const getClientTagType = (client: string) => {
  if (!client) return 'info'
  const lower = client.toLowerCase()
  if (lower.includes('ios')) return 'primary'
  if (lower.includes('android')) return 'success'
  if (lower.includes('harmony') || lower.includes('huawei')) return 'warning'
  if (lower.includes('web') || lower.includes('h5')) return 'danger'
  return 'info'
}

const formatInactiveDuration = (seconds: number | null, isOnline: boolean) => {
  if (isOnline) return '当前活跃'
  if (seconds === null || seconds === undefined) return '未激活过'
  if (seconds < 60) return '刚刚活跃'
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return `${mins}分钟前活跃`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前活跃`
  const days = Math.floor(hours / 24)
  return `${days}天前活跃`
}

const fetchUserOnline = async () => {
  loading.value = true
  try {
    const res = await adminApi.getUserOnline({
      status: searchForm.status as 'all' | 'online' | 'offline',
      keyword: searchForm.keyword || undefined,
      page: currentPage.value,
      limit: pageSize.value
    })
    if (res) {
      tableData.value = res.list || []
      totalCount.value = res.total || 0
      
      // Update statistics
      onlineCount.value = res.onlineCount || 0
      offlineCount.value = res.offlineCount || 0
      totalAllCount.value = onlineCount.value + offlineCount.value
      if (res.onlineWindowSeconds) {
        onlineWindowSeconds.value = res.onlineWindowSeconds
      }
    }
  } catch (err) {
    console.error('fetchUserOnline failed:', err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchUserOnline()
}

const handleReset = () => {
  searchForm.status = 'all'
  searchForm.keyword = ''
  currentPage.value = 1
  fetchUserOnline()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  fetchUserOnline()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchUserOnline()
}

onMounted(() => {
  fetchUserOnline()
})
</script>

<style scoped>
.user-online-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header-bar h2 {
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 2px;
}

.subtitle-text {
  font-size: 13px;
  color: #8c8c8c;
}

/* Statistics cards layout */
.stats-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-right: 16px;
  position: relative;
}

.stat-total .stat-icon-wrapper {
  background-color: rgba(24, 144, 255, 0.1);
  color: #1890ff;
}

.stat-online .stat-icon-wrapper {
  background-color: rgba(82, 196, 26, 0.1);
  color: #52c41a;
}

.stat-offline .stat-icon-wrapper {
  background-color: rgba(140, 140, 140, 0.1);
  color: #8c8c8c;
}

.pulse-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #52c41a;
  box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.4);
  animation: pulse-ring 1.6s infinite cubic-bezier(0.66, 0, 0, 1);
}

@keyframes pulse-ring {
  to {
    box-shadow: 0 0 0 10px rgba(82, 196, 26, 0);
  }
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 13px;
  color: #8c8c8c;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  line-height: 1;
}

.text-success {
  color: #52c41a;
}

.text-gray {
  color: #595959;
}

.premium-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
  background-color: #ffffff;
}

.filter-panel {
  padding: 20px 24px 0 24px;
}

.table-card {
  padding: 24px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.table-title-text {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.table-title-text b {
  color: #1890ff;
}

.window-info-text {
  font-size: 12px;
  color: #8c8c8c;
}

.window-info-text b {
  color: #e04848;
}

.status-tag {
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  padding: 0 10px;
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #bfbfbf;
  margin-right: 6px;
}

.status-indicator-dot.pulse-active {
  background-color: #52c41a;
  box-shadow: 0 0 4px #52c41a;
  animation: pulse-lite 1.5s infinite alternate;
}

@keyframes pulse-lite {
  from { opacity: 0.6; }
  to { opacity: 1; }
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

.client-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}

.client-type-tag {
  font-weight: 600;
}

.device-text {
  font-size: 11px;
  color: #8c8c8c;
}

.active-status-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.duration-text {
  font-size: 13px;
  color: #595959;
}

.duration-text.text-success {
  font-weight: 600;
}

.time-text {
  font-size: 11px;
  color: #8c8c8c;
}

.empty-text {
  color: #bfbfbf;
  font-style: italic;
  font-size: 13px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
