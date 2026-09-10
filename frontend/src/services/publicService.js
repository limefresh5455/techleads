import apiClient from './apiClient'

export function fetchLanding() {
  return apiClient.get('/api/landing')
}

export function submitContact(payload) {
  return apiClient.post('/api/contact', payload)
}

export function searchTechnologies(q) {
  const query = encodeURIComponent(q || '')
  return apiClient.get(`/api/technologies/search?q=${query}`)
}

export function fetchTechnologies(q = '', offset = 0, limit = 200) {
  const searchParams = new URLSearchParams()
  if (q) searchParams.append('q', q)
  searchParams.append('offset', offset.toString())
  searchParams.append('limit', limit.toString())

  return apiClient.get(`/api/technologies?${searchParams.toString()}`)
}
