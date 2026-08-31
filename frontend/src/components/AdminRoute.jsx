import { Link } from 'react-router-dom'
import { useSiteData } from '../context/SiteDataContext'
import AdminLoginPage from '../pages/AdminLoginPage'
import AdminLayout from '../layouts/AdminLayout'

export default function AdminRoute() {
  const { user, loading } = useSiteData()

  // Wait for initial load if necessary
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-page">
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  // If not logged in, show the Admin Login Page right here
  if (!user) {
    return <AdminLoginPage />
  }

  // If logged in but not an admin, show unauthorized
  if (user.role !== 'admin') {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-page text-ink font-sans p-4">
        <h1 className="text-3xl font-bold tracking-tight">Unauthorized</h1>
        <p className="mt-3 text-muted text-center max-w-md">
          You do not have permission to access the admin portal. If you believe this is an error, please contact support.
        </p>
        <Link to="/" className="mt-6 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark transition-colors">
          Return to Home
        </Link>
      </div>
    )
  }

  // If logged in and admin, render the Admin Layout containing nested routes
  return <AdminLayout />
}
