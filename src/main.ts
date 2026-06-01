import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@wangeditor/editor/dist/css/style.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

// Register all Element Plus Icons globally
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(pinia)
app.use(router)
app.use(ElementPlus)

app.mount('#app')

// 生产环境安全防护：禁用右键及开发者工具快捷键，并重定向至百度
if (import.meta.env.PROD) {
  // 禁用右键菜单
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    alert('检测到非法右键操作，系统将为您跳转安全页面！')
    window.location.href = 'https://www.baidu.com'
  })

  // 禁用开发者工具常用快捷键
  document.addEventListener('keydown', (e) => {
    // F12
    const isF12 = e.key === 'F12' || e.keyCode === 123
    // Ctrl+Shift+I / Cmd+Opt+I (Mac)
    const isInspect = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'i' || e.key === 'I' || e.keyCode === 73)
    // Ctrl+Shift+J / Cmd+Opt+J (Mac)
    const isConsole = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'j' || e.key === 'J' || e.keyCode === 74)
    // Ctrl+Shift+C / Cmd+Opt+C (Mac)
    const isSelect = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'c' || e.key === 'C' || e.keyCode === 67)
    // Ctrl+U / Cmd+U (查看源代码)
    const isViewSource = (e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)

    if (isF12 || isInspect || isConsole || isSelect || isViewSource) {
      e.preventDefault()
      alert('检测到尝试打开开发者工具操作，系统将为您跳转安全页面！')
      window.location.href = 'https://www.baidu.com'
    }
  })
}

