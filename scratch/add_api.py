admin_path = "/Users/hooksvue/Desktop/jiShan Backstage Management System/src/api/admin.ts"

with open(admin_path, 'r', encoding='utf-8') as f:
    content = f.read()

target = """  async deleteRegion(name: string) {
    const res = await request.get<any>('/api/admin/regions', { limit: 100 })
    const rawList = res.data?.list || []
    const match = rawList.find((r: any) => r.name === name)
    if (match) {
      return request.delete<any>(`/api/admin/regions/${match.regionId}`)
    }
    throw new Error('Region not found')
  },"""

replacement = """  async deleteRegion(name: string) {
    const res = await request.get<any>('/api/admin/regions', { limit: 100 })
    const rawList = res.data?.list || []
    const match = rawList.find((r: any) => r.name === name)
    if (match) {
      return request.delete<any>(`/api/admin/regions/${match.regionId}`)
    }
    throw new Error('Region not found')
  },

  // ── Address tree Public Configuration ──
  getAddressTree() {
    return request.get<any>('/api/address/tree')
  },"""

if target in content:
    content = content.replace(target, replacement)
    print("Address tree API added successfully!")
else:
    # Try CRLF just in case
    target_crlf = target.replace('\n', '\r\n')
    if target_crlf in content:
        content = content.replace(target_crlf, replacement.replace('\n', '\r\n'))
        print("Address tree API (CRLF) added successfully!")
    else:
        print("Error: deleteRegion function not found!")

with open(admin_path, 'w', encoding='utf-8') as f:
    f.write(content)
