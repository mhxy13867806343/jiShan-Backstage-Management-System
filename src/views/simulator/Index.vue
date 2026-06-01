<template>
  <div class="simulator-container">
    <!-- Top Action Info bar -->
    <div class="header-action-bar premium-card">
      <div class="header-text-info">
        <h2>App 交互与前台仿真模拟器</h2>
        <p>体验即闪前台App高真度仿真界面。在下方手机端进行的操作将通过 Pinia 状态机实时联动到后台管理系统各模块。</p>
      </div>
      <div class="impersonate-box">
        <span class="label-text">当前模拟操作人 (当前登录)：</span>
        <el-select v-model="currentUserId" @change="handleUserChange" style="width: 220px;" size="default">
          <el-option 
            v-for="u in mockStore.users" 
            :key="u.user_id" 
            :label="`${u.nickname} (${u.status === 'banned' ? '已封禁' : '正常'})`" 
            :value="u.user_id"
          />
        </el-select>
      </div>
    </div>

    <!-- Main Workspace Splitter -->
    <div class="workspace-grid">
      
      <!-- Left Column: Virtual iOS Smartphone Mockup -->
      <div class="phone-viewport-column premium-card">
        <div class="column-title">
          <el-icon><Smartphone /></el-icon>
          <span>即闪 App 手机端仿真屏</span>
        </div>

        <div class="viewport-box">
          <!-- Virtual Phone Wrapper -->
          <div class="iphone-mockup" :class="{ 'phone-banned': currentUser?.status === 'banned' }">
            
            <!-- Ear Speaker / Dynamic Island notch -->
            <div class="iphone-notch"></div>
            
            <!-- Top Status Bar -->
            <div class="phone-status-bar">
              <span class="status-time">{{ currentPhoneTime }}</span>
              <div class="status-right-icons">
                <el-icon><Connection /></el-icon>
                <span class="network-type">5G</span>
                <el-icon><BatteryFull /></el-icon>
              </div>
            </div>

            <!-- Header of active screen inside phone -->
            <div class="phone-header">
              <el-icon v-show="activeScreen !== 'feed'" class="back-icon" @click="goBackToFeed"><ArrowLeft /></el-icon>
              <span class="screen-title">{{ getScreenTitle() }}</span>
              <div class="header-placeholder"></div>
            </div>

            <!-- Screen Viewport Body -->
            <div class="phone-screen-body">
              
              <!-- Banned Overlay if active user is banned -->
              <div v-if="currentUser?.status === 'banned'" class="banned-overlay">
                <el-icon :size="50" class="ban-icon"><Lock /></el-icon>
                <h3>您的账号已被平台管理员禁用</h3>
                <p>因涉嫌违反社区运营规范，已限制所有登录及发布操作。如有疑问请联系即闪官方客服。</p>
              </div>

              <!-- VIEW 1: 动态广场 (Feed Square) -->
              <div v-if="activeScreen === 'feed'" class="screen-feed">
                <!-- Hashtags Banner Matching Image 1 -->
                <div class="tag-recommend-bar">
                  <span 
                    v-for="t in mockStore.tags" 
                    :key="t" 
                    class="tag-badge" 
                    @click="addTagToInput('#' + t)"
                  >
                    #{{ t }}
                  </span>
                </div>

                <!-- Feed Lists -->
                <div class="feed-posts-list">
                  <div 
                    v-for="post in mockStore.posts.filter(p => p.status === 'online')" 
                    :key="post.post_id" 
                    class="feed-post-card"
                    @click="viewPostDetail(post.post_id)"
                  >
                    <div class="post-header-row">
                      <el-avatar :size="32" :src="post.avatar" />
                      <div class="post-meta">
                        <span class="nickname">{{ post.nickname }}</span>
                        <span class="pubtime">{{ formatTimeFriendly(post.pubTime) }}</span>
                      </div>
                    </div>

                    <p class="post-content">{{ post.content }}</p>

                    <!-- Images Grid -->
                    <div v-if="post.images && post.images.length" class="post-images-grid" :class="'grid-' + Math.min(post.images.length, 3)">
                      <div 
                        v-for="(img, idx) in post.images.slice(0, 3)" 
                        :key="idx" 
                        class="grid-img-item"
                        :style="{ backgroundImage: `url(${img})` }"
                      >
                        <span v-if="idx === 2 && post.images.length > 3" class="more-badge">+{{ post.images.length - 3 }}</span>
                      </div>
                    </div>

                    <!-- Post Actions row -->
                    <div class="post-actions-bar" @click.stop>
                      <div class="action-item" @click="likePost(post.post_id)">
                        <el-icon class="action-icon like-icon"><Heart /></el-icon>
                        <span>{{ post.likes }}</span>
                      </div>
                      <div class="action-item" @click="viewPostDetail(post.post_id)">
                        <el-icon class="action-icon"><ChatDotRound /></el-icon>
                        <span>{{ post.comments }}</span>
                      </div>
                      <div class="action-item" @click="sharePost(post.post_id)">
                        <el-icon class="action-icon"><Share /></el-icon>
                        <span>{{ post.shares }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Floating Release Button -->
                <div class="floating-btn" @click="switchTo('publish')">
                  <el-icon><Plus /></el-icon>
                </div>
              </div>

              <!-- VIEW 2: 绑定/更换手机号 (Bind Phone) -->
              <div v-else-if="activeScreen === 'phone'" class="screen-phone">
                <div class="form-container">
                  <h2 class="form-main-heading">更换绑定手机号</h2>
                  <p class="form-desc-text">原手机号用于展示当前绑定状态，下面填写新的手机号并完成验证码校验。</p>

                  <div class="current-bound-card">
                    <span class="bound-label">当前已绑定</span>
                    <span class="bound-number font-mono">{{ formatMaskedPhone(currentUser?.phone || '') }}</span>
                  </div>

                  <el-form label-position="top" class="simulator-inner-form">
                    <el-form-item label="*新手机号" class="sim-form-item required-label">
                      <el-input 
                        v-model="phoneForm.newPhone" 
                        placeholder="请输入新手机号" 
                        maxlength="11"
                        class="sim-input"
                      />
                    </el-form-item>

                    <el-form-item label="*验证码" class="sim-form-item required-label">
                      <div class="sms-input-row">
                        <el-input 
                          v-model="phoneForm.code" 
                          placeholder="请输入验证码" 
                          maxlength="4"
                          class="sim-input-sms"
                        />
                        <button 
                          type="button" 
                          class="sms-btn" 
                          :disabled="smsCooldown > 0"
                          @click="triggerGetSmsCode"
                        >
                          {{ smsCooldown > 0 ? `${smsCooldown}s` : '获取验证码' }}
                        </button>
                      </div>
                    </el-form-item>

                    <button 
                      type="button" 
                      class="sim-submit-btn" 
                      @click="submitPhoneBind"
                    >
                      确认绑定
                    </button>
                  </el-form>
                </div>
              </div>

              <!-- VIEW 3: 发布动态 (Publish Post) -->
              <div v-else-if="activeScreen === 'publish'" class="screen-publish">
                <div class="publish-scrollable-body">
                  
                  <!-- Post text editor -->
                  <el-input
                    v-model="publishForm.content"
                    type="textarea"
                    :rows="4"
                    placeholder="分享你的新鲜事... 点击上方的标签推荐可以快速插入话题哦"
                    class="publish-textarea"
                  />

                  <!-- Tag suggestion list inside editor screen -->
                  <div class="publish-tag-suggestions">
                    <span 
                      v-for="t in mockStore.tags" 
                      :key="t" 
                      class="tag-badge mini" 
                      @click="publishForm.content += ' #' + t"
                    >
                      #{{ t }}
                    </span>
                  </div>

                  <!-- Media upload area Matching Image 3 -->
                  <div class="media-upload-section">
                    <div class="section-label">
                      <strong>媒体区域</strong>
                      <span>支持图片和视频任意混传，总数最多 9 个，默认展示 1 个上传位</span>
                    </div>

                    <div class="upload-grid-list">
                      <!-- Dash box button -->
                      <div class="upload-dash-box" @click="selectMockImageGroup">
                        <el-icon class="plus-icon"><Plus /></el-icon>
                        <span class="box-title">添加图片 / 视频</span>
                        <span class="box-desc">已选 {{ publishForm.images.length }} 张图片 / 0 个视频</span>
                      </div>

                      <!-- Selected images preview thumbnails -->
                      <div 
                        v-for="(img, idx) in publishForm.images" 
                        :key="idx" 
                        class="thumb-image-item"
                        :style="{ backgroundImage: `url(${img})` }"
                      >
                        <span class="del-badge" @click.stop="publishForm.images.splice(idx, 1)">×</span>
                      </div>
                    </div>
                  </div>

                  <!-- Supplementary information Matching Image 3 -->
                  <div class="supplement-info-section">
                    <div class="section-header">
                      <strong>补充信息</strong>
                      <span>让内容更像真实动态</span>
                    </div>

                    <div class="supp-row" @click="toggleLocationSelect">
                      <span class="label">发布位置</span>
                      <span class="value select-trigger">
                        {{ publishForm.location || '选择发布位置' }}
                        <el-icon class="arrow-right-icon"><ArrowRight /></el-icon>
                      </span>
                    </div>

                    <!-- Collapsible location mock lists -->
                    <div v-show="showLocationList" class="location-mock-list">
                      <div 
                        v-for="loc in mockStore.regions" 
                        :key="loc" 
                        class="loc-item" 
                        :class="{ 'active': publishForm.location === loc }"
                        @click="selectLocation(loc)"
                      >
                        {{ loc }}
                      </div>
                    </div>

                    <div class="supp-row">
                      <span class="label">可见范围</span>
                      <span class="value">
                        <el-select v-model="publishForm.visibility" class="mini-sim-select" style="width: 100px;">
                          <el-option 
                            v-for="opt in mockStore.dicts.post_visibility" 
                            :key="opt.value" 
                            :label="opt.label" 
                            :value="opt.value" 
                          />
                        </el-select>
                        <el-icon class="arrow-right-icon"><ArrowRight /></el-icon>
                      </span>
                    </div>
                  </div>

                  <!-- Submit Post block -->
                  <div class="publish-action-box">
                    <button 
                      type="button" 
                      class="sim-submit-btn" 
                      @click="submitPublishPost"
                    >
                      发布动态
                    </button>
                  </div>
                </div>
              </div>

              <!-- VIEW 4: 动态详情与评论区 (Post Detail) -->
              <div v-else-if="activeScreen === 'detail'" class="screen-detail">
                <div class="detail-scrollable-body" v-if="detailPost">
                  <!-- Publisher header card -->
                  <div class="detail-publisher-card">
                    <div class="publisher-meta-row">
                      <el-avatar :size="40" :src="detailPost.avatar" />
                      <div class="publisher-info">
                        <div class="row-flex">
                          <span class="nickname">{{ detailPost.nickname }}</span>
                          <span class="user-label-tag">美食收集</span>
                        </div>
                        <span class="pubtime-location">{{ formatTimeFriendly(detailPost.pubTime) }} · 广州·天河</span>
                      </div>
                    </div>
                  </div>

                  <!-- Post Full Text & tags Matching Image 4 -->
                  <div class="detail-text-content">
                    <p class="body-text">{{ detailPost.content }}</p>
                    
                    <div class="hashtags-list">
                      <span class="hash-tag-link">#探店</span>
                      <span class="hash-tag-link">#面包脑袋</span>
                      <span class="hash-tag-link">#周末去哪</span>
                    </div>
                  </div>

                  <!-- Post images grid Matching Image 4 -->
                  <div v-if="detailPost.images && detailPost.images.length" class="detail-images-list">
                    <div 
                      v-for="(img, idx) in detailPost.images" 
                      :key="idx" 
                      class="detail-card-img"
                    >
                      <el-image :src="img" fit="cover" class="detail-el-img" />
                      <div class="image-title-overlay">{{ mockImageNames[idx] || '展示细节' }}</div>
                    </div>
                  </div>

                  <!-- Heart/Comment/Share interactive button bar Matching Image 4 -->
                  <div class="detail-interactive-bar">
                    <div class="interact-box" @click="likePost(detailPost?.post_id || '')">
                      <el-icon class="icon heart-active"><Heart /></el-icon>
                      <span class="count">{{ detailPost.likes }}</span>
                    </div>
                    <div class="interact-box">
                      <el-icon class="icon"><ChatLineSquare /></el-icon>
                      <span class="count">{{ detailPost.comments }}</span>
                    </div>
                    <div class="interact-box" @click="sharePost(detailPost?.post_id || '')">
                      <el-icon class="icon"><Share /></el-icon>
                      <span class="count">{{ detailPost.shares }}</span>
                    </div>
                  </div>

                  <!-- Dynamic details description box Matching Image 4 -->
                  <div class="interactive-sync-banner premium-card">
                    <div class="banner-title">动态详情</div>
                    <p class="banner-text">这里和首页使用同一份动态状态，点赞、评论、分享和图片内容会实时同步。</p>
                  </div>

                  <!-- Comments Feed Section Matching Image 4 -->
                  <div class="detail-comments-section">
                    <div class="section-label-header">评论区</div>
                    <p class="section-helper-text">评论区和首页使用同一份评论数据，新增评论会直接同步回列表。</p>

                    <div class="comments-list-body">
                      <div 
                        v-for="c in mockStore.comments.filter(item => item.post_id === detailPost?.post_id)" 
                        :key="c.comment_id" 
                        class="detail-comment-card"
                      >
                        <el-avatar :size="24" :src="c.avatar" />
                        <div class="comment-msg-box">
                          <div class="comment-author-row">
                            <span class="name">{{ c.nickname }}</span>
                            <span class="time">{{ formatTimeFriendly(c.pubTime) }}</span>
                          </div>
                          <p class="comment-content-text">
                            <span v-if="c.reply_to_nickname" class="reply-target-tag">@{{ c.reply_to_nickname }} ：</span>
                            {{ c.content }}
                          </p>
                        </div>
                      </div>

                      <div 
                        v-if="!mockStore.comments.some(item => item.post_id === detailPost?.post_id)" 
                        class="empty-comments"
                      >
                        暂无评论，快来发表第一条神评吧~
                      </div>
                    </div>
                  </div>

                  <!-- Live comment input bar -->
                  <div class="detail-comment-input-bar">
                    <el-input 
                      v-model="commentInput" 
                      placeholder="写下你的优质评论..." 
                      class="comment-input-field"
                      @keyup.enter="submitAddComment"
                    >
                      <template #suffix>
                        <el-button type="primary" link @click="submitAddComment">发送</el-button>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>

            </div>

            <!-- Virtual Home Bar for iPhone Mockup -->
            <div class="iphone-home-bar" @click="goBackToFeed"></div>
          </div>
        </div>
      </div>

      <!-- Right Column: Control Dashboard & Action Logs -->
      <div class="control-panel-column">
        
        <!-- Quick Control shortcuts card -->
        <div class="panel-card premium-card">
          <div class="column-title">
            <el-icon><Cpu /></el-icon>
            <span>模拟器运行控制器</span>
          </div>

          <div class="card-content-body">
            <h4 class="shortcut-label">快捷切换手机端屏幕：</h4>
            <div class="screen-switch-grid" style="grid-template-columns: repeat(3, 1fr);">
              <el-button 
                :type="activeScreen === 'feed' ? 'primary' : 'default'" 
                icon="Grid" 
                @click="switchTo('feed')"
              >
                动态广场
              </el-button>
              <el-button 
                :type="activeScreen === 'publish' ? 'primary' : 'default'" 
                icon="Plus" 
                @click="switchTo('publish')"
              >
                发布动态
              </el-button>
              <el-button 
                :type="activeScreen === 'detail' ? 'primary' : 'default'" 
                icon="ChatLineSquare" 
                @click="viewPostDetail('20008')"
              >
                阿岛的详情
              </el-button>
            </div>

            <el-divider class="panel-divider" />

            <div class="integration-tips-card glass-effect">
              <h5>🛡️ 全局联动仿真须知：</h5>
              <ul>
                <li>在<strong>“用户管理”</strong>中点击<strong>“换绑手机”</strong>，可模拟高保真 iPhone 换换手机号。换换成功后，列表会自动渲染最新状态。</li>
                <li>在<strong>“发布动态”</strong>屏发布内容后，可立即点击后台的 <strong>“内容管理”</strong> 列表查看刚刚新增的帖子。</li>
                <li>在<strong>“动态详情”</strong>点击点赞、分享，或者在底部输入框发送一条评论，全局 <strong>“数据看板”</strong> 与 <strong>“评论管理”</strong> 对应数值将实时同步并增加。</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Simulator Action logs terminal -->
        <div class="panel-card premium-card terminal-card">
          <div class="column-title">
            <el-icon><Cpu /></el-icon>
            <span>模拟器核心交互实时日志 (Simulator Action Logs)</span>
          </div>

          <div class="terminal-body" ref="logTerminal">
            <div 
              v-for="(log, idx) in logs" 
              :key="idx" 
              class="log-line"
              :class="log.type"
            >
              <span class="log-time font-mono">[{{ log.time }}]</span>
              <span class="log-badge font-mono">[{{ log.type.toUpperCase() }}]</span>
              <span class="log-text">{{ log.text }}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue'
import { useMockDataStore } from '@/store/mockData'
import { ElMessage, ElNotification } from 'element-plus'

const mockStore = useMockDataStore()
const currentUserId = ref('10009') // default impersonate: 阿岛
const activeScreen = ref<'feed' | 'phone' | 'publish' | 'detail'>('feed')

const currentPhoneTime = ref('09:41')
let timeIntervalId: any = null

// Form values
const phoneForm = ref({
  newPhone: '',
  code: ''
})
const smsCooldown = ref(0)
let smsTimer: any = null
const currentGeneratedSmsCode = ref('')

const publishForm = ref({
  content: '',
  images: [] as string[],
  location: '杭州·滨江天街',
  visibility: 'public'
})
const showLocationList = ref(false)

const detailPostId = ref('20008')
const commentInput = ref('')

// Interactive names matching bakery photos Image 4
const mockImageNames = ['门头', '面包陈列', '座位区', '开心果可颂']


// Simulator Logs
interface LogItem {
  time: string
  type: 'system' | 'auth' | 'database' | 'sms'
  text: string
}
const logs = ref<LogItem[]>([])
const logTerminal = ref<HTMLElement | null>(null)

const currentUser = computed(() => {
  return mockStore.getUserById(currentUserId.value)
})

const detailPost = computed(() => {
  return mockStore.getPostById(detailPostId.value)
})

const getScreenTitle = () => {
  switch (activeScreen.value) {
    case 'feed': return '即闪广场'
    case 'phone': return '绑定手机号'
    case 'publish': return '发布动态'
    case 'detail': return '动态详情'
  }
}

const switchTo = (screen: 'feed' | 'phone' | 'publish' | 'detail') => {
  activeScreen.value = screen
  addLog('system', `手机端切换到 【${getScreenTitle()}】 界面`)
}

const handleUserChange = () => {
  const user = currentUser.value
  if (user) {
    addLog('auth', `已成功切换并扮演前端业务用户：【${user.nickname}】 (ID: ${user.user_id})`)
    // Clear forms
    phoneForm.value.newPhone = ''
    phoneForm.value.code = ''
    if (user.status === 'banned') {
      addLog('auth', `警告！该用户账号目前正处于后台“禁用”状态，已强制拦截仿真器端的所有业务访问。`)
    }
  }
}

const addTagToInput = (tag: string) => {
  switchTo('publish')
  publishForm.value.content = tag + ' ' + publishForm.value.content
  addLog('system', `在发布区快速插入话题标签：${tag}`)
}

const formatMaskedPhone = (phone: string) => {
  if (!phone || phone.length < 7) return phone
  return phone.substring(0, 3) + '****' + phone.substring(7)
}

// Sms code mock triggering
const triggerGetSmsCode = () => {
  if (!phoneForm.value.newPhone || phoneForm.value.newPhone.length !== 11) {
    ElMessage.warning('请输入合法的 11 位新手机号')
    return
  }
  
  // Generate random 4 digit code
  const code = String(Math.floor(1000 + Math.random() * 9000))
  currentGeneratedSmsCode.value = code
  
  addLog('sms', `系统为手机号 ${phoneForm.value.newPhone} 申请短信验证码。`)
  
  // Show notification
  ElNotification({
    title: '💬 【即闪仿真】短信网关提醒',
    message: `您正在申请修改手机绑定关系。本次验证码为：【${code}】，请在手机屏幕内正确输入进行安全校验。`,
    type: 'success',
    duration: 6000
  })

  addLog('sms', `验证码发送成功！本次短信验证码为: 【${code}】 (60秒内有效)`)

  // Cooldown timer
  smsCooldown.value = 60
  smsTimer = setInterval(() => {
    if (smsCooldown.value > 0) {
      smsCooldown.value--
    } else {
      clearInterval(smsTimer)
    }
  }, 1000)
}

const submitPhoneBind = () => {
  if (currentUser.value?.status === 'banned') {
    ElMessage.error('当前用户已被封禁，无法提交绑定操作')
    return
  }
  if (!phoneForm.value.newPhone || phoneForm.value.newPhone.length !== 11) {
    ElMessage.error('请填写正确的 11 位手机号码')
    return
  }
  if (!phoneForm.value.code) {
    ElMessage.error('请填写验证码')
    return
  }
  if (phoneForm.value.code !== currentGeneratedSmsCode.value) {
    ElMessage.error('验证码错误，请重新输入')
    addLog('sms', `短信安全校验失败！用户输入的验证码 ${phoneForm.value.code} 与短信网关下发的值不一致。`)
    return
  }

  // Update phone
  const success = mockStore.updateUserPhone(currentUserId.value, phoneForm.value.newPhone)
  if (success) {
    ElMessage.success('手机号绑定关系更新成功！')
    addLog('database', `【手机换绑】数据库写入成功！用户 '${currentUser.value?.nickname}' 绑定手机号已变更为 '${phoneForm.value.newPhone}'`)
    
    // Clear forms and reset cooldown
    phoneForm.value.newPhone = ''
    phoneForm.value.code = ''
    currentGeneratedSmsCode.value = ''
    clearInterval(smsTimer)
    smsCooldown.value = 0
    
    // Go to feed
    activeScreen.value = 'feed'
  } else {
    ElMessage.error('换绑操作失败')
  }
}

// Media upload selection simulate
const selectMockImageGroup = () => {
  addLog('system', `管理员点击模拟“上传媒体图片”槽位`)
  
  // Preloaded mock image urls
  const preloadedImages = [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1589367920969-ab8e050bbb0e?w=600&auto=format&fit=crop&q=80'
  ]
  
  publishForm.value.images = [...preloadedImages]
  addLog('system', `模拟成功上传 ${preloadedImages.length} 张探店面包烘焙图到缓存中（已填充预置图，可随时一键清除）`)
  ElMessage.success('成功模拟注入 4 张探店配图！')
}

const toggleLocationSelect = () => {
  showLocationList.value = !showLocationList.value
}

const selectLocation = (loc: string) => {
  publishForm.value.location = loc
  showLocationList.value = false
  addLog('system', `定位选择为: ${loc}`)
}

const submitPublishPost = () => {
  if (currentUser.value?.status === 'banned') {
    ElMessage.error('当前账号已被禁用，无法发布动态')
    return
  }
  if (!publishForm.value.content) {
    ElMessage.error('请填写动态正文内容')
    return
  }

  // Format content with location if chosen
  let finalContent = publishForm.value.content
  if (publishForm.value.location) {
    finalContent += ` [发布于 ${publishForm.value.location}]`
  }

  const payload = {
    user_id: currentUserId.value,
    nickname: currentUser.value?.nickname || '未知用户',
    avatar: currentUser.value?.avatar || '',
    content: finalContent,
    images: publishForm.value.images
  }

  const newPost = mockStore.addPost(payload)
  if (newPost) {
    ElMessage.success('动态发布成功！')
    addLog('database', `【发布内容】成功生成内容ID '${newPost.post_id}'！发布人 '${payload.nickname}'，位置: '${publishForm.value.location}'`)
    
    // Clear form
    publishForm.value.content = ''
    publishForm.value.images = []
    
    // Switch to feed list
    activeScreen.value = 'feed'
  } else {
    ElMessage.error('发布失败')
  }
}

// Post detailed screen
const viewPostDetail = (post_id: string) => {
  detailPostId.value = post_id
  activeScreen.value = 'detail'
  addLog('system', `打开动态 ID: 【${post_id}】 详情及评论流看板`)
}

const goBackToFeed = () => {
  activeScreen.value = 'feed'
  addLog('system', `手机端操作主键返回“动态广场”主页`)
}

const formatTimeFriendly = (timeStr: string) => {
  if (!timeStr) return ''
  const t = new Date(timeStr.replace(' ', 'T'))
  const now = new Date()
  const diff = now.getTime() - t.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return timeStr.substring(5, 16)
}

// Likes/Shares metrics mutate
const likePost = (post_id: string) => {
  if (currentUser.value?.status === 'banned') {
    ElMessage.error('当前账号已被禁用')
    return
  }
  const success = mockStore.incrementLikes(post_id)
  if (success) {
    const post = mockStore.getPostById(post_id)
    addLog('database', `【互动点赞】动态 '${post_id}' 获得赞！累计获赞数变更为: ${post?.likes}`)
  }
}

const sharePost = (post_id: string) => {
  if (currentUser.value?.status === 'banned') {
    ElMessage.error('当前账号已被禁用')
    return
  }
  const success = mockStore.incrementShares(post_id)
  if (success) {
    const post = mockStore.getPostById(post_id)
    addLog('database', `【互动分享】动态 '${post_id}' 被成功转发！累计分享数变更为: ${post?.shares}`)
    ElMessage.success('动态转发分享成功！')
  }
}

// Add comment to post
const submitAddComment = () => {
  if (currentUser.value?.status === 'banned') {
    ElMessage.error('当前账号已被禁用，评论发表失败')
    return
  }
  if (!commentInput.value.trim()) {
    ElMessage.warning('评论正文不能为空')
    return
  }

  const payload = {
    post_id: detailPostId.value,
    user_id: currentUserId.value,
    nickname: currentUser.value?.nickname || '游客',
    avatar: currentUser.value?.avatar || '',
    content: commentInput.value.trim()
  }

  const newComment = mockStore.addComment(payload)
  if (newComment) {
    addLog('database', `【评论舆情】新增评论ID '${newComment.comment_id}'！评论人 '${payload.nickname}' 评论动态 '${payload.post_id}'`)
    
    // Clear input
    commentInput.value = ''
    
    // Scroll comments list
    nextTick(() => {
      scrollToBottom()
    })
  } else {
    ElMessage.error('评论发表失败')
  }
}

// Logger helpers
const addLog = (type: 'system' | 'auth' | 'database' | 'sms', text: string) => {
  const now = new Date()
  const time = now.toTimeString().substring(0, 8)
  logs.value.push({ time, type, text })
  
  // Keep last 40 lines
  if (logs.value.length > 40) {
    logs.value.shift()
  }

  // Scroll terminal
  nextTick(() => {
    if (logTerminal.value) {
      logTerminal.value.scrollTop = logTerminal.value.scrollHeight
    }
  })
}

const scrollToBottom = () => {
  const container = document.querySelector('.phone-content-body')
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// Start simulated clock
const startClock = () => {
  const updateTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const mins = String(now.getMinutes()).padStart(2, '0')
    currentPhoneTime.value = `${hours}:${mins}`
  }
  updateTime()
  timeIntervalId = setInterval(updateTime, 30000)
}

onMounted(() => {
  startClock()
  
  // Pre-load default logs
  addLog('system', '即闪 App 手机前台交互仿真器启动成功。')
  addLog('auth', `已加载操作用户角色：【${currentUser.value?.nickname}】 (ID: ${currentUserId.value})`)
  addLog('system', '各板块状态监听器已全部就绪，正在准备拦截并同步操作数据...')
})

onUnmounted(() => {
  clearInterval(timeIntervalId)
  clearInterval(smsTimer)
})
</script>

<style scoped>
.simulator-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.header-action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  flex-wrap: wrap;
  gap: 15px;
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

.impersonate-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.impersonate-box .label-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-regular);
}

/* Dual Column Layout */
.workspace-grid {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 992px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

.column-title {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
  font-size: 14px;
  color: var(--text-regular);
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: #f8fafc;
}

/* Virtual Phone Mockup Styling */
.phone-viewport-column {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  background-color: white;
}

.viewport-box {
  padding: 30px 10px;
  background-color: #e2e8f0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.iphone-mockup {
  width: 360px;
  height: 640px;
  border-radius: 40px;
  background-color: #f8fafc;
  border: 12px solid #0f172a; /* iOS thick bezel */
  box-shadow: var(--shadow-lg), 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition: all 0.3s ease;
}

.iphone-mockup.phone-banned {
  border-color: #7f1d1d;
}

/* Notch speaker */
.iphone-notch {
  width: 140px;
  height: 18px;
  background-color: #0f172a;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: 0;
  z-index: 1000;
}

.phone-status-bar {
  height: 30px;
  padding: 0 24px;
  background-color: #f8fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  font-weight: 600;
  color: #1e293b;
  z-index: 100;
}

.status-right-icons {
  display: flex;
  align-items: center;
  gap: 6px;
}

.network-type {
  font-size: 8px;
  transform: scale(0.95);
  font-weight: bold;
}

.phone-header {
  height: 48px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-weight: 700;
  font-size: 15px;
  color: var(--text-main);
  background-color: white;
  position: relative;
}

.back-icon {
  font-size: 18px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s;
}

.back-icon:hover {
  color: var(--primary);
}

.screen-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-placeholder {
  width: 18px;
}

.phone-screen-body {
  flex-grow: 1;
  overflow: hidden;
  background-color: #f1f5f9;
  position: relative;
  display: flex;
  flex-direction: column;
}

/* Home bar at footer */
.iphone-home-bar {
  width: 120px;
  height: 5px;
  background-color: #94a3b8;
  border-radius: 3px;
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  cursor: pointer;
  z-index: 999;
  transition: background-color 0.2s;
}

.iphone-home-bar:hover {
  background-color: #475569;
}

/* Banned Cover Overlay */
.banned-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(127, 29, 29, 0.95);
  z-index: 9999;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 30px;
}

.ban-icon {
  color: #ef4444;
  margin-bottom: 20px;
}

.banned-overlay h3 {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 12px;
}

.banned-overlay p {
  font-size: 12px;
  color: #fca5a5;
  line-height: 1.6;
}

/* VIEW 1: Feed Square Screen */
.screen-feed {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 50px;
}

.tag-recommend-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background-color: white;
  border-bottom: 1px solid var(--border-color);
  overflow-x: auto;
  flex-shrink: 0;
}

.tag-recommend-bar::-webkit-scrollbar {
  display: none;
}

.tag-badge {
  background-color: #f1f5f9;
  color: #3b82f6;
  border: 1px solid #dbeafe;
  padding: 4px 10px;
  font-size: 11px;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-badge:hover {
  background-color: #3b82f6;
  color: white;
}

.tag-badge.mini {
  padding: 2px 6px;
  font-size: 10px;
}

.feed-posts-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feed-post-card {
  background-color: white;
  border-radius: 12px;
  padding: 12px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: transform 0.25s, box-shadow 0.25s;
  border: 1px solid rgba(226, 232, 240, 0.8);
}

.feed-post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.post-header-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
}

.post-meta {
  display: flex;
  flex-direction: column;
}

.post-meta .nickname {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}

.post-meta .pubtime {
  font-size: 9px;
  color: var(--text-light);
}

.feed-post-card .post-content {
  font-size: 12px;
  color: var(--text-regular);
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.post-images-grid {
  display: grid;
  gap: 4px;
  margin-bottom: 10px;
}

.post-images-grid.grid-1 { grid-template-columns: 1fr; }
.post-images-grid.grid-2 { grid-template-columns: 1fr 1fr; }
.post-images-grid.grid-3 { grid-template-columns: 1fr 1fr 1fr; }

.grid-img-item {
  aspect-ratio: 1.2;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.more-badge {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
}

.post-actions-bar {
  display: flex;
  justify-content: space-between;
  padding: 4px 10px 0 10px;
  border-top: 1px solid #f1f5f9;
}

.post-actions-bar .action-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s;
}

.post-actions-bar .action-item:hover {
  color: var(--primary);
}

.post-actions-bar .action-item .like-icon:hover {
  color: #ef4444;
}

.floating-btn {
  position: absolute;
  bottom: 30px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  z-index: 99;
  transition: transform 0.2s;
}

.floating-btn:hover {
  transform: scale(1.1);
}

/* VIEW 2: 更换绑定手机号 Screen */
.screen-phone {
  background-color: white;
  height: 100%;
  overflow-y: auto;
  padding: 24px;
}

.form-container {
  display: flex;
  flex-direction: column;
}

.form-main-heading {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 8px;
}

.form-desc-text {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 24px;
}

.current-bound-card {
  background-color: #fff7ed;
  border: 1px solid #ffedd5;
  border-radius: 12px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.current-bound-card .bound-label {
  font-size: 12px;
  color: #ea580c;
  font-weight: 600;
}

.current-bound-card .bound-number {
  font-size: 14px;
  font-weight: 700;
  color: #9a3412;
}

.simulator-inner-form :deep(.el-form-item__label) {
  font-size: 12px !important;
  font-weight: 700 !important;
  color: #334155 !important;
  padding-bottom: 4px !important;
}

.required-label :deep(.el-form-item__label)::before {
  content: '*';
  color: #ef4444;
  margin-right: 4px;
}

.sms-input-row {
  display: flex;
  gap: 8px;
  width: 100%;
}

.sim-input-sms {
  flex-grow: 1;
}

.sms-btn {
  background-color: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
  border-radius: 6px;
  padding: 0 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.sms-btn:hover:not(:disabled) {
  background-color: #cbd5e1;
}

.sim-submit-btn {
  width: 100%;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(59, 130, 246, 0.2);
  transition: background-color 0.2s;
  margin-top: 15px;
}

.sim-submit-btn:hover {
  background-color: #2563eb;
}

/* VIEW 3: 发布动态 Screen */
.screen-publish {
  background-color: white;
  height: 100%;
  overflow-y: auto;
  padding-bottom: 50px;
}

.publish-scrollable-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.publish-textarea :deep(.el-textarea__inner) {
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  font-size: 13px;
  resize: none;
}

.publish-tag-suggestions {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.media-upload-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.media-upload-section .section-label {
  display: flex;
  flex-direction: column;
}

.media-upload-section .section-label strong {
  font-size: 13px;
  color: #1e293b;
}

.media-upload-section .section-label span {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}

.upload-grid-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.upload-dash-box {
  aspect-ratio: 1;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  text-align: center;
  transition: all 0.2s;
}

.upload-dash-box:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.upload-dash-box .plus-icon {
  font-size: 18px;
  color: #64748b;
  margin-bottom: 4px;
}

.upload-dash-box .box-title {
  font-size: 9px;
  font-weight: 700;
  color: #334155;
}

.upload-dash-box .box-desc {
  font-size: 7px;
  color: #94a3b8;
  margin-top: 2px;
  transform: scale(0.95);
}

.thumb-image-item {
  aspect-ratio: 1;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  position: relative;
  border: 1px solid #e2e8f0;
}

.thumb-image-item .del-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: rgba(239, 68, 68, 0.9);
  color: white;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  cursor: pointer;
  font-weight: bold;
}

.supplement-info-section {
  display: flex;
  flex-direction: column;
  border-top: 1px solid #f1f5f9;
  padding-top: 16px;
}

.supplement-info-section .section-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

.supplement-info-section .section-header strong {
  font-size: 13px;
  color: #1e293b;
}

.supplement-info-section .section-header span {
  font-size: 10px;
  color: #64748b;
  margin-top: 2px;
}

.supp-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 4px;
  border-bottom: 1px solid #f1f5f9;
  font-size: 12px;
  cursor: pointer;
}

.supp-row .label {
  color: #475569;
  font-weight: 600;
}

.supp-row .value {
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 700;
}

.supp-row .value.select-trigger {
  color: #3b82f6;
}

.arrow-right-icon {
  font-size: 11px;
  color: #94a3b8;
}

.location-mock-list {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4px;
  border: 1px solid #e2e8f0;
}

.location-mock-list .loc-item {
  padding: 8px 12px;
  font-size: 11px;
  color: #334155;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.location-mock-list .loc-item:hover {
  background-color: #eff6ff;
  color: #3b82f6;
}

.location-mock-list .loc-item.active {
  background-color: #3b82f6;
  color: white;
  font-weight: bold;
}

.mini-sim-select :deep(.el-select__wrapper) {
  padding: 0 4px !important;
  min-height: 24px !important;
  height: 24px !important;
  font-size: 11px !important;
  box-shadow: none !important;
  border: 1px solid #cbd5e1 !important;
  border-radius: 4px !important;
}

.publish-action-box {
  margin-top: 10px;
}

/* VIEW 4: 动态详情与评论区 Screen */
.screen-detail {
  background-color: white;
  height: 100%;
  overflow: hidden;
}

.detail-scrollable-body {
  height: 100%;
  overflow-y: auto;
  padding: 16px 16px 60px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-publisher-card {
  display: flex;
  justify-content: space-between;
}

.publisher-meta-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.publisher-info {
  display: flex;
  flex-direction: column;
}

.publisher-info .row-flex {
  display: flex;
  align-items: center;
  gap: 6px;
}

.publisher-info .nickname {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
}

.publisher-info .user-label-tag {
  background-color: #fef2f2;
  color: #ef4444;
  border: 1px solid #fee2e2;
  font-size: 9px;
  padding: 0 4px;
  border-radius: 4px;
  font-weight: bold;
  transform: scale(0.9);
}

.publisher-info .pubtime-location {
  font-size: 10px;
  color: var(--text-light);
  margin-top: 2px;
}

.detail-text-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-text-content .body-text {
  font-size: 13px;
  color: #1e293b;
  line-height: 1.6;
}

.hashtags-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.hash-tag-link {
  color: #3b82f6;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
}

.detail-images-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-card-img {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid #e2e8f0;
}

.detail-el-img {
  width: 100%;
  height: 180px;
}

.image-title-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px 12px;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%);
  color: white;
  font-size: 11px;
  font-weight: 600;
}

.detail-interactive-bar {
  display: flex;
  justify-content: space-around;
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
}

.interact-box {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
}

.interact-box .icon {
  font-size: 16px;
}

.interact-box .heart-active {
  color: #ef4444;
}

.interactive-sync-banner {
  padding: 12px;
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
}

.interactive-sync-banner .banner-title {
  font-size: 12px;
  font-weight: 700;
  color: #d97706;
  margin-bottom: 4px;
}

.interactive-sync-banner .banner-text {
  font-size: 10px;
  color: #b45309;
  line-height: 1.4;
}

.detail-comments-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label-header {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  border-left: 3px solid #3b82f6;
  padding-left: 6px;
}

.section-helper-text {
  font-size: 10px;
  color: #64748b;
}

.comments-list-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.detail-comment-card {
  display: flex;
  gap: 8px;
  align-items: start;
}

.comment-msg-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex-grow: 1;
}

.comment-author-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-author-row .name {
  font-size: 11px;
  font-weight: 700;
  color: #334155;
}

.comment-author-row .time {
  font-size: 8px;
  color: #94a3b8;
}

.comment-content-text {
  font-size: 11px;
  color: #1e293b;
  line-height: 1.4;
}

.reply-target-tag {
  color: #3b82f6;
  font-weight: bold;
}

.empty-comments {
  text-align: center;
  font-size: 11px;
  color: #94a3b8;
  padding: 16px 0;
}

.detail-comment-input-bar {
  position: absolute;
  bottom: 12px;
  left: 0;
  width: 100%;
  padding: 0 12px;
  background-color: white;
  z-index: 99;
}

.comment-input-field :deep(.el-input__wrapper) {
  border-radius: 20px !important;
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
  padding: 4px 12px !important;
}

/* Right Control Panel */
.control-panel-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.panel-card {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
}

.card-content-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.shortcut-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 5px;
}

.screen-switch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.panel-divider {
  margin: 8px 0 !important;
}

.integration-tips-card {
  background-color: rgba(59, 130, 246, 0.04);
  border: 1px solid rgba(59, 130, 246, 0.1);
  padding: 15px;
  border-radius: 12px;
}

.integration-tips-card h5 {
  font-size: 12px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.integration-tips-card ul {
  padding-left: 16px;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.integration-tips-card li {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.5;
}

/* Terminal logs styling */
.terminal-card {
  flex-grow: 1;
}

.terminal-body {
  background-color: #0f172a;
  color: #38bdf8;
  padding: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}

.log-line {
  line-height: 1.5;
}

.log-time {
  color: #64748b;
  margin-right: 6px;
}

.log-badge {
  font-weight: bold;
  margin-right: 6px;
}

.log-line.system {
  color: #38bdf8;
}

.log-line.system .log-badge { color: #0284c7; }

.log-line.auth {
  color: #e2e8f0;
}

.log-line.auth .log-badge { color: #94a3b8; }

.log-line.database {
  color: #4ade80;
}

.log-line.database .log-badge { color: #16a34a; }

.log-line.sms {
  color: #fbbf24;
}

.log-line.sms .log-badge { color: #d97706; }
</style>
