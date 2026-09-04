import apiClient from './apiClient'

export function createCheckoutSession(planSlug, quantity = 1) {
  return apiClient.post('/api/billing/checkout', { plan_slug: planSlug, quantity })
}

export function confirmCheckoutSession(sessionId) {
  const params = new URLSearchParams({ session_id: sessionId })
  return apiClient.get(`/api/billing/confirm?${params.toString()}`)
}
