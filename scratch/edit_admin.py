import os

admin_path = "/Users/hooksvue/Desktop/jiShan Backstage Management System/src/api/admin.ts"

with open(admin_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """  async getDicts(params?: { type?: string; label?: string; status?: string }) {
    const queryParams: any = { limit: 100 }
    if (params?.type) queryParams.type = params.type
    if (params?.label) queryParams.label = params.label
    if (params?.status) {
      queryParams.status = params.status === '0' ? 'enabled' : (params.status === '1' ? 'disabled' : params.status)
    }

    let res = await request.get<any>('/api/admin/dictionaries', queryParams)
    const rawList = res.data?.list || []
    
    if (rawList.length === 0 && !params?.label && !params?.status) {
      const checkRes = await request.get<any>('/api/admin/dictionaries', { limit: 1 })
      const checkList = checkRes.data?.list || []
      if (checkList.length === 0) {
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
        res = await request.get<any>('/api/admin/dictionaries', queryParams)
      }
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
  },"""

replacement = """  async getDicts(params?: { type?: string; label?: string; status?: string }) {
    const queryParams: any = { limit: 1000 }
    if (params?.type) queryParams.type = params.type
    if (params?.label) queryParams.keyword = params.label
    if (params?.status) {
      queryParams.status = params.status === '0' ? 'enabled' : (params.status === '1' ? 'disabled' : params.status)
    }

    let res = await request.get<any>('/api/admin/dictionaries', queryParams)
    const rawList = res.data?.list || []
    
    if (rawList.length === 0 && !params?.label && !params?.status) {
      const checkRes = await request.get<any>('/api/admin/dictionaries', { limit: 1 })
      const checkList = checkRes.data?.list || []
      if (checkList.length === 0) {
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
        res = await request.get<any>('/api/admin/dictionaries', queryParams)
      }
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

    const adaptDictItem = (item: any): ApiDictItem => {
      let parentValue: string | null = null
      let actualRemark = item.remark || ''
      
      const parentMatch = actualRemark.match(/^parent:([^|]+)\|(.*)$/)
      if (parentMatch) {
        parentValue = parentMatch[1]
        actualRemark = parentMatch[2]
      }
      
      // De-duplicate children array recursively to prevent duplicate display of items in UI
      const childrenList = item.children || []
      const uniqueChildren: any[] = []
      const childSeen = new Set<string>()
      for (const child of childrenList) {
        const key = `${child.type}:${child.value}`
        if (!childSeen.has(key)) {
          childSeen.add(key)
          uniqueChildren.push(child)
        }
      }
      
      return {
        value: item.value,
        label: item.label,
        dictCode: item.dictId,
        dictSort: item.sort || 1,
        status: item.status === 'enabled' ? '0' : '1',
        remark: actualRemark,
        parentValue,
        type: item.type,
        children: uniqueChildren.map((child: any) => adaptDictItem(child))
      }
    }

    const adaptedList = uniqueList.map((item: any) => adaptDictItem(item))

    adaptedList.forEach((item: any) => {
      if (!item.parentValue) {
        if (!result[item.type]) {
          result[item.type] = []
        }
        result[item.type].push(item)
      }
    })

    // Also support flat list building if parent match remark has parentValue
    adaptedList.forEach((item: any) => {
      if (item.parentValue) {
        const parent = adaptedList.find((p: any) => p.type === item.type && p.value === item.parentValue)
        if (parent) {
          // Verify it's not already added to prevent duplicates
          if (!parent.children.some((c: any) => c.value === item.value)) {
            parent.children.push(item)
          }
        }
      }
    })

    return result
  },"""

if target in content:
    content = content.replace(target, replacement)
    with open(admin_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: admin.ts updated perfectly!")
else:
    print("Error: Target content not found!")
