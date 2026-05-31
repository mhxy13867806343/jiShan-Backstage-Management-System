admin_path = "/Users/hooksvue/Desktop/jiShan Backstage Management System/src/api/admin.ts"

with open(admin_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update ApiDictItem interface
old_interface = """export interface ApiDictItem {
  value: string
  label: string
  dictCode?: number
  dictSort?: number
  status?: '0' | '1'
  remark?: string
  createTime?: string
  children?: ApiDictItem[]
}"""

new_interface = """export interface ApiDictItem {
  value: string
  label: string
  dictCode?: number
  dictSort?: number
  status?: '0' | '1'
  remark?: string
  createTime?: string
  parentValue?: string | null
  type?: string
  children?: ApiDictItem[]
}"""

if old_interface in content:
    content = content.replace(old_interface, new_interface)
    print("ApiDictItem interface updated successfully!")
else:
    print("Error: ApiDictItem interface not found!")

# 2. Update flat list reconstruction loop to be TS safe
old_loop = """    // Also support flat list building if parent match remark has parentValue
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
    })"""

new_loop = """    // Also support flat list building if parent match remark has parentValue
    adaptedList.forEach((item: any) => {
      if (item.parentValue) {
        const parent = adaptedList.find((p: any) => p.type === item.type && p.value === item.parentValue)
        if (parent) {
          if (!parent.children) {
            parent.children = []
          }
          // Verify it's not already added to prevent duplicates
          if (!parent.children.some((c: any) => c.value === item.value)) {
            parent.children.push(item)
          }
        }
      }
    })"""

if old_loop in content:
    content = content.replace(old_loop, new_loop)
    print("Flat list loop updated successfully!")
else:
    # Let's try LF line endings if not found
    old_loop_lf = old_loop.replace('\n', '\r\n')
    if old_loop_lf in content:
        content = content.replace(old_loop_lf, new_loop.replace('\n', '\r\n'))
        print("Flat list loop (CRLF) updated successfully!")
    else:
        print("Error: Flat list loop not found!")

with open(admin_path, 'w', encoding='utf-8') as f:
    f.write(content)
