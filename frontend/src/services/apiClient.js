import axios from 'axios'

function resolveApiBase() {
  const fromEnv = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  if (fromEnv) return fromEnv
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

const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

const originalGet = apiClient.get
apiClient.get = async (url, config) => {
  // Use URL and query params as the cache key
  const key = url + JSON.stringify(config?.params || {})

  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key)
    if (Date.now() - timestamp < CACHE_TTL) {
      // Return cached data immediately
      return Promise.resolve(data)
    }
    cache.delete(key) // Expired
  }

  const response = await originalGet(url, config)
  cache.set(key, { data: response, timestamp: Date.now() })
  return response
}

const invalidateCache = () => cache.clear()

const originalPost = apiClient.post
apiClient.post = async (...args) => {
  const res = await originalPost(...args)
  invalidateCache()
  return res
}

const originalPut = apiClient.put
apiClient.put = async (...args) => {
  const res = await originalPut(...args)
  invalidateCache()
  return res
}

const originalDelete = apiClient.delete
apiClient.delete = async (...args) => {
  const res = await originalDelete(...args)
  invalidateCache()
  return res
}

export default apiClient
