import { request } from './api'

function createCrud(endpoint) {
  return {
    getAll: (params) => {
      const qs = params ? '?' + new URLSearchParams(params).toString() : ''
      return request(`/api/admin/${endpoint}${qs}`)
    },
    create: (data) => request(`/api/admin/${endpoint}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/admin/${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/api/admin/${endpoint}/${id}`, { method: 'DELETE' }),
  }
}

export const adminSiteContent = {
  get: () => request('/api/admin/site-content'),
  update: (data) => request('/api/admin/site-content', { method: 'PUT', body: JSON.stringify(data) })
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
  getAll: () => request('/api/admin/contact-messages'),
  delete: (id) => request(`/api/admin/contact-messages/${id}`, { method: 'DELETE' })
}
export const adminWebsites = createCrud('websites')

export const adminCustomDataBlocks = createCrud('custom-data-blocks')
export const adminUsers = {
  ...createCrud('users'),
  uploadAvatar: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = localStorage.getItem('tl_token')
    const host = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || ''
    const url = host ? `${host}/api/admin/upload-avatar` : '/api/admin/upload-avatar'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    })
    
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.detail || 'Avatar upload failed')
    }
    return data
  }
}

export const adminImports = {
  importTechnologies: () => request('/api/technologies/import-techleads', { method: 'POST' }),
  importWebsites: () => request('/api/websites/import-techleads', { method: 'POST' }),
  uploadCsv: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const token = localStorage.getItem('tl_token')
    const host = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') || ''
    const url = host ? `${host}/api/import/csv` : '/api/import/csv'

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    })
    
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data?.detail || 'CSV upload failed')
    }
    return data
  }
}

export const adminDashboard = {
  getStats: () => request('/api/admin/dashboard-stats')
}
