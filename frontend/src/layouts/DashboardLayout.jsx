import { Outlet } from 'react-router-dom'
import DashboardNavbar from '../components/DashboardNavbar'
import Footer from '../components/Footer'
import { useSiteData } from '../context/SiteDataContext'

export default function DashboardLayout() {
  const { data, loading, error } = useSiteData()

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas text-muted">
        <p>Loading dashboard…</p>
      </div>
    )
  }

  if (error || !data.content) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-4 text-center">
        <p className="text-red-600">{error || 'Failed to load dashboard data.'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      <DashboardNavbar />
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
