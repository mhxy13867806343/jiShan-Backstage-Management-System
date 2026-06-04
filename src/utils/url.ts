// Helper function to concatenate relative image/avatar URLs with the base domain
export const getFullUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  // If it's already an absolute URL (http, https, double slash, data URI, or blob URL), return as-is
  if (/^(https?:|\/\/|data:|blob:)/i.test(path)) {
    return path
  }
  
  let baseUrl = import.meta.env.VITE_API_BASE_URL || ''
  if (!baseUrl) {
    if (import.meta.env.DEV) {
      baseUrl = 'http://127.0.0.1:8000'
    } else {
      baseUrl = window.location.origin
    }
  }
  
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const cleanPath = path.startsWith('/') ? path : '/' + path
  
  return `${cleanBase}${cleanPath}`
}
