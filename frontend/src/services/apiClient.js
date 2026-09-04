import axios from 'axios'

function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
  // Production frontend on Render → backend API service
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    if (host === 'techleads-1.onrender.com' || host.endsWith('.onrender.com')) {
      return 'https://techleads.onrender.com'
    }
  }
  return ''
}

const apiClient = axios.create({
  baseURL: resolveApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('tl_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    let message = `Request failed: ${error.response?.status || 'Unknown'}`
    const data = error.response?.data

    const raw = typeof data === 'string' ? data : data ? JSON.stringify(data) : ''

    if (data?.detail) {
      message = Array.isArray(data.detail)
        ? data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
        : String(data.detail)
    } else if (typeof data === 'string' && data) {
      message = data
    } else if (raw) {
      message = raw.slice(0, 300)
    }

    return Promise.reject(new Error(message))
  }
)

export default apiClient
