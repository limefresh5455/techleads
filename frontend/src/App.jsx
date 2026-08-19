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
import ToolsPage from './pages/ToolsPage'
import ToolDetectorPage from './pages/ToolDetectorPage'
import ApiDocsPage from './pages/ApiDocsPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPage from './pages/DashboardPage'
import AccountPage from './pages/AccountPage'
import LegalPage from './pages/LegalPage'

const DETECTOR_SLUGS = [
  'shopify-theme-detector',
  'wordpress-theme-detector',
  'cms-detector',
  'shopify-app-detector',
]

function ToolsRedirect() {
  const { slug } = useParams()
  return <Navigate to={`/${slug}`} replace />
}

function GetStartedRedirect() {
  const { user } = useSiteData()
  return <Navigate to={user ? '/dashboard' : '/signup'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <SiteDataProvider>
        <Routes>
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
            <Route path="blog" element={<BlogPage />} />
            <Route path="pricing" element={<PricingPage />} />
            <Route path="custom-data" element={<CustomDataPage />} />
            <Route path="tools" element={<ToolsPage />} />
            <Route path="tools/:slug" element={<ToolsRedirect />} />
            {DETECTOR_SLUGS.map((slug) => (
              <Route key={slug} path={slug} element={<ToolDetectorPage />} />
            ))}
            <Route path="api-docs" element={<ApiDocsPage />} />
            <Route path="developers" element={<Navigate to="/api-docs" replace />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="contact-us" element={<Navigate to="/contact" replace />} />
            <Route path="login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="signin" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="signup" element={<GuestRoute><SignupPage /></GuestRoute>} />
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
