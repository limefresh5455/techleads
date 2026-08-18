const API_BASE = import.meta.env.VITE_API_URL || ''

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })
  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    try {
      const data = await res.json()
      message = data.detail || JSON.stringify(data)
    } catch {
      const text = await res.text()
      if (text) message = text
    }
    throw new Error(typeof message === 'string' ? message : 'Request failed')
  }
  return res.json()
}

export function fetchLanding() {
  return request('/api/landing')
}

export function fetchDashboardSearch({ q = '', technologies = [], match = 'any', page = 1, pageSize = 10 }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (technologies.length) params.set('technologies', technologies.join(','))
  params.set('match', match)
  params.set('page', String(page))
  params.set('page_size', String(pageSize))
  return request(`/api/dashboard/search?${params.toString()}`)
}

export function fetchWebsiteDetail(id) {
  return request(`/api/dashboard/websites/${id}`)
}

export function fetchFreeTool(slug) {
  return request(`/api/free-tools/${encodeURIComponent(slug)}`)
}

export function searchTechnologies(q) {
  const query = encodeURIComponent(q || '')
  return request(`/api/technologies/search?q=${query}`)
}

export function submitContact(payload) {
  return request('/api/contact', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function signup(payload) {
  return request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
