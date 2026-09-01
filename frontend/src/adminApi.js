import { request } from './api'

function createCrud(endpoint) {
  return {
    getAll: () => request(`/api/admin/${endpoint}`),
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

export const adminCustomDataBlocks = createCrud('custom-data-blocks')
export const adminUsers = createCrud('users')
export const adminNavItems = createCrud('nav-items')
export const adminContactMessages = createCrud('contact-messages')
