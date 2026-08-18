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
    const text = await res.text()
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function fetchLanding() {
  return request('/api/landing')
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
