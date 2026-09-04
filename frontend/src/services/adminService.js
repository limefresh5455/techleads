import apiClient from './apiClient'

function createCrud(endpoint) {
  return {
    getAll: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return apiClient.get(`/api/admin/${endpoint}${qs}`)
    },
    create: (data) => apiClient.post(`/api/admin/${endpoint}`, data),
    update: (id, data) => apiClient.put(`/api/admin/${endpoint}/${id}`, data),
    delete: (id) => apiClient.delete(`/api/admin/${endpoint}/${id}`),
  }
}

export const adminSiteContent = {
  get: () => apiClient.get('/api/admin/site-content'),
  update: (data) => apiClient.put('/api/admin/site-content', data),
}

export const adminFaqs = createCrud('faqs')
export const adminBlogPosts = createCrud('blog-posts')
export const adminSocialLinks = createCrud('social-links')
export const adminLegalLinks = createCrud('legal-links')
export const adminCategories = createCrud('categories')
export const adminTechnologies = createCrud('technologies')
export const adminPricingPlans = createCrud('pricing-plans')
export const adminFeatureHighlights = createCrud('feature-highlights')
export const adminDashboardPreviews = createCrud('dashboard-previews')
export const adminDetectGroups = createCrud('detect-groups')

export const adminFooterColumns = createCrud('footer-columns')
export const adminNavItems = createCrud('nav-items')
export const adminContactMessages = {
  getAll: () => apiClient.get('/api/admin/contact-messages'),
  delete: (id) => apiClient.delete(`/api/admin/contact-messages/${id}`),
}
export const adminWebsites = createCrud('websites')

export const adminCustomDataBlocks = createCrud('custom-data-blocks')
export const adminUsers = {
  ...createCrud('users'),
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      return await apiClient.post('/api/admin/upload-avatar', formData, {
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
  },
}

export const adminImports = {
  importTechnologies: () => apiClient.post('/api/technologies/import-techleads'),
  importWebsites: () => apiClient.post('/api/websites/import-techleads'),
  uploadCsv: async (file) => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      return await apiClient.post('/api/import/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    } catch (error) {
      if (error.message.startsWith('Request failed')) {
        throw new Error('CSV upload failed')
      }
      throw error
    }
  },
}

export const adminDashboard = {
  getStats: () => apiClient.get('/api/admin/dashboard-stats'),
}
