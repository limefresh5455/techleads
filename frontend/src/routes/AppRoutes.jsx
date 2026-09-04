import { Route, Routes, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import DashboardLayout from '../layouts/DashboardLayout'
import { ProtectedRoute } from '../components'
import { GuestRoute } from '../components'
import { useSiteData } from '../context/SiteDataContext'
import {
  HomePage,
  DirectoryPage,
  BlogPage,
  PricingPage,
  CustomDataPage,
  TechnologiesPage,
  CategoriesPage,
  ContactPage,
  LoginPage,
  SignupPage,
  AuthCallbackPage,
  ForgotPasswordPage,
  DashboardPage,
  AccountPage,
  LegalPage,
} from '../pages'

function GetStartedRedirect() {
  const { user } = useSiteData()
  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }
  return <Navigate to={user ? '/dashboard' : '/signup'} replace />
}

export default function AppRoutes() {
  return (
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
        <Route path="technologies" element={<TechnologiesPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="pricing" element={<PricingPage />} />
        <Route path="custom-data" element={<CustomDataPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="contact-us" element={<Navigate to="/contact" replace />} />
        <Route
          path="login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="signin"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="signup"
          element={
            <GuestRoute>
              <SignupPage />
            </GuestRoute>
          }
        />
        <Route
          path="forgot-password"
          element={
            <GuestRoute>
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />
        <Route
          path="auth/callback"
          element={
            <GuestRoute>
              <AuthCallbackPage />
            </GuestRoute>
          }
        />
        <Route path="get-started" element={<GetStartedRedirect />} />
        <Route
          path="privacy"
          element={
            <LegalPage
              title="Privacy Policy"
              body={[
                'LeadIntel.Ai collects account and usage information to provide technology detection and lead enrichment services.',
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
                'By using LeadIntel.Ai you agree to use the platform lawfully and respect rate limits and API terms.',
                'Paid plans renew according to the billing cycle selected at checkout unless cancelled.',
              ]}
            />
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
