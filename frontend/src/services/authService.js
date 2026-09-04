import apiClient from './apiClient'

export function signup(payload) {
  return apiClient.post('/api/auth/signup', payload)
}

export function login(payload) {
  return apiClient.post('/api/auth/login', payload)
}

export function sendOtp(payload) {
  return apiClient.post('/api/auth/send-otp', payload)
}

export function verifyOtp(payload) {
  return apiClient.post('/api/auth/verify-otp', payload)
}

export function resetPassword(payload) {
  return apiClient.post('/api/auth/reset-password', payload)
}
