import { request } from '@/utils/request'

// ─────────────────────────────────────────────────────────────────
// 1. Data Models Interfaces (snake_case match frontend expectations)
// ─────────────────────────────────────────────────────────────────

export interface AdaptedUser {
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
  gender: string
}

export interface AdaptedPost {
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

export interface AdaptedComment {
  comment_id: string
  post_id: string
  user_id: string
  nickname: string
  avatar: string
  content: string
  pubTime: string
  reply_to_user_id: string | null
  reply_to_nickname: string | null
  parent_id: string | null
}

export interface DashboardMetrics {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  onlinePosts: number
  offlinePosts: number
  totalComments: number
  totalLikes: number
}

export interface ApiAnnouncement {
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

export interface ApiVersion {
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

export interface ApiDictItem {
  value: string
  label: string
  dictCode?: number
  dictSort?: number
  status?: '0' | '1'
  remark?: string
  createTime?: string
  children?: ApiDictItem[]
}

export interface ApiSysMessage {
  message_id: string
  title: string
  type: 'notification' | 'announcement' | 'alert' | 'antifraud'
  content: string
  target: 'all' | 'active' | 'new'
  status: '0' | '1'
  pubTime: string
}

export interface ApiAdminAccount {
  account_id: string
  username: string
  nickname: string
  avatar: string
  role: 'superadmin' | 'admin' | 'operator' | 'viewer'
  permissions: string[]
  status: 'active' | 'disabled'
  email: string
  phone: string
  createTime: string
  lastLogin: string
  remark: string
}

// ─────────────────────────────────────────────────────────────────
// 2. Data Adapters (Adapting camelCase backend -> snake_case frontend)
// ─────────────────────────────────────────────────────────────────

export const mapUserFromBackend = (item: any): AdaptedUser => {
  if (!item) throw new Error('Empty user data')
  return {
    user_id: item.userId || item.user_id || '',
    nickname: item.nickname || '即闪用户',
    avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.nickname || item.userId || 'user'}`,
    phone: item.phone || '--',
    newPhone: item.newPhone || undefined,
    status: item.isActive === false ? 'banned' : (item.status || 'normal'),
    regTime: item.regTime || (item.createTime ? item.createTime.replace('T', ' ').substring(0, 19) : '--'),
    postCount: item.postCount || 0,
    commentCount: item.commentCount || 0,
    likesReceived: item.likesReceived || 0,
    bio: item.bio || '',
    gender: item.gender || '保密'
  }
}

export const mapPostFromBackend = (item: any): AdaptedPost => {
  if (!item) throw new Error('Empty post data')
  return {
    post_id: item.postId || item.post_id || '',
    user_id: item.userId || item.user_id || '',
    nickname: item.nickname || '即闪用户',
    avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.nickname || item.userId || 'post'}`,
    content: item.content || '',
    images: item.images || [],
    likes: item.likeCount !== undefined ? item.likeCount : (item.likes || 0),
    comments: item.commentCount !== undefined ? item.commentCount : (item.comments || 0),
    shares: item.shareCount !== undefined ? item.shareCount : (item.shares || 0),
    status: item.status || 'online',
    pubTime: item.pubTime || (item.createdAt ? item.createdAt.replace('T', ' ').substring(0, 19) : '')
  }
}

export const mapCommentFromBackend = (item: any): AdaptedComment => {
  if (!item) throw new Error('Empty comment data')
  const nickname = item.nickname || `用户_${(item.userId || '').substring(4, 10) || '即闪'}`
  return {
    comment_id: item.commentId || item.comment_id || '',
    post_id: item.postId || item.post_id || '',
    user_id: item.userId || item.user_id || '',
    nickname,
    avatar: item.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nickname}`,
    content: item.content || '',
    pubTime: item.pubTime || (item.createdAt ? item.createdAt.replace('T', ' ').substring(0, 19) : ''),
    reply_to_user_id: item.replyToUserId || item.reply_to_user_id || null,
    reply_to_nickname: item.replyToNickname || item.reply_to_nickname || null,
    parent_id: item.parentId || item.parent_id || null
  }
}

// ─────────────────────────────────────────────────────────────────
// 3. API Invokers
// ─────────────────────────────────────────────────────────────────

export const adminApi = {
  // ── Auth ──
  login(username: string, password: string) {
    return request.post<{ token: string; username: string }>('/api/admin/auth/login', { username, password })
  },

  // ── Dashboard Metrics ──
  async getDashboardMetrics() {
    const res = await request.get<DashboardMetrics>('/api/admin/dashboard/metrics')
    return res.data
  },

  // ── User Management ──
  async getUsers(params: {
    user_id?: string
    nickname?: string
    phone?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const limit = params.limit || 10
    if (limit > 100) {
      let allItems: any[] = []
      let page = 1
      const size = 100
      let total = 0
      do {
        const queryParams: any = {
          page,
          limit: size
        }
        if (params.user_id) queryParams.userId = params.user_id
        if (params.nickname) queryParams.nickname = params.nickname
        if (params.phone) queryParams.phone = params.phone
        if (params.status) queryParams.status = params.status

        const res = await request.get<{ list: any[]; total: number }>('/api/admin/users', queryParams)
        const currentList = res.data?.list || []
        total = res.data?.total || 0
        allItems = allItems.concat(currentList)
        if (currentList.length === 0 || allItems.length >= total || allItems.length >= limit) {
          break
        }
        page++
      } while (true)

      return {
        list: allItems.map(mapUserFromBackend),
        total: total
      }
    } else {
      const queryParams: any = {
        page: params.page || 1,
        limit
      }
      if (params.user_id) queryParams.userId = params.user_id
      if (params.nickname) queryParams.nickname = params.nickname
      if (params.phone) queryParams.phone = params.phone
      if (params.status) queryParams.status = params.status

      const res = await request.get<{ list: any[]; total: number }>('/api/admin/users', queryParams)
      return {
        list: (res.data?.list || []).map(mapUserFromBackend),
        total: res.data?.total || 0
      }
    }
  },

  async getUserById(userId: string) {
    const res = await request.get<any>(`/api/admin/users/${userId}`)
    return mapUserFromBackend(res.data)
  },

  updateUserStatus(userId: string, status: 'normal' | 'banned') {
    return request.put<any>(`/api/admin/users/${userId}`, { status })
  },

  // ── Content Management (Posts) ──
  async getPosts(params: {
    user_id?: string
    nickname?: string
    status?: string
    content?: string
    page?: number
    limit?: number
  }) {
    const queryParams: any = {
      page: params.page || 1,
      limit: params.limit || 10
    }
    if (params.user_id) queryParams.userId = params.user_id
    if (params.nickname) queryParams.nickname = params.nickname
    if (params.status) queryParams.status = params.status
    if (params.content) queryParams.content = params.content

    const res = await request.get<{ items: any[]; total: number }>('/api/admin/posts', queryParams)
    
    // Backend returns list under "items"
    const items = res.data?.items || []
    const total = res.data?.total || 0

    return {
      list: items.map(mapPostFromBackend),
      total
    }
  },

  async getPostById(postId: string) {
    const res = await request.get<any>(`/api/admin/posts/${postId}`)
    return mapPostFromBackend(res.data)
  },

  setPostOffline(postId: string) {
    return request.put<any>(`/api/admin/posts/${postId}/offline`)
  },

  setPostOnline(postId: string) {
    return request.put<any>(`/api/admin/posts/${postId}/restore`)
  },

  // ── Comment Management ──
  async getComments(params: {
    post_id?: string
    user_id?: string
    page?: number
    limit?: number
  }) {
    const queryParams: any = {
      page: params.page || 1,
      limit: params.limit || 10
    }
    if (params.post_id) queryParams.postId = params.post_id
    if (params.user_id) queryParams.userId = params.user_id

    const res = await request.get<{ list: any[]; total: number }>('/api/admin/comments', queryParams)
    return {
      list: (res.data?.list || []).map(mapCommentFromBackend),
      total: res.data?.total || 0
    }
  },

  deleteComment(commentId: string) {
    return request.delete<any>(`/api/admin/comments/${commentId}`)
  },

  // ── Agreement Configuration ──
  async getAgreement(agreementType: 'privacy' | 'user') {
    const res = await request.get<string>(`/api/admin/agreement/${agreementType}`)
    return res.data // Backend returns raw HTML string in data
  },

  updateAgreement(agreementType: 'privacy' | 'user', content: string) {
    return request.put<any>(`/api/admin/agreement/${agreementType}`, { content })
  },

  // ── Announcement Management ──
  async getAnnouncements(params: { keyword?: string; type?: string; status?: string; page?: number; limit?: number }) {
    const res = await request.get<{ list: ApiAnnouncement[]; total: number }>('/api/admin/announcements', params)
    return res.data
  },

  saveAnnouncement(ann: Partial<ApiAnnouncement>) {
    if (ann.id) {
      return request.put<ApiAnnouncement>(`/api/admin/announcements/${ann.id}`, ann)
    } else {
      return request.post<ApiAnnouncement>('/api/admin/announcements', ann)
    }
  },

  deleteAnnouncement(id: string) {
    return request.delete<any>(`/api/admin/announcements/${id}`)
  },

  batchPublishAnnouncements(ids: string[]) {
    return request.put<any>('/api/admin/announcements/batch-publish', { ids })
  },

  batchDisableAnnouncements(ids: string[]) {
    return request.put<any>('/api/admin/announcements/batch-disable', { ids })
  },

  batchDeleteAnnouncements(ids: string[]) {
    return request.post<any>('/api/admin/announcements/batch-delete', { ids })
  },

  // ── Version Management ──
  async getVersions(params: { platform?: string; status?: string; forceUpdate?: string; page?: number; limit?: number }) {
    const res = await request.get<{ list: ApiVersion[]; total: number }>('/api/admin/versions', params)
    return res.data
  },

  saveVersion(ver: Partial<ApiVersion>) {
    if (ver.id) {
      return request.put<ApiVersion>(`/api/admin/versions/${ver.id}`, ver)
    } else {
      return request.post<ApiVersion>('/api/admin/versions', ver)
    }
  },

  deleteVersion(id: string) {
    return request.delete<any>(`/api/admin/versions/${id}`)
  },

  deprecateVersion(id: string) {
    return request.put<any>(`/api/admin/versions/${id}/deprecate`)
  },

  batchDeprecateVersions(ids: string[]) {
    return request.put<any>('/api/admin/versions/batch-deprecate', { ids })
  },

  batchDeleteVersions(ids: string[]) {
    return request.post<any>('/api/admin/versions/batch-delete', { ids })
  },

  // ── Tag Configuration ──
  async getTags() {
    let res = await request.get<any>('/api/admin/tags', { limit: 100 })
    const rawList = res.data?.list || []
    
    if (rawList.length === 0) {
      const defaultTags = ['夜市', '同城发现', 'citywalk', '探店', '面包脑袋', '周末去哪', '美食收集']
      for (const name of defaultTags) {
        await request.post('/api/admin/tags', { name, sort: 1, status: 'enabled' })
      }
      res = await request.get<any>('/api/admin/tags', { limit: 100 })
    }

    const currentList = res.data?.list || []
    return currentList.map((t: any) => t.name)
  },

  addTag(name: string) {
    return request.post<any>('/api/admin/tags', { name, sort: 1, status: 'enabled' })
  },

  async deleteTag(name: string) {
    const res = await request.get<any>('/api/admin/tags', { limit: 100 })
    const rawList = res.data?.list || []
    const match = rawList.find((t: any) => t.name === name)
    if (match) {
      return request.delete<any>(`/api/admin/tags/${match.tagId}`)
    }
    throw new Error('Tag not found')
  },

  // ── Region Configuration ──
  async getRegions() {
    let res = await request.get<any>('/api/admin/regions', { limit: 100 })
    const rawList = res.data?.list || []
    
    if (rawList.length === 0) {
      const defaultRegions = ['杭州·滨江天街', '广州·天河', '上海·静安寺', '北京·三里屯', '深圳·万象天地']
      for (const name of defaultRegions) {
        await request.post('/api/admin/regions', {
          name,
          code: String(Math.floor(Math.random() * 899999) + 100000),
          level: 3,
          sort: 1,
          status: 'enabled'
        })
      }
      res = await request.get<any>('/api/admin/regions', { limit: 100 })
    }

    const currentList = res.data?.list || []
    return currentList.map((r: any) => r.name)
  },

  addRegion(name: string) {
    return request.post<any>('/api/admin/regions', {
      name,
      code: String(Math.floor(Math.random() * 899999) + 100000),
      level: 3,
      sort: 1,
      status: 'enabled'
    })
  },

  async deleteRegion(name: string) {
    const res = await request.get<any>('/api/admin/regions', { limit: 100 })
    const rawList = res.data?.list || []
    const match = rawList.find((r: any) => r.name === name)
    if (match) {
      return request.delete<any>(`/api/admin/regions/${match.regionId}`)
    }
    throw new Error('Region not found')
  },

  // ── Dictionary Configuration ──
  getDictById(dictId: string) {
    return request.get<any>(`/api/admin/dictionaries/${dictId}`)
  },

  async getDicts() {
    let res = await request.get<any>('/api/admin/dictionaries', { limit: 100 })
    const rawList = res.data?.list || []
    
    if (rawList.length === 0) {
      const defaultDicts = [
        // user_status
        { type: 'user_status', label: '正常', value: 'normal', sort: 1, status: 'enabled', remark: '' },
        { type: 'user_status', label: '活跃用户', value: 'normal_active', sort: 1, status: 'enabled', remark: 'parent:normal|' },
        { type: 'user_status', label: '静默用户', value: 'normal_silent', sort: 2, status: 'enabled', remark: 'parent:normal|' },
        { type: 'user_status', label: '已禁用', value: 'banned', sort: 2, status: 'enabled', remark: '' },
        { type: 'user_status', label: '临时封禁', value: 'banned_temp', sort: 1, status: 'enabled', remark: 'parent:banned|' },
        { type: 'user_status', label: '永久封禁', value: 'banned_forever', sort: 2, status: 'enabled', remark: 'parent:banned|' },
        // post_status
        { type: 'post_status', label: '已上架', value: 'online', sort: 1, status: 'enabled', remark: '' },
        { type: 'post_status', label: '精选动态', value: 'online_featured', sort: 1, status: 'enabled', remark: 'parent:online|' },
        { type: 'post_status', label: '普通动态', value: 'online_normal', sort: 2, status: 'enabled', remark: 'parent:online|' },
        { type: 'post_status', label: '已下架', value: 'offline', sort: 2, status: 'enabled', remark: '' },
        // post_visibility
        { type: 'post_visibility', label: '公开', value: 'public', sort: 1, status: 'enabled', remark: '' },
        { type: 'post_visibility', label: '私密', value: 'private', sort: 2, status: 'enabled', remark: '' }
      ]
      for (const d of defaultDicts) {
        await request.post('/api/admin/dictionaries', d)
      }
      res = await request.get<any>('/api/admin/dictionaries', { limit: 100 })
    }

    const currentList = res.data?.list || []
    
    // De-duplicate elements in the client list to keep UI absolutely pristine
    const uniqueList: any[] = []
    const seen = new Set<string>()
    for (const item of currentList) {
      const key = `${item.type}:${item.value}`
      if (!seen.has(key)) {
        seen.add(key)
        uniqueList.push(item)
      }
    }

    const result: Record<string, ApiDictItem[]> = {
      user_status: [],
      post_status: [],
      post_visibility: []
    }

    const adaptedList = uniqueList.map((item: any) => {
      let parentValue: string | null = null
      let actualRemark = item.remark || ''
      
      const parentMatch = actualRemark.match(/^parent:([^|]+)\|(.*)$/)
      if (parentMatch) {
        parentValue = parentMatch[1]
        actualRemark = parentMatch[2]
      }
      
      return {
        value: item.value,
        label: item.label,
        dictCode: item.dictId,
        dictSort: item.sort || 1,
        status: item.status === 'enabled' ? '0' : '1',
        remark: actualRemark,
        createTime: item.createdAt || '2026-05-26 11:04:08',
        parentValue,
        type: item.type,
        children: [] as ApiDictItem[]
      }
    })

    adaptedList.forEach((item: any) => {
      if (!item.parentValue) {
        if (!result[item.type]) {
          result[item.type] = []
        }
        result[item.type].push(item)
      }
    })

    adaptedList.forEach((item: any) => {
      if (item.parentValue) {
        const parent = adaptedList.find((p: any) => p.type === item.type && p.value === item.parentValue)
        if (parent) {
          parent.children.push(item)
        }
      }
    })

    return result
  },

  addDictItem(key: string, item: ApiDictItem, parentValue?: string) {
    const payload = {
      type: key,
      label: item.label,
      value: item.value,
      sort: item.dictSort || 1,
      status: item.status === '1' ? 'disabled' : 'enabled',
      remark: parentValue ? `parent:${parentValue}|${item.remark || ''}` : (item.remark || '')
    }
    return request.post<any>('/api/admin/dictionaries', payload)
  },

  async deleteDictItem(key: string, value: string) {
    const res = await request.get<any>('/api/admin/dictionaries', { limit: 100 })
    const rawList = res.data?.list || []
    const match = rawList.find((d: any) => d.type === key && d.value === value)
    if (match) {
      return request.delete<any>(`/api/admin/dictionaries/${match.dictId}`)
    }
    throw new Error('Dictionary item not found')
  },

  async updateDictItem(key: string, value: string, updatedFields: Partial<ApiDictItem>) {
    const res = await request.get<any>('/api/admin/dictionaries', { limit: 100 })
    const rawList = res.data?.list || []
    const match = rawList.find((d: any) => d.type === key && d.value === value)
    if (!match) throw new Error('Dictionary item not found')

    let parentValue = ''
    const parentMatch = (match.remark || '').match(/^parent:([^|]+)\|/)
    if (parentMatch) {
      parentValue = parentMatch[1]
    }

    const payload = {
      type: key,
      label: updatedFields.label !== undefined ? updatedFields.label : match.label,
      value: value,
      sort: updatedFields.dictSort !== undefined ? updatedFields.dictSort : match.sort,
      status: updatedFields.status !== undefined ? (updatedFields.status === '1' ? 'disabled' : 'enabled') : match.status,
      remark: updatedFields.remark !== undefined 
        ? (parentValue ? `parent:${parentValue}|${updatedFields.remark || ''}` : (updatedFields.remark || ''))
        : match.remark
    }
    return request.put<any>(`/api/admin/dictionaries/${match.dictId}`, payload)
  },

  // ── System Messages ──
  async getMessages(params?: {
    keyword?: string
    type?: string
    status?: string
    page?: number
    limit?: number
  }) {
    const queryParams: any = {
      page: params?.page || 1,
      limit: params?.limit || 10
    }
    if (params?.keyword) queryParams.keyword = params.keyword
    if (params?.type) queryParams.type = params.type
    if (params?.status) {
      queryParams.status = params.status === '1' ? 'published' : (params.status === '0' ? 'draft' : params.status)
    }

    let res = await request.get<any>('/api/admin/system-messages', queryParams)
    const rawList = res.data?.list || []
    
    // Auto-seed missing defaults only if the database is completely empty and no search query is active
    if (rawList.length === 0 && !params?.keyword && !params?.type && !params?.status) {
      const defaultMessages = [
        {
          title: '即闪 App 互助版块服务协议升级公告',
          type: 'announcement',
          content: '尊敬的用户，我们于今日升级了即闪互助版块的服务条款，进一步保障了广大用户的合法权益。详情请点击查阅最新版服务协议。',
          target: 'all',
          status: 'published',
          isPinned: false
        },
        {
          title: '关于防范网络“虚假刷单”诈骗的安全预警',
          type: 'antifraud',
          content: '近期网络中刷单兼戏类诈骗频繁出现，平台郑重提醒：任何要求先行垫付资金的兼职刷单均属于违法诈骗行为，请广大用户提高警惕，切勿上当受骗！',
          target: 'all',
          status: 'published',
          isPinned: false
        },
        {
          title: '新用户注册福利与安全提示',
          type: 'notification',
          content: '欢迎来到即闪平台！我们致力于打造最纯粹的同城互助社交体验。请注意保管好您的个人账户安全，防范一切可疑的资金要求。',
          target: 'new',
          status: 'published',
          isPinned: false
        }
      ]
      for (const m of defaultMessages) {
        await request.post('/api/admin/system-messages', m)
      }
      res = await request.get<any>('/api/admin/system-messages', queryParams)
    }

    const currentList = res.data?.list || []
    return {
      list: currentList.map((item: any): ApiSysMessage => ({
        message_id: item.messageId,
        title: item.title,
        type: item.type,
        content: item.content,
        target: item.target,
        status: item.status === 'published' ? '1' : '0',
        pubTime: item.createdAt ? item.createdAt.replace('T', ' ').substring(0, 19) : '--'
      })),
      total: res.data?.total || 0
    }
  },

  addMessage(msg: Partial<ApiSysMessage>) {
    return request.post<any>('/api/admin/system-messages', {
      title: msg.title,
      content: msg.content,
      type: msg.type || 'notification',
      target: msg.target || 'all',
      status: msg.status === '1' ? 'published' : 'draft',
      isPinned: false
    })
  },

  async updateMessage(id: string, msg: Partial<ApiSysMessage>) {
    const res = await request.get<any>(`/api/admin/system-messages/${id}`)
    const current = res.data
    const payload = {
      title: msg.title !== undefined ? msg.title : current.title,
      content: msg.content !== undefined ? msg.content : current.content,
      type: msg.type !== undefined ? msg.type : current.type,
      target: msg.target !== undefined ? msg.target : current.target,
      status: msg.status !== undefined ? (msg.status === '1' ? 'published' : 'draft') : current.status,
      isPinned: current.isPinned || false
    }
    return request.put<any>(`/api/admin/system-messages/${id}`, payload)
  },

  deleteMessage(id: string) {
    return request.delete<any>(`/api/admin/system-messages/${id}`)
  },

  async getMessageById(id: string) {
    const res = await request.get<any>(`/api/admin/system-messages/${id}`)
    const item = res.data
    return {
      message_id: item.messageId,
      title: item.title,
      type: item.type,
      content: item.content,
      target: item.target,
      status: item.status === 'published' ? '1' : '0',
      pubTime: item.createdAt ? item.createdAt.replace('T', ' ').substring(0, 19) : '--'
    } as ApiSysMessage
  },

  markNotificationRead(messageId: string) {
    return request.put<any>(`/api/admin/notifications/${messageId}/read`)
  },

  markAllNotificationsRead() {
    return request.put<any>('/api/admin/notifications/read-all')
  },

  async getNotifications() {
    const res = await request.get<any>('/api/admin/notifications')
    const list = res.data || []
    return list.map((item: any) => ({
      id: item.messageId || item.id || '',
      title: item.title || '',
      unread: item.unread !== undefined ? item.unread : true,
      time: item.createdAt || item.pubTime || item.time || ''
    }))
  },

  // ── Admin Accounts ──
  async getAdminAccounts() {
    const res = await request.get<ApiAdminAccount[]>('/api/admin/accounts')
    return res.data
  },

  addAdminAccount(acc: Omit<ApiAdminAccount, 'account_id' | 'createTime' | 'lastLogin'>) {
    return request.post<any>('/api/admin/accounts', acc)
  },

  updateAdminAccount(id: string, acc: Partial<ApiAdminAccount>) {
    return request.put<any>(`/api/admin/accounts/${id}`, acc)
  },

  deleteAdminAccount(id: string) {
    return request.delete<any>(`/api/admin/accounts/${id}`)
  },

  resetAdminPassword(id: string) {
    return request.post<any>(`/api/admin/accounts/${id}/reset-password`)
  }
}
