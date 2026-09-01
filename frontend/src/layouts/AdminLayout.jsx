import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { 
  LogOut, Home, CreditCard, FileText, 
  LayoutTemplate, HelpCircle, Share2, Navigation, Shield,
  ShoppingCart, LayoutDashboard, Sparkles, Users, MessageSquare, Menu, X, Globe
} from 'lucide-react'
import { useSiteData } from '../context/SiteDataContext'
import ThemeToggle from '../components/ThemeToggle'

export default function AdminLayout() {
  const { logout, user, data } = useSiteData()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const links = [
    { to: '/admin', icon: Home, label: 'Dashboard' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/plans', icon: CreditCard, label: 'Plans' },
    { to: '/admin/dashboard-previews', icon: LayoutDashboard, label: 'Dashboard Previews' },
    { to: '/admin/site-content', icon: Globe, label: 'Site Content' },
    { to: '/admin/feature-highlights', icon: Sparkles, label: 'Feature Highlights' },
    { to: '/admin/blogs', icon: FileText, label: 'Blogs' },
    { to: '/admin/faqs', icon: HelpCircle, label: 'FAQs' },
    { to: '/admin/footer', icon: LayoutTemplate, label: 'Footer' },
    { to: '/admin/social-links', icon: Share2, label: 'Social Links' },
    { to: '/admin/contact-messages', icon: MessageSquare, label: 'Messages' },
    { to: '/admin/nav-items', icon: Navigation, label: 'Nav Items' },
    { to: '/admin/legal-links', icon: Shield, label: 'Legal Links' },
  ]

  return (
    <div className="flex h-screen bg-canvas overflow-hidden relative">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-card flex flex-col transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-border justify-between lg:justify-start shrink-0">
          <Link to="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setSidebarOpen(false)}>
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand shadow-sm shadow-brand/30">
              <svg viewBox="0 0 32 32" className="h-4 w-4 text-ink" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M16 4.5c-1.2 0-2.2.7-2.6 1.8L8.2 22.1c-.2.6.2 1.2.8 1.2h2.3c.4 0 .8-.3.9-.7l1.1-3.4h6.4l1.1 3.4c.1.4.5.7.9.7h2.3c.6 0 1-.6.8-1.2l-5.2-15.8c-.4-1.1-1.4-1.8-2.6-1.8zm0 5.2 2.4 7.2h-4.8L16 9.7z"
                />
                <circle cx="25.2" cy="8.2" r="2.2" fill="currentColor" opacity="0.9" />
              </svg>
            </span>
            <span className="text-base font-extrabold tracking-tight text-ink">
              {data?.content?.brand_name || 'LeadIntel'}
              <span className="text-brand">{data?.content?.brand_suffix || '.Ai'}</span>
            </span>
          </Link>
          <button className="lg:hidden text-muted hover:text-ink" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/admin'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand text-on-brand shadow-sm'
                    : 'text-muted hover:bg-surface hover:text-ink'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border space-y-2 shrink-0">
          <div className="flex items-center justify-between px-1">
            <div className="flex-1 truncate pr-2">
               <p className="truncate text-sm font-semibold text-ink">{user?.name}</p>
               <p className="truncate text-xs text-muted">{user?.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-canvas">
        {/* Mobile Header */}
        <div className="h-16 flex items-center px-4 border-b border-border bg-card lg:hidden shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-muted hover:text-ink hover:bg-surface rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold text-ink">Admin Panel</span>
        </div>
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
