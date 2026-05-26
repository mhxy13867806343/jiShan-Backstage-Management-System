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

    <!-- 4 Core Analysis Stat Cards (Standard AntD / Ele Admin Layout) -->
    <div class="analysis-stat-grid">
      <!-- Card 1: Visits -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>访问量</span>
            <el-tag size="small" type="primary" effect="dark">日</el-tag>
          </div>
        </template>
        <div class="stat-number">25,890</div>
        <div class="stat-trend-row">
          <span>同周比 <b class="up-text">12.5% ↑</b></span>
          <span>日环比 <b class="down-text">4.2% ↓</b></span>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>总访问量</span>
          <span class="font-mono font-bold">1,024,550</span>
        </div>
      </el-card>

      <!-- Card 2: Downloads / Posts -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>发布内容量</span>
            <el-tag size="small" type="success" effect="dark">周</el-tag>
          </div>
        </template>
        <div class="stat-number">{{ metrics.totalPosts }}</div>
        <div class="stat-trend-row">
          <span>已上架 <b class="up-text">{{ metrics.onlinePosts }} 篇</b></span>
          <span>已下架 <b class="down-text">{{ metrics.offlinePosts }} 篇</b></span>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>内容上架率</span>
          <span class="font-mono font-bold">{{ Math.round((metrics.onlinePosts / (metrics.totalPosts || 1)) * 100) }}%</span>
        </div>
      </el-card>

      <!-- Card 3: Interactive comments -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>互动评论数</span>
            <el-tag size="small" type="warning" effect="dark">月</el-tag>
          </div>
        </template>
        <div class="stat-number">{{ metrics.totalComments }}</div>
        <div class="stat-trend-row">
          <div class="progress-bar-container">
            <el-progress :percentage="72" :show-text="false" status="warning" />
          </div>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>评论活跃度</span>
          <span class="font-bold">极高活跃</span>
        </div>
      </el-card>

      <!-- Card 4: Likes -->
      <el-card class="analysis-card" shadow="never">
        <template #header>
          <div class="card-header-flex">
            <span>累计点赞量</span>
            <el-tag size="small" type="danger" effect="dark">年</el-tag>
          </div>
        </template>
        <div class="stat-number">{{ metrics.totalLikes }}</div>
        <div class="stat-trend-row">
          <span>同比上月 <b class="up-text">18.4% ↑</b></span>
        </div>
        <el-divider class="card-divider" />
        <div class="stat-footer-row">
          <span>总点赞数</span>
          <span class="font-mono font-bold">{{ metrics.totalLikes }}</span>
        </div>
      </el-card>
    </div>

    <!-- Big Trend Chart Panel (Data analysis diagram) -->
    <el-card class="chart-card" shadow="never">
      <template #header>
        <div class="chart-header-flex">
          <span class="chart-title">流量与内容发布趋势分析</span>
          <el-radio-group v-model="chartTimeTab" size="small">
            <el-radio-button value="today">今日</el-radio-button>
            <el-radio-button value="week">本周</el-radio-button>
            <el-radio-button value="month">本月</el-radio-button>
          </el-radio-group>
        </div>
      </template>
      
      <!-- Interactive SVG Line and Bar Chart representation -->
      <div class="chart-viewport-box">
        <div class="svg-chart-container">
          <svg viewBox="0 0 1000 280" class="svg-vector-graph">
            <!-- Grid Lines -->
            <line x1="50" y1="30" x2="950" y2="30" stroke="#f0f0f0" stroke-dasharray="4" />
            <line x1="50" y1="90" x2="950" y2="90" stroke="#f0f0f0" stroke-dasharray="4" />
            <line x1="50" y1="150" x2="950" y2="150" stroke="#f0f0f0" stroke-dasharray="4" />
            <line x1="50" y1="210" x2="950" y2="210" stroke="#f0f0f0" stroke-dasharray="4" />
            <line x1="50" y1="250" x2="950" y2="250" stroke="#e8e8e8" stroke-width="2" />

            <!-- X Axis Labels -->
            <text x="50" y="270" fill="#999" font-size="12" text-anchor="middle">02:00</text>
            <text x="200" y="270" fill="#999" font-size="12" text-anchor="middle">06:00</text>
            <text x="350" y="270" fill="#999" font-size="12" text-anchor="middle">10:00</text>
            <text x="500" y="270" fill="#999" font-size="12" text-anchor="middle">14:00</text>
            <text x="650" y="270" fill="#999" font-size="12" text-anchor="middle">18:00</text>
            <text x="800" y="270" fill="#999" font-size="12" text-anchor="middle">22:00</text>
            <text x="950" y="270" fill="#999" font-size="12" text-anchor="middle">今日汇总</text>

            <!-- Vector Line - active user visits (blue line) -->
            <path 
              d="M 50,220 C 150,180 200,90 350,110 C 500,130 550,50 650,70 C 750,90 800,180 950,120" 
              fill="none" 
              stroke="#1890ff" 
              stroke-width="3.5" 
              stroke-linecap="round"
            />
            
            <!-- Area gradient under path -->
            <path 
              d="M 50,220 C 150,180 200,90 350,110 C 500,130 550,50 650,70 C 750,90 800,180 950,120 L 950,250 L 50,250 Z" 
              fill="rgba(24, 144, 255, 0.08)"
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
          </svg>
        </div>

        <!-- Chart Legend -->
        <div class="chart-legend-box">
          <div class="legend-item">
            <span class="legend-color-dot blue-dot"></span>
            <span>活跃流量趋势 (Visits)</span>
          </div>
          <div class="legend-item">
            <span class="legend-color-dot green-dot"></span>
            <span>内容发布量统计 (Posts)</span>
          </div>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMockDataStore } from '@/store/mockData'
import { Calendar } from '@element-plus/icons-vue'

const router = useRouter()
const mockStore = useMockDataStore()
const chartTimeTab = ref('today')
const currentTimeString = ref('')

const metrics = computed(() => {
  return mockStore.getDashboardMetrics()
})

// Extract top 4 hot contents from local store posts sorted by likes
const hotContents = computed(() => {
  return [...mockStore.posts]
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 4)
})

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
