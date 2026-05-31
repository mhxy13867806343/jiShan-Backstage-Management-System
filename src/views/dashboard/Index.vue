<template>
  <div class="dashboard-container">
    <!-- Welcome Info Row -->
    <div class="welcome-row">
      <div class="welcome-left">
        <h2>分析页 (Analysis)</h2>
        <p class="subtitle-text">欢迎回来！即闪平台实时监管与运营数据分析大屏。</p>
      </div>
      <div class="welcome-right">
        <el-tag type="primary" effect="plain" class="time-tag">
          <el-icon class="icon-align"><Calendar /></el-icon>
          <span>更新时间: {{ currentTimeString }}</span>
        </el-tag>
      </div>
    </div>

    <div class="analysis-stat-grid">
      <!-- Card 1: Total Users -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>注册用户总量</span>
            <el-tag size="small" type="primary" effect="dark">实时</el-tag>
          </div>
        </template>
        <div class="stat-number">{{ metrics.totalUsers }} <span class="stat-unit">人</span></div>
        <div class="stat-trend-row">
          <span>正常状态 <b class="up-text">{{ metrics.activeUsers }} 人</b></span>
          <span>已封禁 <b class="down-text">{{ metrics.totalUsers - metrics.activeUsers }} 人</b></span>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>正常账号占比</span>
          <span class="font-mono font-bold">{{ Math.round((metrics.activeUsers / (metrics.totalUsers || 1)) * 100) }}%</span>
        </div>
      </el-card>

      <!-- Card 2: Active Users -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>月度活跃用户数</span>
            <el-tag size="small" type="success" effect="dark">周活跃</el-tag>
          </div>
        </template>
        <div class="stat-number">{{ metrics.activeUsers }} <span class="stat-unit">人</span></div>
        <div class="stat-trend-row">
          <div class="progress-bar-container">
            <el-progress :percentage="Math.round((metrics.activeUsers / (metrics.totalUsers || 1)) * 100)" :show-text="false" status="success" />
          </div>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>活跃账号比例</span>
          <span class="font-mono font-bold">{{ Math.round((metrics.activeUsers / (metrics.totalUsers || 1)) * 100) }}%</span>
        </div>
      </el-card>

      <!-- Card 3: Downloads / Posts -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>发布内容总量</span>
            <el-tag size="small" type="warning" effect="dark">累计</el-tag>
          </div>
        </template>
        <div class="stat-number">{{ metrics.totalPosts }} <span class="stat-unit">篇</span></div>
        <div class="stat-trend-row">
          <span>已上架 <b class="up-text">{{ metrics.onlinePosts }} 篇</b></span>
          <span>已下架 <b class="down-text">{{ metrics.offlinePosts }} 篇</b></span>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>内容上架合规率</span>
          <span class="font-mono font-bold">{{ Math.round((metrics.onlinePosts / (metrics.totalPosts || 1)) * 100) }}%</span>
        </div>
      </el-card>

      <!-- Card 4: Interactive stats -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>平台互动总量</span>
            <el-tag size="small" type="danger" effect="dark">累计</el-tag>
          </div>
        </template>
        <div class="stat-number">{{ metrics.totalComments + metrics.totalLikes }} <span class="stat-unit">次</span></div>
        <div class="stat-trend-row">
          <span>点赞数 <b class="up-text">{{ metrics.totalLikes }} 次</b></span>
          <span>评论数 <b class="up-text">{{ metrics.totalComments }} 次</b></span>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>人均互动次数</span>
          <span class="font-mono font-bold">{{ ((metrics.totalComments + metrics.totalLikes) / (metrics.totalUsers || 1)).toFixed(1) }} 次/人</span>
        </div>
      </el-card>
    </div>

    <!-- Big Trend Chart Panel (Data analysis diagram) -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <div class="chart-header-flex flex-wrap gap-y-3">
          <div class="chart-title-left">
            <span class="chart-title">{{ activeChartType === 'traffic' ? '流量与内容发布趋势分析' : '用户总量与周活跃度趋势分析' }}</span>
          </div>
          <div class="chart-controls-right">
            <el-radio-group v-model="activeChartType" size="small" class="chart-type-selector">
              <el-radio-button value="traffic">流量与内容</el-radio-button>
              <el-radio-button value="users">用户活跃与增长</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="chartTimeTab" size="small" class="time-tab-selector">
              <el-radio-button value="today">今日</el-radio-button>
              <el-radio-button value="week">本周</el-radio-button>
              <el-radio-button value="month">本月</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>
      
      <!-- Interactive SVG Line and Bar Chart representation -->
      <div class="chart-viewport-box animate-chart">
        <div class="svg-chart-container">
          <svg viewBox="0 0 1000 280" class="svg-vector-graph">
            <!-- Grid Lines -->
            <line x1="50" y1="30" x2="950" y2="30" stroke="#f5f5f5" stroke-dasharray="4" />
            <line x1="50" y1="90" x2="950" y2="90" stroke="#f5f5f5" stroke-dasharray="4" />
            <line x1="50" y1="150" x2="950" y2="150" stroke="#f5f5f5" stroke-dasharray="4" />
            <line x1="50" y1="210" x2="950" y2="210" stroke="#f5f5f5" stroke-dasharray="4" />
            <line x1="50" y1="250" x2="950" y2="250" stroke="#e8e8e8" stroke-width="2" />

            <!-- X Axis Labels -->
            <text x="50" y="270" fill="#999" font-size="12" text-anchor="middle">02:00</text>
            <text x="200" y="270" fill="#999" font-size="12" text-anchor="middle">06:00</text>
            <text x="350" y="270" fill="#999" font-size="12" text-anchor="middle">10:00</text>
            <text x="500" y="270" fill="#999" font-size="12" text-anchor="middle">14:00</text>
            <text x="650" y="270" fill="#999" font-size="12" text-anchor="middle">18:00</text>
            <text x="800" y="270" fill="#999" font-size="12" text-anchor="middle">22:00</text>
            <text x="950" y="270" fill="#999" font-size="12" text-anchor="middle">今日汇总</text>

            <!-- Chart 1: Traffic & Content -->
            <g v-if="activeChartType === 'traffic'">
              <!-- Area gradient under path -->
              <path 
                d="M 50,220 C 150,180 200,90 350,110 C 500,130 550,50 650,70 C 750,90 800,180 950,120 L 950,250 L 50,250 Z" 
                fill="rgba(24, 144, 255, 0.08)"
              />
              <!-- Vector Line - active user visits (blue line) -->
              <path 
                d="M 50,220 C 150,180 200,90 350,110 C 500,130 550,50 650,70 C 750,90 800,180 950,120" 
                fill="none" 
                stroke="#1890ff" 
                stroke-width="3.5" 
                stroke-linecap="round"
              />
              <!-- Dots on peaks -->
              <circle cx="350" cy="110" r="5" fill="#ffffff" stroke="#1890ff" stroke-width="2" />
              <circle cx="650" cy="70" r="5" fill="#ffffff" stroke="#1890ff" stroke-width="2" />
              <circle cx="950" cy="120" r="5" fill="#ffffff" stroke="#1890ff" stroke-width="2" />

              <!-- Vector Bar - content publishing count (green bars) -->
              <rect x="185" y="160" width="30" height="90" fill="#2fc25b" rx="2" opacity="0.85" />
              <rect x="335" y="120" width="30" height="130" fill="#2fc25b" rx="2" opacity="0.85" />
              <rect x="485" y="190" width="30" height="60" fill="#2fc25b" rx="2" opacity="0.85" />
              <rect x="635" y="80" width="30" height="170" fill="#2fc25b" rx="2" opacity="0.85" />
              <rect x="785" y="150" width="30" height="100" fill="#2fc25b" rx="2" opacity="0.85" />
            </g>

            <!-- Chart 2: User Growth & Active -->
            <g v-else>
              <!-- Total registered users line (purple line) -->
              <path 
                d="M 50,200 C 150,190 200,160 350,140 C 500,120 550,100 650,80 C 750,70 800,60 950,45 L 950,250 L 50,250 Z" 
                fill="rgba(114, 46, 209, 0.06)"
              />
              <path 
                d="M 50,200 C 150,190 200,160 350,140 C 500,120 550,100 650,80 C 750,70 800,60 950,45" 
                fill="none" 
                stroke="#722ed1" 
                stroke-width="3.5" 
                stroke-linecap="round"
              />
              <!-- Dots on peaks -->
              <circle cx="350" cy="140" r="5" fill="#ffffff" stroke="#722ed1" stroke-width="2" />
              <circle cx="650" cy="80" r="5" fill="#ffffff" stroke="#722ed1" stroke-width="2" />
              <circle cx="950" cy="45" r="5" fill="#ffffff" stroke="#722ed1" stroke-width="2" />

              <!-- Active users line (orange/amber line) -->
              <path 
                d="M 50,210 C 150,160 200,200 350,170 C 500,180 550,130 650,150 C 750,160 800,200 950,165 L 950,250 L 50,250 Z" 
                fill="rgba(250, 140, 22, 0.06)"
              />
              <path 
                d="M 50,210 C 150,160 200,200 350,170 C 500,180 550,130 650,150 C 750,160 800,200 950,165" 
                fill="none" 
                stroke="#fa8c16" 
                stroke-width="3.5" 
                stroke-linecap="round"
              />
              <!-- Dots on peaks -->
              <circle cx="350" cy="170" r="5" fill="#ffffff" stroke="#fa8c16" stroke-width="2" />
              <circle cx="650" cy="150" r="5" fill="#ffffff" stroke="#fa8c16" stroke-width="2" />
              <circle cx="950" cy="165" r="5" fill="#ffffff" stroke="#fa8c16" stroke-width="2" />
            </g>
          </svg>
        </div>

        <!-- Chart Legend -->
        <div class="chart-legend-box">
          <template v-if="activeChartType === 'traffic'">
            <div class="legend-item">
              <span class="legend-color-dot blue-dot"></span>
              <span>活跃流量趋势 (Visits)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color-dot green-dot"></span>
              <span>内容发布量统计 (Posts)</span>
            </div>
          </template>
          <template v-else>
            <div class="legend-item">
              <span class="legend-color-dot purple-dot"></span>
              <span>注册用户总量增长 (Total Users)</span>
            </div>
            <div class="legend-item">
              <span class="legend-color-dot orange-dot"></span>
              <span>周活跃人数统计 (Weekly Active)</span>
            </div>
          </template>
        </div>
      </div>
    </el-card>

    <!-- Bottom Lists Row (Standard Admin analysis details) -->
    <div class="bottom-tables-row">
      <!-- Left: Hot content ranked -->
      <el-card class="list-card-panel" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>实时运营内容热度榜</span>
            <el-button type="primary" link @click="router.push('/content')">查看更多</el-button>
          </div>
        </template>

        <el-table :data="hotContents" style="width: 100%" size="small">
          <el-table-column type="index" label="排名" width="50" align="center">
            <template #default="{ $index }">
              <span class="rank-badge" :class="'rank-' + ($index + 1)">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="nickname" label="发布人" width="100" />
          <el-table-column label="内容大纲" min-width="150">
            <template #default="{ row }">
              <span class="text-ellipsis-single">{{ row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="likes" label="获赞数" width="80" align="center" />
          <el-table-column prop="comments" label="评论数" width="80" align="center" />
        </el-table>
      </el-card>

      <!-- Right: Shortcut Actions -->
      <el-card class="list-card-panel" shadow="never">
        <template #header>
          <div>
            <span>快捷管理入口</span>
          </div>
        </template>

        <div class="action-shortcut-list">
          <div class="shortcut-box" @click="router.push('/user')">
            <el-icon class="icon-user"><User /></el-icon>
            <div class="text-meta">
              <h4>用户安全审查</h4>
              <p>管理账号启禁用与权限分配</p>
            </div>
          </div>

          <div class="shortcut-box" @click="router.push('/content')">
            <el-icon class="icon-content"><Document /></el-icon>
            <div class="text-meta">
              <h4>内容上下架</h4>
              <p>管控敏感或合规运营内容</p>
            </div>
          </div>

          <div class="shortcut-box" @click="router.push('/agreement/privacy')">
            <el-icon class="icon-agree"><Lock /></el-icon>
            <div class="text-meta">
              <h4>协议与条款配置</h4>
              <p>编辑并实时更新服务与隐私协议</p>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { adminApi } from '@/api/admin'
import { Calendar } from '@element-plus/icons-vue'

const router = useRouter()
const chartTimeTab = ref('today')
const activeChartType = ref('traffic')
const currentTimeString = ref('')

const metrics = ref<any>({
  totalUsers: 0,
  activeUsers: 0,
  totalPosts: 0,
  onlinePosts: 0,
  offlinePosts: 0,
  totalComments: 0,
  totalLikes: 0
})

const hotContents = ref<any[]>([])

const fetchDashboardData = async () => {
  try {
    const data = await adminApi.getDashboardMetrics()
    if (data) {
      metrics.value = data
    }
    
    // Fetch posts to rank them
    const postsRes = await adminApi.getPosts({ page: 1, limit: 10 })
    if (postsRes && postsRes.list) {
      hotContents.value = [...postsRes.list]
        .sort((a, b) => b.likes - a.likes)
        .slice(0, 4)
    }
  } catch (err) {
    console.error('Failed to fetch dashboard data', err)
  }
}

// Format current date
const updateCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTimeString.value = `${year}年${month}月${day}日 ${hours}:${minutes}`
}

onMounted(() => {
  updateCurrentTime()
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Welcome info styling */
.welcome-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.welcome-left h2 {
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 2px;
}

.subtitle-text {
  font-size: 13px;
  color: #8c8c8c;
}

.time-tag {
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 4px;
}

.icon-align {
  vertical-align: middle;
  margin-right: 6px;
}

/* Standard AntD Grid */
.analysis-stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.analysis-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
  background-color: #ffffff;
}

.analysis-card :deep(.el-card__header) {
  padding: 12px 20px !important;
  border-bottom: 1px solid #f0f0f0 !important;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.45);
  background: none !important;
}

.analysis-card :deep(.el-card__body) {
  padding: 20px !important;
}

.card-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-number {
  font-size: 30px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  line-height: 38px;
  margin-bottom: 8px;
}

.stat-trend-row {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  display: flex;
  gap: 12px;
  height: 20px;
  align-items: center;
}

.progress-bar-container {
  width: 100%;
}

.up-text {
  color: #52c41a;
  font-weight: 600;
}

.down-text {
  color: #f5222d;
  font-weight: 600;
}

.card-divider {
  margin: 12px 0 !important;
  border-color: #f0f0f0 !important;
}

.stat-footer-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.font-bold {
  font-weight: 600;
}

/* Big trend chart card */
.chart-card {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
}

.chart-card :deep(.el-card__header) {
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 16px 20px !important;
  background: none !important;
}

.chart-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
}

.chart-viewport-box {
  padding: 10px 0;
}

.svg-chart-container {
  width: 100%;
  max-width: 100%;
  margin-bottom: 15px;
}

.svg-vector-graph {
  width: 100%;
  height: auto;
}

.chart-legend-box {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}

.blue-dot { background-color: #1890ff; }
.green-dot { background-color: #2fc25b; }
.purple-dot { background-color: #722ed1; }
.orange-dot { background-color: #fa8c16; }

/* Premium styling additions */
.stat-unit {
  font-size: 14px;
  font-weight: normal;
  color: rgba(0, 0, 0, 0.45);
  margin-left: 4px;
}

.chart-controls-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.animate-chart {
  transition: all 0.3s ease;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-y-3 {
  row-gap: 12px;
}

/* Bottom table row */
.bottom-tables-row {
  display: grid;
  grid-template-columns: 1.3fr 0.7fr;
  gap: 20px;
}

@media (max-width: 900px) {
  .bottom-tables-row {
    grid-template-columns: 1fr;
  }
}

.list-card-panel {
  border: 1px solid #e8e8e8 !important;
  border-radius: 2px !important;
}

.list-card-panel :deep(.el-card__header) {
  border-bottom: 1px solid #f0f0f0 !important;
  padding: 12px 20px !important;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  background: none !important;
}

.list-card-panel :deep(.el-card__body) {
  padding: 16px !important;
}

/* Rank Badges */
.rank-badge {
  display: inline-block;
  width: 18px;
  height: 18px;
  line-height: 18px;
  border-radius: 50%;
  background-color: #f0f0f0;
  font-size: 11px;
  font-weight: bold;
  color: #666;
}

.rank-1 { background-color: #f5222d; color: white; }
.rank-2 { background-color: #fa8c16; color: white; }
.rank-3 { background-color: #fadb14; color: white; }

.text-ellipsis-single {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 250px;
}

/* Shortcut Box */
.action-shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcut-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.shortcut-box:hover {
  background-color: #f0f5ff;
  border-color: #adc6ff;
}

.shortcut-box el-icon {
  font-size: 20px;
}

.icon-user { color: #722ed1; }
.icon-content { color: #1890ff; }
.icon-agree { color: #fa8c16; }

.text-meta h4 {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 2px;
}

.text-meta p {
  font-size: 11px;
  color: #8c8c8c;
}
</style>
