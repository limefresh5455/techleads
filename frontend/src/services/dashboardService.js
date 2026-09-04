import apiClient from './apiClient'

export function fetchDashboardSearch({
  q = '',
  technologies = [],
  match = 'any',
  page = 1,
  pageSize = 10,
}) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (technologies.length) params.set('technologies', technologies.join(','))
  params.set('match', match)
  params.set('page', String(page))
  params.set('page_size', String(pageSize))
  return apiClient.get(`/api/dashboard/search?${params.toString()}`)
}

export function exportDashboard({ q = '', technologies = [], match = 'any' }) {
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (technologies.length) params.set('technologies', technologies.join(','))
  params.set('match', match)
  return apiClient.post(`/api/dashboard/export?${params.toString()}`)
}

export function fetchWebsiteDetail(id, { refresh = false } = {}) {
  const params = refresh ? '?refresh=true' : ''
  return apiClient.get(`/api/dashboard/websites/${id}${params}`)
}

export function detectUrl(url) {
  return apiClient.post('/api/v1/detect', { url })
}

export function enrichUrls(urls) {
  return apiClient.post('/api/v1/enrich', { urls })
}
