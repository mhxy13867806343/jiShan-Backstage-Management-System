import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserItem {
  user_id: string
  nickname: string
  avatar: string
  phone: string
  status: 'normal' | 'banned'
  regTime: string
  postCount: number
  commentCount: number
  likesReceived: number
  bio: string
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

export const useMockDataStore = defineStore('mockData', () => {
  // Initialize mock users
  const users = ref<UserItem[]>([
    {
      user_id: '10001',
      nickname: '极光漫步者',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '13812345678',
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
  const getPosts = (params: { nickname?: string; user_id?: string; status?: string; page?: number; limit?: number }) => {
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

  return {
    users,
    posts,
    comments,
    getUsers,
    getUserById,
    updateUserStatus,
    getPosts,
    getPostById,
    setPostOffline,
    setPostOnline,
    getComments,
    deleteComment,
    getAgreement,
    updateAgreement,
    getDashboardMetrics
  }
})
