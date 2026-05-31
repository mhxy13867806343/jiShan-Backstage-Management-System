import { defineStore } from 'pinia'
import { ref } from 'vue'

export type AdminRole = 'superadmin' | 'admin' | 'operator' | 'viewer'

export interface AdminPermission {
  key: string
  label: string
}

export interface AdminAccount {
  account_id: string
  username: string
  nickname: string
  avatar: string
  role: AdminRole
  permissions: string[]
  status: 'active' | 'disabled'
  email: string
  phone: string
  createTime: string
  lastLogin: string
  remark: string
}

export interface UserItem {
  user_id: string
  nickname: string
  avatar: string
  phone: string
  newPhone?: string
  status: 'normal' | 'banned'
  regTime: string
  postCount: number
  commentCount: number
  likesReceived: number
  bio: string
}

export interface DictItem {
  value: string
  label: string
  dictCode?: number
  dictSort?: number
  status?: '0' | '1' // '0' for normal, '1' for disabled
  remark?: string
  createTime?: string
  children?: DictItem[]
}

export interface MessageItem {
  message_id: string
  title: string
  type: 'notification' | 'announcement' | 'alert' | 'antifraud'
  content: string
  target: 'all' | 'active' | 'new'
  status: '0' | '1' // '0' for draft, '1' for sent
  pubTime: string
}

export interface PostItem {
  post_id: string
  user_id: string
  nickname: string
  avatar: string
  content: string
  images: string[]
  likes: number
  comments: number
  shares: number
  status: 'online' | 'offline'
  pubTime: string
}

export interface CommentItem {
  comment_id: string
  post_id: string
  user_id: string
  nickname: string
  avatar: string
  content: string
  parent_id: string | null
  reply_to_user_id: string | null
  reply_to_nickname: string | null
  pubTime: string
}

export interface AnnItem {
  id: string
  title: string
  type: 'info' | 'warning' | 'danger'
  content: string
  link: string
  pinned: boolean
  startTime: string
  endTime: string
  status: 'active' | 'inactive'
}

export interface VersionItem {
  id: string
  platform: 'iOS' | 'Android' | 'HarmonyOS'
  version: string
  build: string
  forceUpdate: boolean
  status: 'released' | 'beta' | 'deprecated'
  betaPct: number
  notes: string
  notesType: 'text' | 'rich'
  downloadUrl: string
  releaseTime: string
}

export const useMockDataStore = defineStore('mockData', () => {
  // Initialize mock messages
  const messages = ref<MessageItem[]>([
    {
      message_id: '90001',
      title: '即闪 App 互助版块服务协议升级公告',
      type: 'announcement',
      content: '尊敬的用户，我们于今日升级了即闪互助版块的服务条款，进一步保障了广大用户的合法权益。详情请点击查阅最新版服务协议。',
      target: 'all',
      status: '1',
      pubTime: '2026-05-28 10:00:00'
    },
    {
      message_id: '90002',
      title: '关于防范网络“虚假刷单”诈骗的安全预警',
      type: 'antifraud',
      content: '近期网络中刷单兼职类诈骗频繁出现，平台郑重提醒：任何要求先行垫付资金的兼职刷单均属于违法诈骗行为，请广大用户提高警惕，切勿上当受骗！',
      target: 'all',
      status: '1',
      pubTime: '2026-05-29 14:30:00'
    },
    {
      message_id: '90003',
      title: '新用户注册福利与安全提示',
      type: 'notification',
      content: '欢迎来到即闪平台！我们致力于打造最纯粹的同城互助社交体验。请注意保管好您的个人账户安全，防范一切可疑的资金要求。',
      target: 'new',
      status: '1',
      pubTime: '2026-05-30 09:00:00'
    }
  ])

  // Initialize mock announcements
  const announcements = ref<AnnItem[]>([
    {
      id: 'N001',
      title: '【系统通知】即闪 App 6 月服务升级公告',
      type: 'info',
      content: '<p>我们将于 <strong>2026-06-01 凌晨 2:00-4:00</strong> 进行服务器维护升级，届时部分功能短暂不可用。</p>',
      link: '',
      pinned: true,
      startTime: '2026-05-31 00:00',
      endTime: '2026-06-02 00:00',
      status: 'active',
    },
    {
      id: 'N002',
      title: '【安全提醒】谨防虚假刷单诈骗',
      type: 'warning',
      content: '<p>近期出现冒充即闪平台的<strong>虚假刷单诈骗</strong>，请勿相信任何要求充值的信息，注意保护财产安全。</p>',
      link: 'https://jishanapp.com/safety',
      pinned: false,
      startTime: '2026-05-20 10:00',
      endTime: '',
      status: 'active',
    },
    {
      id: 'N003',
      title: '五一假期活动公告',
      type: 'info',
      content: '<p>五一假期即闪将开展特别活动，参与活动可获得<em>专属徽章</em>，欢迎积极参与！</p>',
      link: '',
      pinned: false,
      startTime: '2026-04-28 00:00',
      endTime: '2026-05-06 23:59',
      status: 'inactive',
    },
    {
      id: 'N004',
      title: '即闪 App 社交版块上线庆典',
      type: 'info',
      content: '<p>庆祝即闪 App 社区功能上线，发布动态即可瓜分<strong>万元话费红包</strong>，快来参与吧！</p>',
      link: '',
      pinned: false,
      startTime: '2026-05-15 09:00',
      endTime: '2026-06-15 00:00',
      status: 'active',
    },
    {
      id: 'N005',
      title: '【重要声明】防范网络理财诈骗风险',
      type: 'danger',
      content: '<p>即闪平台从未设立任何“投资群” or “代客理财”服务。请广大用户提高警惕，切勿向陌生账户转账。</p>',
      link: '',
      pinned: false,
      startTime: '2026-05-10 08:00',
      endTime: '',
      status: 'active',
    },
    {
      id: 'N006',
      title: '微信支付通道临时维护公告',
      type: 'warning',
      content: '<p>微信支付将于 <strong>2026-05-05 03:00-03:30</strong> 进行系统维护，期间微信支付功能可能出现短暂波动，建议使用支付宝付款。</p>',
      link: '',
      pinned: false,
      startTime: '2026-05-04 12:00',
      endTime: '2026-05-05 04:00',
      status: 'inactive',
    }
  ])

  // Initialize mock versions
  const versions = ref<VersionItem[]>([
    { id: 'V001', platform: 'iOS',       version: '2.3.1', build: '231010', forceUpdate: false, status: 'released',    betaPct: 0,  notes: '修复若干已知问题，优化启动速度，提升稳定性。', notesType: 'text', downloadUrl: 'https://apps.apple.com/jishan', releaseTime: '2026-05-28 10:00' },
    { id: 'V002', platform: 'Android',   version: '2.3.1', build: '231008', forceUpdate: false, status: 'released',    betaPct: 0,  notes: '修复若干已知问题，优化启动速度，提升稳定性。', notesType: 'text', downloadUrl: 'https://play.google.com/jishan', releaseTime: '2026-05-28 10:00' },
    { id: 'V003', platform: 'HarmonyOS', version: '2.3.1', build: '231009', forceUpdate: false, status: 'released',    betaPct: 0,  notes: '鸿蒙专版首发，深度适配鸿蒙原生特性，带来更丝滑的基础体验和高效省电运行。', notesType: 'text', downloadUrl: 'https://appgallery.huawei.com/jishan', releaseTime: '2026-05-28 10:00' },
    { id: 'V004', platform: 'iOS',       version: '2.4.0', build: '240001', forceUpdate: true,  status: 'beta',        betaPct: 20, notes: '<p>新增话题圈功能，全新消息通知体系，性能大幅提升。</p><ul><li>全新设计的<strong>社区话题圈</strong>，支持发布图文话题；</li><li>底层网络请求及图片加载组件升级，启动加载提速 <strong>40%</strong>；</li><li>修复了部分情况下消息通知延迟到达的问题。</li></ul>', notesType: 'rich', downloadUrl: '', releaseTime: '2026-05-30 14:00' },
    { id: 'V005', platform: 'Android',   version: '2.4.0', build: '240001', forceUpdate: true,  status: 'beta',        betaPct: 10, notes: '<p>新增话题圈功能，全新消息通知体系，性能大幅提升。</p><ul><li>全新设计的<strong>社区话题圈</strong>，支持发布图文话题；</li><li>底层网络请求及图片加载组件升级，启动加载提速 <strong>40%</strong>；</li><li>修复了部分情况下消息通知延迟到达的问题。</li></ul>', notesType: 'rich', downloadUrl: '', releaseTime: '2026-05-30 14:00' },
    { id: 'V006', platform: 'HarmonyOS', version: '2.4.0', build: '240002', forceUpdate: true,  status: 'beta',        betaPct: 15, notes: '<p>新增话题圈功能，全新消息通知体系，性能大幅提升。</p><ul><li>全新设计的<strong>社区话题圈</strong>，支持发布图文话题；</li><li>底层网络请求及图片加载组件升级，启动加载提速 <strong>40%</strong>；</li><li>修复了部分情况下消息通知延迟到达的问题。</li></ul>', notesType: 'rich', downloadUrl: '', releaseTime: '2026-05-30 14:00' },
    { id: 'V007', platform: 'iOS',       version: '2.2.0', build: '220015', forceUpdate: false, status: 'deprecated',  betaPct: 0,  notes: '早期版本，已停止支持。', notesType: 'text', downloadUrl: '', releaseTime: '2026-03-15 09:00' },
    { id: 'V008', platform: 'Android',   version: '2.2.0', build: '220016', forceUpdate: false, status: 'deprecated',  betaPct: 0,  notes: '早期安卓版本，已下架。', notesType: 'text', downloadUrl: '', releaseTime: '2026-03-15 09:00' },
    { id: 'V009', platform: 'HarmonyOS', version: '2.2.0', build: '220017', forceUpdate: false, status: 'deprecated',  betaPct: 0,  notes: '早期鸿蒙尝鲜版，已完成历史使命下线。', notesType: 'text', downloadUrl: '', releaseTime: '2026-03-15 09:00' }
  ])

  // Initialize mock users
  const users = ref<UserItem[]>([
    {
      user_id: '10001',
      nickname: '极光漫步者',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '13812345678',
      newPhone: '13912345678',
      status: 'normal',
      regTime: '2026-01-15 10:23:45',
      postCount: 12,
      commentCount: 45,
      likesReceived: 382,
      bio: '热爱摄影，探索未知的旅行者。极光与星空是我的终极追求。'
    },
    {
      user_id: '10002',
      nickname: '赛博极客',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '13987654321',
      status: 'normal',
      regTime: '2026-02-01 14:12:00',
      postCount: 24,
      commentCount: 189,
      likesReceived: 1205,
      bio: '代码即艺术，科技改变世界。专注于Vue3与AI应用研究。'
    },
    {
      user_id: '10003',
      nickname: '元气少女陈陈',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      phone: '13566778899',
      status: 'normal',
      regTime: '2026-02-18 09:30:15',
      postCount: 8,
      commentCount: 32,
      likesReceived: 145,
      bio: '今天也是元气满满的一天！喜欢分享美食、猫咪和日常穿搭~'
    },
    {
      user_id: '10004',
      nickname: '孤独的牧羊人',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      phone: '18655443322',
      status: 'banned',
      regTime: '2026-03-05 18:45:30',
      postCount: 3,
      commentCount: 8,
      likesReceived: 12,
      bio: '远方除了遥远一无所有，而我依然在坚守着内心的宁静。'
    },
    {
      user_id: '10005',
      nickname: '风居住的街道',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      phone: '18999887766',
      status: 'normal',
      regTime: '2026-03-20 22:15:00',
      postCount: 15,
      commentCount: 67,
      likesReceived: 490,
      bio: '钢琴与微风，生活需要慢下来去聆听和感受。'
    },
    {
      user_id: '10006',
      nickname: '山川湖海皆是歌',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      phone: '13611223344',
      status: 'normal',
      regTime: '2026-04-02 08:10:20',
      postCount: 42,
      commentCount: 322,
      likesReceived: 2890,
      bio: '脚踏实地，心向远方。一个在路上的户外运动发烧友。'
    },
    {
      user_id: '10007',
      nickname: '深夜食堂掌柜',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      phone: '17766554433',
      status: 'normal',
      regTime: '2026-04-15 11:55:10',
      postCount: 19,
      commentCount: 88,
      likesReceived: 760,
      bio: '用美食治愈灵魂，每一道菜背后都有一个温情的故事。'
    },
    {
      user_id: '10008',
      nickname: '浮生若梦',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      phone: '15011223344',
      status: 'normal',
      regTime: '2026-05-01 16:40:00',
      postCount: 5,
      commentCount: 15,
      likesReceived: 38,
      bio: '大梦谁先觉，平生我自知。随缘记录生活点滴。'
    },
    {
      user_id: '10009',
      nickname: '阿岛',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      phone: '13811228000',
      status: 'normal',
      regTime: '2026-05-10 14:20:00',
      postCount: 15,
      commentCount: 96,
      likesReceived: 1890,
      bio: '寻味人间，热爱美食与生活记录。分享最真实的城市探店日常。'
    }
  ])

  // Initialize mock posts
  const posts = ref<PostItem[]>([
    {
      post_id: '20001',
      user_id: '10001',
      nickname: '极光漫步者',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: '昨晚在冰岛北部拍到的极光爆发！漫天飞舞的绿色光带犹如大自然的魔术，美到令人屏息。那一刻觉得所有的等待和严寒都是值得的。🌌✨ #冰岛极光 #旅行摄影 #自然之美',
      images: [
        'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80'
      ],
      likes: 245,
      comments: 38,
      shares: 64,
      status: 'online',
      pubTime: '2026-05-20 23:10:00'
    },
    {
      post_id: '20002',
      user_id: '10002',
      nickname: '赛博极客',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: '今天完成了即闪后台管理系统的第一版原型搭建！Vue3 + Vite + Element Plus + Pinia + TS 的组合简直是神级开发体验，顺滑高效。下一步准备接入 Mock 网络拦截和视觉优化。💻🚀 #Vue3 #前端开发 #即闪系统',
      images: [
        'https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?w=600&auto=format&fit=crop&q=80'
      ],
      likes: 128,
      comments: 15,
      shares: 8,
      status: 'online',
      pubTime: '2026-05-25 10:30:00'
    },
    {
      post_id: '20003',
      user_id: '10003',
      nickname: '元气少女陈陈',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: '打卡这家超治愈的日系猫咪咖啡馆！这里的猫猫真的太粘人啦，抱着就不想松手，奶茶也很好喝，简直是周末放松圣地~ 🐱🍵 推荐大家有空都来试试！',
      images: [
        'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1472214222541-d510753a4907?w=600&auto=format&fit=crop&q=80'
      ],
      likes: 88,
      comments: 24,
      shares: 12,
      status: 'online',
      pubTime: '2026-05-24 15:45:00'
    },
    {
      post_id: '20004',
      user_id: '10004',
      nickname: '孤独的牧羊人',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      content: '这条内容由于含有不合规敏感词汇或被用户频繁举报，已由管理员进行下架操作。这里是之前的备份：有些事情本不需要多做解释，时间会证明一切。',
      images: [],
      likes: 2,
      comments: 4,
      shares: 0,
      status: 'offline',
      pubTime: '2026-05-02 08:00:00'
    },
    {
      post_id: '20005',
      user_id: '10005',
      nickname: '风居住的街道',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      content: '清晨的公园，伴着钢琴曲《风居住的街道》，空气中弥漫着淡淡的花草芬芳。生活有时候其实很简单，停下脚步看一片叶子落下，听一首歌，就是最美的温柔。🌿🎹',
      images: [],
      likes: 56,
      comments: 9,
      shares: 11,
      status: 'online',
      pubTime: '2026-05-23 07:15:00'
    },
    {
      post_id: '20006',
      user_id: '10006',
      nickname: '山川湖海皆是歌',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      content: '成功登顶海拔 5396 度的哈巴雪山！当站在顶峰俯瞰四周那浩瀚云海、金灿灿的雪线时，那种自豪和敬畏感真的无法用言语形容。山就在那里，而我们战胜了自己！🏔️🧗‍♂️',
      images: [
        'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&auto=format&fit=crop&q=80'
      ],
      likes: 512,
      comments: 86,
      shares: 124,
      status: 'online',
      pubTime: '2026-05-21 12:00:00'
    },
    {
      post_id: '20007',
      user_id: '10007',
      nickname: '深夜食堂掌柜',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      content: '今夜雨，适合来一碗暖烘烘的豚骨拉面。慢熬十个小时的浓郁汤底，配上肥而不腻的叉烧肉和一口爆浆的温泉蛋。愿每一个深夜归家的行路人，都能在这里找到一丝温暖的慰藉。🍜🏮',
      images: [],
      likes: 195,
      comments: 33,
      shares: 45,
      status: 'online',
      pubTime: '2026-05-26 21:30:00'
    },
    {
      post_id: '20008',
      user_id: '10009',
      nickname: '阿岛',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      content: '新开的一家面包店真的很能打，黄油碱水和开心果可颂都在线。已经替你们试过了，不踩雷，周末想去拍照打卡的可以直接收藏。#探店 #面包脑袋 #周末去哪',
      images: [
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1589367920969-ab8e050bbb0e?w=600&auto=format&fit=crop&q=80'
      ],
      likes: 356,
      comments: 67,
      shares: 45,
      status: 'online',
      pubTime: '2026-05-30 07:15:00'
    }
  ])

  // Initialize mock comments
  const comments = ref<CommentItem[]>([
    {
      comment_id: '30001',
      post_id: '20001',
      user_id: '10002',
      nickname: '赛博极客',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: '这构图和色彩真的太绝了！请问是用什么相机和参数拍的？求分享！🙌',
      parent_id: null,
      reply_to_user_id: null,
      reply_to_nickname: null,
      pubTime: '2026-05-20 23:15:22'
    },
    {
      comment_id: '30002',
      post_id: '20001',
      user_id: '10001',
      nickname: '极光漫步者',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      content: '谢谢夸奖！是用索尼A7R5，20mm F1.8镜头拍的。参数大概是ISO 1600, F1.8, 曝光4秒左右，稍微拉了一点暗部细节。',
      parent_id: '30001',
      reply_to_user_id: '10002',
      reply_to_nickname: '赛博极客',
      pubTime: '2026-05-20 23:25:40'
    },
    {
      comment_id: '30003',
      post_id: '20001',
      user_id: '10003',
      nickname: '元气少女陈陈',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: '哇塞！真的美到哭！我这辈子也一定要去一次冰岛看极光！😭✨',
      parent_id: null,
      reply_to_user_id: null,
      reply_to_nickname: null,
      pubTime: '2026-05-21 00:02:11'
    },
    {
      comment_id: '30004',
      post_id: '20002',
      user_id: '10005',
      nickname: '风居住的街道',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      content: '感觉好厉害啊！支持博主，做出来的管理系统界面一定非常精致好用。',
      parent_id: null,
      reply_to_user_id: null,
      reply_to_nickname: null,
      pubTime: '2026-05-25 10:45:00'
    },
    {
      comment_id: '30005',
      post_id: '20003',
      user_id: '10007',
      nickname: '深夜食堂掌柜',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      content: '那只橘猫长得圆滚滚的，真的太可爱了，周末我也想去撸猫！',
      parent_id: null,
      reply_to_user_id: null,
      reply_to_nickname: null,
      pubTime: '2026-05-24 16:10:00'
    },
    {
      comment_id: '30006',
      post_id: '20006',
      user_id: '10002',
      nickname: '赛博极客',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      content: '太强了！攀登雪山需要极强的意志力和专业素养，给大佬点赞！👍🏔️',
      parent_id: null,
      reply_to_user_id: null,
      reply_to_nickname: null,
      pubTime: '2026-05-21 12:30:15'
    },
    {
      comment_id: '30007',
      post_id: '20007',
      user_id: '10003',
      nickname: '元气少女陈陈',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: '大半夜看饿了！老板，你们店在哪里呀？我想去吃宵夜！🤤😭',
      parent_id: null,
      reply_to_user_id: null,
      reply_to_nickname: null,
      pubTime: '2026-05-26 21:45:10'
    },
    {
      comment_id: '30008',
      post_id: '20007',
      user_id: '10007',
      nickname: '深夜食堂掌柜',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      content: '在南城区即闪街88号，欢迎随时光临，报你的ID送一份手工小玉子烧哦！',
      parent_id: '30007',
      reply_to_user_id: '10003',
      reply_to_nickname: '元气少女陈陈',
      pubTime: '2026-05-26 22:00:33'
    },
    {
      comment_id: '30009',
      post_id: '20008',
      user_id: '10003',
      nickname: '元气少女陈陈',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      content: '这家面包店看起来好日系好温暖，可颂看起来太诱人了！周末必须去拔草！',
      parent_id: null,
      reply_to_user_id: null,
      reply_to_nickname: null,
      pubTime: '2026-05-30 07:45:00'
    },
    {
      comment_id: '30010',
      post_id: '20008',
      user_id: '10009',
      nickname: '阿岛',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      content: '开心果可颂真的是必点，而且他们家咖啡也很不赖，去的时候尽量选上午，下午人会有点多。',
      parent_id: '30009',
      reply_to_user_id: '10003',
      reply_to_nickname: '元气少女陈陈',
      pubTime: '2026-05-30 08:00:00'
    }
  ])

  // Initialize mock agreement contents
  const agreements = ref({
    privacy: `<h2>即闪后台管理系统隐私权政策</h2>
<p>更新日期：2026年5月27日</p>
<p>生效日期：2026年5月27日</p>
<p>即闪后台管理系统（以下简称“我们”）非常重视用户的隐私和个人信息保护。您在使用我们的产品与/或服务时，我们可能会收集和使用您的相关信息。我们希望通过本《隐私政策》向您说明，在使用我们的服务时，我们如何收集、使用、储存和分享这些信息，以及我们为您提供的访问、更新、控制和保护这些信息的方式。</p>
<h3>一、我们收集的信息</h3>
<p>在您使用本后台管理系统的过程中，为了向您提供核心管理服务并保障您的账户安全，我们会收集您在登录、操作、授权时主动提供或系统自动记录的信息：</p>
<ul>
  <li><b>身份认证信息：</b>为了登录管理账户，您需要提供合法的管理员账号、密码及登录令牌（Token）。</li>
  <li><b>系统操作日志：</b>系统会自动记录管理员在后台的操作轨迹，包括登录时间、IP地址、操作模块（用户管理、内容上下架、协议修改等）、修改记录等，用于安全审计与合规追溯。</li>
  <li><b>业务数据：</b>为了行使内容审查、用户封禁等管理权能，系统会读取并展示前端用户的头像、昵称、手机号、注册时间、发布的内容与评论。</li>
</ul>
<h3>二、我们如何使用收集的信息</h3>
<p>我们严格遵守法律法规的规定及与用户的约定，将收集的信息用于以下用途：</p>
<ol>
  <li>验证管理员的身份，防止未经授权的访问。</li>
  <li>为平台提供日常运营监管、违规行为处置（如违规内容下架、违规账号封禁）。</li>
  <li>记录审计日志，保障系统安全，防止恶意入侵和非法数据篡改。</li>
</ol>
<h3>三、信息的存储与安全保障</h3>
<p>我们采用业界领先的安全防护措施来保护您的个人信息，防止信息遭到未经授权的访问、披露、使用、修改、损坏或流失。我们使用加密技术确保数据的机密性；使用受信赖的保护机制防止数据遭到恶意攻击；部署访问控制机制，确保只有授权人员才能访问敏感信息。</p>
<p>如您对本隐私政策有任何疑问、意见或建议，请通过系统后台的联络邮箱与我们的技术安全团队取得联系。</p>`,
    
    user: `<h2>即闪后台管理系统服务协议</h2>
<p>更新日期：2026年5月27日</p>
<p>生效日期：2026年5月27日</p>
<p>欢迎您使用即闪后台管理系统！</p>
<p>在您使用即闪后台管理系统（以下简称“本系统”）服务之前，请务必仔细阅读、充分理解本《服务协议》（以下简称“本协议”）的各项条款，特别是免除或者限制责任的条款、法律适用和争议解决条款。当您按照登录页面提示输入账号、密码并成功进入系统，即表示您已充分阅读、理解并接受本协议的全部内容，本协议即构成对双方有约束力的法律文件。</p>
<h3>一、账户注册与管理安全</h3>
<p>1. 本系统主要供即闪平台的运营管理人员、内容审核人员及技术支持人员内部使用。系统管理员账号由平台运营方统一分配与授权。</p>
<p>2. 管理员应妥善保管自己的账号和密码，不得将账号转让、出借或告知他人。因管理员保管不善或操作失误导致账号被非法使用或数据泄露的，相关后果及法律责任由该管理员自行承担。</p>
<p>3. 若发现账号遭遇未经授权的访问或存在安全隐患，管理员应立即通知系统运营团队，以便采取冻结账号等应急措施。</p>
<h3>二、管理员行为规范</h3>
<p>管理员在使用本系统进行运营管理时，应严格遵守国家法律法规及平台运营规则，不得有以下行为：</p>
<ul>
  <li>利用本系统权限，非法篡改、删除合法的用户数据或系统配置。</li>
  <li>泄露前端用户的隐私数据（如手机号、IP地址、发布记录等）至外部渠道。</li>
  <li>恶意封禁正常使用的用户，或无故下架合规的优质内容，干扰平台秩序。</li>
  <li>利用系统漏洞进行非法牟利或数据爬取。</li>
</ul>
<h3>三、违约责任与免责声明</h3>
<p>1. 如果管理员违反本协议的任何条款，平台有权根据违规情节的严重程度，采取警告、限制系统操作权限、封锁系统账户、直至解除劳动关系或追究其法律责任等处罚措施。</p>
<p>2. 在法律允许的范围内，本系统按“现状”和“可获得性”状态提供。由于断电、网络黑客攻击、不可抗力、服务器维护等原因导致系统临时无法访问、数据丢失或延迟的，运营方不承担由此引起的任何直接或间接损失。</p>
<p>本协议的成立、生效、履行、解释及争议解决均适用中华人民共和国法律。若发生任何争议，双方应首先友好协商解决；协商不成的，应提交平台运营方所在地有管辖权的人民法院诉讼解决。</p>`
  })

  // System Configurations
  const tags = ref<string[]>([
    '夜市',
    '同城发现',
    'citywalk',
    '探店',
    '面包脑袋',
    '周末去哪',
    '美食收集'
  ])

  const regions = ref<string[]>([
    '杭州·滨江天街',
    '广州·天河',
    '上海·静安寺',
    '北京·三里屯',
    '深圳·万象天地'
  ])

  const dicts = ref<Record<string, DictItem[]>>({
    user_status: [
      { 
        value: 'normal', 
        label: '正常', 
        dictCode: 1, 
        dictSort: 1, 
        status: '0', 
        remark: '用户正常状态账号', 
        createTime: '2025-05-26 11:04:08',
        children: [
          { value: 'normal_active', label: '活跃用户', dictCode: 11, dictSort: 1, status: '0', remark: '账号正常且近期活跃', createTime: '2025-05-26 11:04:08' },
          { value: 'normal_silent', label: '静默用户', dictCode: 12, dictSort: 2, status: '0', remark: '账号正常但长期静默', createTime: '2025-05-26 11:04:08' }
        ]
      },
      { 
        value: 'banned', 
        label: '已禁用', 
        dictCode: 2, 
        dictSort: 2, 
        status: '0', 
        remark: '被管理员禁用的限制账号', 
        createTime: '2025-05-26 11:04:08',
        children: [
          { value: 'banned_temp', label: '临时封禁', dictCode: 21, dictSort: 1, status: '0', remark: '违规警告临时限流封禁', createTime: '2025-05-26 11:04:08' },
          { value: 'banned_forever', label: '永久封禁', dictCode: 22, dictSort: 2, status: '0', remark: '严重违规永久限制登入', createTime: '2025-05-26 11:04:08' }
        ]
      }
    ],
    post_status: [
      { 
        value: 'online', 
        label: '已上架', 
        dictCode: 3, 
        dictSort: 1, 
        status: '0', 
        remark: '审核通过且上架展示的动态', 
        createTime: '2025-05-26 11:04:08',
        children: [
          { value: 'online_featured', label: '精选动态', dictCode: 31, dictSort: 1, status: '0', remark: '获得官方推荐的优质动态', createTime: '2025-05-26 11:04:08' },
          { value: 'online_normal', label: '普通动态', dictCode: 32, dictSort: 2, status: '0', remark: '正常流分发的动态', createTime: '2025-05-26 11:04:08' }
        ]
      },
      { value: 'offline', label: '已下架', dictCode: 4, dictSort: 2, status: '0', remark: '违规下架或归档不予展示的动态', createTime: '2025-05-26 11:04:08' }
    ],
    post_visibility: [
      { value: 'public', label: '公开', dictCode: 5, dictSort: 1, status: '0', remark: '广场所有网民以及游客均可见', createTime: '2025-05-26 11:04:08' },
      { value: 'private', label: '私密', dictCode: 6, dictSort: 2, status: '0', remark: '仅发布者本人在其个人中心可见', createTime: '2025-05-26 11:04:08' }
    ]
  })

  // --- ACTIONS ---

  // 1. User Management Actions
  const getUsers = (params: { nickname?: string; phone?: string; user_id?: string; status?: string; page?: number; limit?: number }) => {
    let result = [...users.value]

    if (params.nickname) {
      result = result.filter(u => u.nickname.includes(params.nickname!))
    }
    if (params.phone) {
      result = result.filter(u => u.phone.includes(params.phone!))
    }
    if (params.user_id) {
      result = result.filter(u => u.user_id === params.user_id)
    }
    if (params.status) {
      result = result.filter(u => u.status === params.status)
    }

    const page = params.page || 1
    const limit = params.limit || 10
    const total = result.length
    const start = (page - 1) * limit
    const list = result.slice(start, start + limit)

    return {
      list,
      total
    }
  }

  const getUserById = (user_id: string) => {
    return users.value.find(u => u.user_id === user_id) || null
  }

  const updateUserStatus = (user_id: string, status: 'normal' | 'banned') => {
    const user = users.value.find(u => u.user_id === user_id)
    if (user) {
      user.status = status
      return true
    }
    return false
  }

  // 2. Content Management Actions
  const getPosts = (params: { nickname?: string; user_id?: string; status?: string; content?: string; page?: number; limit?: number }) => {
    let result = [...posts.value]

    if (params.nickname) {
      result = result.filter(p => p.nickname.includes(params.nickname!))
    }
    if (params.user_id) {
      result = result.filter(p => p.user_id === params.user_id)
    }
    if (params.status) {
      result = result.filter(p => p.status === params.status)
    }
    if (params.content) {
      result = result.filter(p => p.content.includes(params.content!))
    }

    // Sort by publication time descending
    result.sort((a, b) => new Date(b.pubTime).getTime() - new Date(a.pubTime).getTime())

    const page = params.page || 1
    const limit = params.limit || 5
    const total = result.length
    const start = (page - 1) * limit
    const list = result.slice(start, start + limit)

    return {
      list,
      total
    }
  }

  const getPostById = (post_id: string) => {
    return posts.value.find(p => p.post_id === post_id) || null
  }

  const setPostOffline = (post_id: string) => {
    const post = posts.value.find(p => p.post_id === post_id)
    if (post) {
      post.status = 'offline'
      return true
    }
    return false
  }

  const setPostOnline = (post_id: string) => {
    const post = posts.value.find(p => p.post_id === post_id)
    if (post) {
      post.status = 'online'
      return true
    }
    return false
  }

  // Batch delete posts by IDs
  const deletePosts = (ids: string[]) => {
    const idSet = new Set(ids)
    const before = posts.value.length
    posts.value = posts.value.filter(p => !idSet.has(p.post_id))
    return before - posts.value.length
  }

  // Batch update user status
  const batchUpdateUserStatus = (ids: string[], status: 'normal' | 'banned') => {
    let count = 0
    for (const u of users.value) {
      if (ids.includes(u.user_id)) {
        u.status = status
        count++
      }
    }
    return count
  }

  // 3. Comment Management Actions
  const getComments = (params: { post_id?: string; user_id?: string; page?: number; limit?: number }) => {
    let result = [...comments.value]

    if (params.post_id) {
      result = result.filter(c => c.post_id === params.post_id)
    }
    if (params.user_id) {
      result = result.filter(c => c.user_id === params.user_id)
    }

    // Sort by pubTime descending
    result.sort((a, b) => new Date(b.pubTime).getTime() - new Date(a.pubTime).getTime())

    const page = params.page || 1
    const limit = params.limit || 10
    const total = result.length
    const start = (page - 1) * limit
    const list = result.slice(start, start + limit)

    return {
      list,
      total
    }
  }

  const deleteComment = (comment_id: string) => {
    const index = comments.value.findIndex(c => c.comment_id === comment_id)
    if (index !== -1) {
      const comment = comments.value[index]
      comments.value.splice(index, 1)
      
      // Update count on post
      const post = posts.value.find(p => p.post_id === comment.post_id)
      if (post && post.comments > 0) {
        post.comments--
      }
      return true
    }
    return false
  }

  // 4. Agreement Management Actions
  const getAgreement = (type: 'privacy' | 'user') => {
    return agreements.value[type]
  }

  const updateAgreement = (type: 'privacy' | 'user', content: string) => {
    agreements.value[type] = content
    return true
  }

  const updateUserPhone = (user_id: string, newPhone: string) => {
    const user = users.value.find(u => u.user_id === user_id)
    if (user) {
      user.phone = newPhone
      user.newPhone = newPhone
      return true
    }
    return false
  }

  const addPost = (post: { user_id: string; nickname: string; avatar: string; content: string; images: string[] }) => {
    const newPostId = String(20000 + posts.value.length + 1)
    const newPost: PostItem = {
      post_id: newPostId,
      user_id: post.user_id,
      nickname: post.nickname,
      avatar: post.avatar,
      content: post.content,
      images: post.images,
      likes: 0,
      comments: 0,
      shares: 0,
      status: 'online',
      pubTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    posts.value.unshift(newPost) // Put newest post first

    // Increment postCount for the user
    const user = users.value.find(u => u.user_id === post.user_id)
    if (user) {
      user.postCount++
    }
    return newPost
  }

  const addComment = (comment: { post_id: string; user_id: string; nickname: string; avatar: string; content: string; reply_to_nickname?: string | null }) => {
    const newCommentId = String(30000 + comments.value.length + 1)
    const newComment: CommentItem = {
      comment_id: newCommentId,
      post_id: comment.post_id,
      user_id: comment.user_id,
      nickname: comment.nickname,
      avatar: comment.avatar,
      content: comment.content,
      parent_id: comment.reply_to_nickname ? String(Number(newCommentId) - 1) : null,
      reply_to_user_id: comment.reply_to_nickname ? '10003' : null,
      reply_to_nickname: comment.reply_to_nickname || null,
      pubTime: new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    comments.value.push(newComment)

    // Increment comments for the post
    const post = posts.value.find(p => p.post_id === comment.post_id)
    if (post) {
      post.comments++
    }

    // Increment commentCount for the user
    const user = users.value.find(u => u.user_id === comment.user_id)
    if (user) {
      user.commentCount++
    }
    return newComment
  }

  const incrementLikes = (post_id: string) => {
    const post = posts.value.find(p => p.post_id === post_id)
    if (post) {
      post.likes++
      // Also increment user's likesReceived
      const user = users.value.find(u => u.user_id === post.user_id)
      if (user) {
        user.likesReceived++
      }
      return true
    }
    return false
  }

  const incrementShares = (post_id: string) => {
    const post = posts.value.find(p => p.post_id === post_id)
    if (post) {
      post.shares++
      return true
    }
    return false
  }

  // Helper metrics for dashboard
  // 5. System Configurations Actions
  const addTag = (tag: string) => {
    if (tag && !tags.value.includes(tag)) {
      tags.value.push(tag)
      return true
    }
    return false
  }

  const deleteTag = (tag: string) => {
    const idx = tags.value.indexOf(tag)
    if (idx !== -1) {
      tags.value.splice(idx, 1)
      return true
    }
    return false
  }

  const addRegion = (region: string) => {
    if (region && !regions.value.includes(region)) {
      regions.value.push(region)
      return true
    }
    return false
  }

  const deleteRegion = (region: string) => {
    const idx = regions.value.indexOf(region)
    if (idx !== -1) {
      regions.value.splice(idx, 1)
      return true
    }
    return false
  }

  const addDictItem = (dictKey: string, item: DictItem, parentValue?: string) => {
    if (!dicts.value[dictKey]) {
      dicts.value[dictKey] = []
    }
    
    const findItemByValue = (list: DictItem[], val: string): DictItem | null => {
      for (const d of list) {
        if (d.value === val) return d
        if (d.children && d.children.length) {
          const found = findItemByValue(d.children, val)
          if (found) return found
        }
      }
      return null
    }

    const exists = findItemByValue(dicts.value[dictKey], item.value)
    if (exists) return false

    let maxCode = 0
    const scanMaxCode = (list: DictItem[]) => {
      list.forEach(d => {
        if (d.dictCode && d.dictCode > maxCode) {
          maxCode = d.dictCode
        }
        if (d.children && d.children.length) {
          scanMaxCode(d.children)
        }
      })
    }
    scanMaxCode(dicts.value[dictKey])
    item.dictCode = maxCode + 1
    item.createTime = item.createTime || new Date().toISOString().replace('T', ' ').substring(0, 19)
    item.children = item.children || []

    if (parentValue) {
      const parent = findItemByValue(dicts.value[dictKey], parentValue)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(item)
        return true
      }
      return false
    } else {
      dicts.value[dictKey].push(item)
      return true
    }
  }

  const deleteDictItem = (dictKey: string, value: string) => {
    if (!dicts.value[dictKey]) return false

    const removeItemFromList = (list: DictItem[], val: string): boolean => {
      const idx = list.findIndex(i => i.value === val)
      if (idx !== -1) {
        list.splice(idx, 1)
        return true
      }
      for (const d of list) {
        if (d.children && d.children.length) {
          const success = removeItemFromList(d.children, val)
          if (success) return true
        }
      }
      return false
    }

    return removeItemFromList(dicts.value[dictKey], value)
  }

  const updateDictItem = (dictKey: string, value: string, updatedFields: string | Partial<DictItem>) => {
    if (!dicts.value[dictKey]) return false

    const findItemByValue = (list: DictItem[], val: string): DictItem | null => {
      for (const d of list) {
        if (d.value === val) return d
        if (d.children && d.children.length) {
          const found = findItemByValue(d.children, val)
          if (found) return found
        }
      }
      return null
    }

    const item = findItemByValue(dicts.value[dictKey], value)
    if (item) {
      if (typeof updatedFields === 'string') {
        item.label = updatedFields
      } else {
        Object.assign(item, updatedFields)
      }
      return true
    }
    return false
  }

  // Helper metrics for dashboard
  const getDashboardMetrics = () => {
    const totalUsers = users.value.length
    const activeUsers = users.value.filter(u => u.status === 'normal').length
    const totalPosts = posts.value.length
    const onlinePosts = posts.value.filter(p => p.status === 'online').length
    const offlinePosts = posts.value.filter(p => p.status === 'offline').length
    const totalComments = comments.value.length

    // Calculate total likes on posts
    const totalLikes = posts.value.reduce((acc, curr) => acc + curr.likes, 0)

    return {
      totalUsers,
      activeUsers,
      totalPosts,
      onlinePosts,
      offlinePosts,
      totalComments,
      totalLikes
    }
  }

  const addMessage = (item: Partial<MessageItem>) => {
    const code = String(Date.now()).substring(7)
    const newItem: MessageItem = {
      message_id: item.message_id || code,
      title: item.title || '无标题消息',
      type: item.type || 'notification',
      content: item.content || '',
      target: item.target || 'all',
      status: item.status || '0',
      pubTime: item.pubTime || new Date().toISOString().replace('T', ' ').substring(0, 19)
    }
    messages.value.unshift(newItem)
    return true
  }

  const deleteMessage = (id: string) => {
    const idx = messages.value.findIndex(m => m.message_id === id)
    if (idx !== -1) {
      messages.value.splice(idx, 1)
      return true
    }
    return false
  }

  const updateMessage = (id: string, updatedFields: Partial<MessageItem>) => {
    const item = messages.value.find(m => m.message_id === id)
    if (item) {
      Object.assign(item, updatedFields)
      return true
    }
    return false
  }

  // ── Admin Accounts ─────────────────────────────────────────────
  const adminAccounts = ref<AdminAccount[]>([
    {
      account_id: 'A001',
      username: 'superadmin',
      nickname: '超级管理员',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=superadmin',
      role: 'superadmin',
      permissions: ['user', 'content', 'comment', 'tag', 'region', 'dict', 'message', 'agreement', 'account', 'dashboard'],
      status: 'active',
      email: 'super@jishanapp.com',
      phone: '13800000001',
      createTime: '2024-01-01 00:00:00',
      lastLogin: '2026-05-31 08:00:00',
      remark: '系统超级管理员，拥有所有权限'
    },
    {
      account_id: 'A002',
      username: 'admin_wang',
      nickname: '王管理',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin_wang',
      role: 'admin',
      permissions: ['user', 'content', 'comment', 'tag', 'region', 'message', 'dashboard'],
      status: 'active',
      email: 'wang@jishanapp.com',
      phone: '13800000002',
      createTime: '2025-03-10 09:00:00',
      lastLogin: '2026-05-30 17:32:00',
      remark: '负责内容与用户日常管理'
    },
    {
      account_id: 'A003',
      username: 'operator_li',
      nickname: '李运营',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=operator_li',
      role: 'operator',
      permissions: ['content', 'comment', 'tag', 'dashboard'],
      status: 'active',
      email: 'li@jishanapp.com',
      phone: '13800000003',
      createTime: '2025-06-15 10:00:00',
      lastLogin: '2026-05-29 14:20:00',
      remark: '负责内容运营与审核'
    },
    {
      account_id: 'A004',
      username: 'viewer_chen',
      nickname: '陈数据',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer_chen',
      role: 'viewer',
      permissions: ['dashboard'],
      status: 'disabled',
      email: 'chen@jishanapp.com',
      phone: '13800000004',
      createTime: '2025-09-01 09:00:00',
      lastLogin: '2026-04-10 09:15:00',
      remark: '仅查看数据看板'
    }
  ])

  const getAdminAccounts = () => adminAccounts.value

  const addAdminAccount = (item: Omit<AdminAccount, 'account_id' | 'createTime' | 'lastLogin'>) => {
    const newAccount: AdminAccount = {
      ...item,
      account_id: 'A' + (Date.now() % 100000).toString().padStart(5, '0'),
      createTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      lastLogin: '--'
    }
    adminAccounts.value.unshift(newAccount)
    return true
  }

  const updateAdminAccount = (id: string, updatedFields: Partial<AdminAccount>) => {
    const item = adminAccounts.value.find(a => a.account_id === id)
    if (item) {
      Object.assign(item, updatedFields)
      return true
    }
    return false
  }

  const deleteAdminAccount = (id: string) => {
    const idx = adminAccounts.value.findIndex(a => a.account_id === id)
    if (idx !== -1) {
      adminAccounts.value.splice(idx, 1)
      return true
    }
    return false
  }

  const resetAdminPassword = (id: string) => {
    // Mock: just returns true
    const item = adminAccounts.value.find(a => a.account_id === id)
    return !!item
  }

  // --- ANNOUNCEMENT ACTIONS ---
  const getAnnouncements = (params: { keyword?: string; type?: string; status?: string; page?: number; limit?: number }) => {
    let result = [...announcements.value]
    
    if (params.keyword) {
      const kw = params.keyword.toLowerCase()
      result = result.filter(a => a.title.toLowerCase().includes(kw) || a.content.toLowerCase().includes(kw))
    }
    if (params.type) {
      result = result.filter(a => a.type === params.type)
    }
    if (params.status) {
      result = result.filter(a => a.status === params.status)
    }

    // Sort pinned ones to top, then start time descending
    result.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.startTime.localeCompare(a.startTime)
    })

    const page = params.page || 1
    const limit = params.limit || 10
    const total = result.length
    const start = (page - 1) * limit
    const list = result.slice(start, start + limit)

    return { list, total }
  }

  const addAnnouncement = (item: Omit<AnnItem, 'id'>) => {
    const newId = 'N' + (Date.now() % 1000).toString().padStart(3, '0')
    const newItem: AnnItem = {
      id: newId,
      ...item
    }
    announcements.value.unshift(newItem)
    return newItem
  }

  const updateAnnouncement = (id: string, updatedFields: Partial<AnnItem>) => {
    const item = announcements.value.find(a => a.id === id)
    if (item) {
      Object.assign(item, updatedFields)
      return true
    }
    return false
  }

  const deleteAnnouncement = (id: string) => {
    const idx = announcements.value.findIndex(a => a.id === id)
    if (idx !== -1) {
      announcements.value.splice(idx, 1)
      return true
    }
    return false
  }

  const batchPublishAnnouncements = (ids: string[]) => {
    announcements.value.forEach(a => {
      if (ids.includes(a.id)) {
        a.status = 'active'
      }
    })
    return true
  }

  const batchDisableAnnouncements = (ids: string[]) => {
    announcements.value.forEach(a => {
      if (ids.includes(a.id)) {
        a.status = 'inactive'
      }
    })
    return true
  }

  const batchDeleteAnnouncements = (ids: string[]) => {
    announcements.value = announcements.value.filter(a => !ids.includes(a.id))
    return true
  }

  // --- VERSION ACTIONS ---
  const getVersions = (params: { platform?: string; status?: string; forceUpdate?: string; page?: number; limit?: number }) => {
    let result = [...versions.value]

    if (params.platform) {
      result = result.filter(v => v.platform === params.platform)
    }
    if (params.status) {
      result = result.filter(v => v.status === params.status)
    }
    if (params.forceUpdate !== undefined && params.forceUpdate !== '') {
      const isForce = params.forceUpdate === 'true'
      result = result.filter(v => v.forceUpdate === isForce)
    }

    // Sort by build descending
    result.sort((a, b) => b.build.localeCompare(a.build))

    const page = params.page || 1
    const limit = params.limit || 10
    const total = result.length
    const start = (page - 1) * limit
    const list = result.slice(start, start + limit)

    return { list, total }
  }

  const addVersion = (item: Omit<VersionItem, 'id' | 'releaseTime'>) => {
    const newId = 'V' + (Date.now() % 1000).toString().padStart(3, '0')
    const newItem: VersionItem = {
      id: newId,
      ...item,
      releaseTime: new Date().toISOString().replace('T', ' ').slice(0, 16)
    }
    versions.value.unshift(newItem)
    return newItem
  }

  const updateVersion = (id: string, updatedFields: Partial<VersionItem>) => {
    const item = versions.value.find(v => v.id === id)
    if (item) {
      Object.assign(item, updatedFields)
      return true
    }
    return false
  }

  const deleteVersion = (id: string) => {
    const idx = versions.value.findIndex(v => v.id === id)
    if (idx !== -1) {
      versions.value.splice(idx, 1)
      return true
    }
    return false
  }

  const deprecateVersion = (id: string) => {
    const item = versions.value.find(v => v.id === id)
    if (item) {
      item.status = 'deprecated'
      return true
    }
    return false
  }

  const batchDeprecateVersions = (ids: string[]) => {
    versions.value.forEach(v => {
      if (ids.includes(v.id)) {
        v.status = 'deprecated'
      }
    })
    return true
  }

  const batchDeleteVersions = (ids: string[]) => {
    versions.value = versions.value.filter(v => !ids.includes(v.id))
    return true
  }

  return {
    users,
    posts,
    comments,
    tags,
    regions,
    dicts,
    messages,
    getUsers,
    getUserById,
    updateUserStatus,
    getPosts,
    getPostById,
    setPostOffline,
    setPostOnline,
    deletePosts,
    batchUpdateUserStatus,
    getComments,
    deleteComment,
    getAgreement,
    updateAgreement,
    getDashboardMetrics,
    updateUserPhone,
    addPost,
    addComment,
    incrementLikes,
    incrementShares,
    addTag,
    deleteTag,
    addRegion,
    deleteRegion,
    addDictItem,
    deleteDictItem,
    updateDictItem,
    addMessage,
    deleteMessage,
    updateMessage,
    adminAccounts,
    getAdminAccounts,
    addAdminAccount,
    updateAdminAccount,
    deleteAdminAccount,
    resetAdminPassword,
    announcements,
    getAnnouncements,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    batchPublishAnnouncements,
    batchDisableAnnouncements,
    batchDeleteAnnouncements,
    versions,
    getVersions,
    addVersion,
    updateVersion,
    deleteVersion,
    deprecateVersion,
    batchDeprecateVersions,
    batchDeleteVersions
  }
})
