import { Route, Routes } from 'react-router-dom'
import { AdminRoute } from '../components'
import {
  AdminDashboardPage,
  AdminPlansPage,
  AdminBlogPostsPage,
  AdminFaqsPage,
  AdminFooterPage,
  AdminSocialLinksPage,
  AdminNavItemsPage,
  AdminContactMessagesPage,
  AdminLegalLinksPage,
  AdminUsersPage,
  AdminDashboardPreviewsPage,
  AdminFeatureHighlightsPage,
  AdminSiteContentPage,
  AdminImportPage,
  AdminCustomDataBlocksPage,
  AdminDetectGroupsPage,
  AdminCategoriesPage,
  AdminTechnologiesPage,
  AdminWebsitesPage,
  AdminProfilePage,
} from '../pages'

export default function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AdminRoute />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="profile" element={<AdminProfilePage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="plans" element={<AdminPlansPage />} />
        <Route path="site-content" element={<AdminSiteContentPage />} />
        <Route path="dashboard-previews" element={<AdminDashboardPreviewsPage />} />
        <Route path="feature-highlights" element={<AdminFeatureHighlightsPage />} />
        <Route path="blogs" element={<AdminBlogPostsPage />} />
        <Route path="faqs" element={<AdminFaqsPage />} />
        <Route path="nav-items" element={<AdminNavItemsPage />} />
        <Route path="footer" element={<AdminFooterPage />} />
        <Route path="social-links" element={<AdminSocialLinksPage />} />
        <Route path="legal-links" element={<AdminLegalLinksPage />} />
        <Route path="contact-messages" element={<AdminContactMessagesPage />} />
        <Route path="import" element={<AdminImportPage />} />
        <Route path="custom-data-blocks" element={<AdminCustomDataBlocksPage />} />
        <Route path="detect-groups" element={<AdminDetectGroupsPage />} />
        <Route path="categories" element={<AdminCategoriesPage />} />
        <Route path="technologies" element={<AdminTechnologiesPage />} />
        <Route path="websites" element={<AdminWebsitesPage />} />
      </Route>
    </Routes>
  )
}
