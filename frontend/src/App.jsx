import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import { SiteDataProvider, useSiteData } from './context/SiteDataContext'
import MainLayout from './layouts/MainLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import GuestRoute from './components/GuestRoute'
import HomePage from './pages/HomePage'
import DirectoryPage from './pages/DirectoryPage'
import BlogPage from './pages/BlogPage'
import PricingPage from './pages/PricingPage'
import CustomDataPage from './pages/CustomDataPage'
import TechnologiesPage from './pages/TechnologiesPage'
import CategoriesPage from './pages/CategoriesPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import AccountPage from './pages/AccountPage'
import LegalPage from './pages/LegalPage'

import AdminRoute from './components/AdminRoute'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminPlansPage from './pages/AdminPlansPage'
import AdminBlogPostsPage from './pages/AdminBlogPostsPage'
import AdminFaqsPage from './pages/AdminFaqsPage'
import AdminFooterPage from './pages/AdminFooterPage'
import AdminSocialLinksPage from './pages/AdminSocialLinksPage'
import AdminNavItemsPage from './pages/AdminNavItemsPage'
import AdminLegalLinksPage from './pages/AdminLegalLinksPage'
import AdminCreditPurchasesPage from './pages/AdminCreditPurchasesPage'
import AdminDashboardPreviewsPage from './pages/AdminDashboardPreviewsPage'
import AdminFeatureHighlightsPage from './pages/AdminFeatureHighlightsPage'


function GetStartedRedirect() {
  const { user } = useSiteData()
  return <Navigate to={user ? '/dashboard' : '/signup'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteDataProvider>
        <Routes>
          <Route path="admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="credit-purchases" element={<AdminCreditPurchasesPage />} />
            <Route path="plans" element={<AdminPlansPage />} />
            <Route path="dashboard-previews" element={<AdminDashboardPreviewsPage />} />
            <Route path="feature-highlights" element={<AdminFeatureHighlightsPage />} />
            <Route path="blogs" element={<AdminBlogPostsPage />} />
            <Route path="faqs" element={<AdminFaqsPage />} />
            <Route path="nav-items" element={<AdminNavItemsPage />} />
            <Route path="footer" element={<AdminFooterPage />} />
            <Route path="social-links" element={<AdminSocialLinksPage />} />
            <Route path="legal-links" element={<AdminLegalLinksPage />} />
          </Route>
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="account" element={<AccountPage />} />
          </Route>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="directory" element={<DirectoryPage />} />
            <Route path="technologies" element={<TechnologiesPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="blog" element={<BlogPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="custom-data" element={<CustomDataPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="contact-us" element={<Navigate to="/contact" replace />} />
            <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="signin" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
            <Route path="forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="auth/callback" element={<AuthCallbackPage />} />
            <Route path="get-started" element={<GetStartedRedirect />} />
            <Route
              path="privacy"
              element={
                <LegalPage
                  title="Privacy Policy"
                  body={[
                    'TechLeads.Ai collects account and usage information to provide technology detection and lead enrichment services.',
                    'We do not sell personal data. Contact us to request access or deletion of your account information.',
                  ]}
                />
              }
            />
            <Route
              path="terms"
              element={
                <LegalPage
                  title="Terms of Service"
                  body={[
                    'By using TechLeads.Ai you agree to use the platform lawfully and respect rate limits and API terms.',
                    'Paid plans renew according to the billing cycle selected at checkout unless cancelled.',
                  ]}
                />
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </SiteDataProvider>
    </BrowserRouter>
  )
}
