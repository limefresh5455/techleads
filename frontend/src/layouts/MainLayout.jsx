import { Outlet, Navigate } from 'react-router-dom'
import { Navbar } from '../components'
import { Footer } from '../components'
import { useSiteData } from '../context/SiteDataContext'

export default function MainLayout() {
  const { data, loading, error, user } = useSiteData()

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  if (loading) {
    return <div className="grid min-h-screen place-items-center bg-page text-muted">Loading…</div>
  }

  if (error || !data.content) {
    return (
      <div className="grid min-h-screen place-items-center bg-page px-4 text-center">
        <div>
          <p className="text-lg font-semibold text-ink">Unable to load site data</p>
          <p className="mt-2 text-sm text-muted">
            {error || 'No content returned from /api/landing'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-page">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer
        content={data.content}
        footerColumns={data.footer_columns}
        socialLinks={data.social_links}
        legalLinks={data.legal_links}
      />
    </div>
  )
}
