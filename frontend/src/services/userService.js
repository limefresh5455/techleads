import apiClient from './apiClient'

export function fetchMe() {
  return apiClient.get('/api/me')
}

export function updateProfile({ name }) {
  return apiClient.patch('/api/me', { name })
}

export async function uploadMyAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)

  try {
    return await apiClient.post('/api/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  } catch (error) {
    if (error.message.startsWith('Request failed')) {
      throw new Error('Avatar upload failed')
    }
    throw error
  }
}

export function removeMyAvatar() {
  return apiClient.delete('/api/me/avatar')
}

export function changePassword({ current_password, new_password }) {
  return apiClient.post('/api/me/password', { current_password, new_password })
}
