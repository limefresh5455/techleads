const API_BASE = import.meta.env.VITE_API_URL || ''

function authHeaders() {
  const token = localStorage.getItem('tl_token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
    ...options,
  })

  const raw = await res.text()
  let data = null
  if (raw) {
    try {
      data = JSON.parse(raw)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    let message = `Request failed: ${res.status}`
    if (data?.detail) {
      message = Array.isArray(data.detail)
        ? data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
        : String(data.detail)
    } else if (typeof data === 'string') {
      message = data
    } else if (raw) {
      message = raw.slice(0, 300)
    }
    throw new Error(message)
  }

  return data
}

export function fetchLanding() {
  return request('/api/landing')
}

export function fetchMe() {
  return request('/api/me')
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

export function exportDashboard({ q = '', technologies = [], match = 'any', limit = 10 }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (technologies.length) params.set('technologies', technologies.join(','))
  params.set('match', match)
  params.set('limit', String(limit))
  return request(`/api/dashboard/export?${params.toString()}`, { method: 'POST' })
}

export function fetchWebsiteDetail(id, { refresh = false } = {}) {
  const params = refresh ? '?refresh=true' : ''
  return request(`/api/dashboard/websites/${id}${params}`)
}

export function detectUrl(url) {
  return request('/api/v1/detect', {
    method: 'POST',
    body: JSON.stringify({ url }),
  })
}

export function enrichUrls(urls) {
  return request('/api/v1/enrich', {
    method: 'POST',
    body: JSON.stringify({ urls }),
  })
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

export function createCheckoutSession(planSlug) {
  return request('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ plan_slug: planSlug }),
  })
}

export function confirmCheckoutSession(sessionId) {
  const params = new URLSearchParams({ session_id: sessionId })
  return request(`/api/billing/confirm?${params.toString()}`)
}
