import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useSiteData } from '../context/SiteDataContext'

function BrandMark({ content }) {
  return (
    <Link to="/" className="flex items-center gap-2.5 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-sm shadow-brand/30">
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-white" aria-hidden="true">
          <path
            fill="currentColor"
            d="M16 4.5c-1.2 0-2.2.7-2.6 1.8L8.2 22.1c-.2.6.2 1.2.8 1.2h2.3c.4 0 .8-.3.9-.7l1.1-3.4h6.4l1.1 3.4c.1.4.5.7.9.7h2.3c.6 0 1-.6.8-1.2l-5.2-15.8c-.4-1.1-1.4-1.8-2.6-1.8zm0 5.2 2.4 7.2h-4.8L16 9.7z"
          />
          <circle cx="25.2" cy="8.2" r="2.2" fill="currentColor" opacity="0.9" />
        </svg>
      </span>
      <span className="text-[1.05rem] font-extrabold tracking-tight text-ink">
        {content.brand_name}
        <span className="text-brand">{content.brand_suffix}</span>
      </span>
    </Link>
  )
}

export default function Navbar() {
  const { data, user, logout } = useSiteData()
  const content = data.content
  const items = data.nav_items || []
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setToolsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setToolsOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  if (!content) return null

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand' : 'text-ink/75 hover:text-brand'}`

  return (
    <header
      className={`sticky top-0 z-50 border-b border-border/60 transition-all ${
        scrolled ? 'bg-white/95 shadow-sm backdrop-blur' : 'bg-white'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <BrandMark content={content} />

        <nav className="hidden items-center gap-6 lg:flex">
          {items.map((item) =>
            item.has_dropdown ? (
              <div key={item.id} className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-ink/75 hover:text-brand"
                  onClick={() => setToolsOpen((v) => !v)}
                >
                  {item.label}
                  <ChevronDown className="h-4 w-4" />
                </button>
                {toolsOpen && (
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-64 rounded-xl border border-border bg-white p-2 shadow-lg">
                    <Link to={item.href} className="block rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-surface">
                      All Free Tools
                    </Link>
                    {(item.children || []).map((child) => (
                      <Link
                        key={child.id}
                        to={child.href}
                        className="block rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-surface hover:text-brand"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={item.id} to={item.href} className={linkClass}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-ink hover:text-brand"
              >
                Dashboard
              </Link>
              <span className="text-sm text-muted">Hi, {user.name.split(' ')[0]}</span>
              <button
                type="button"
                onClick={logout}
                className="text-sm font-semibold text-ink hover:text-brand"
              >
                Log out
              </button>
            </>
          ) : (
            <Link to="/login" className="text-sm font-semibold text-ink hover:text-brand">
              {content.login_label}
            </Link>
          )}
          <Link
            to={user ? '/dashboard' : '/signup'}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {user ? 'Dashboard' : content.nav_cta_label}
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden rounded-lg border border-border p-2"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {items.map((item) => (
              <div key={item.id}>
                <Link to={item.href} className="block py-2 text-sm font-medium text-ink">
                  {item.label}
                </Link>
                {(item.children || []).map((child) => (
                  <Link key={child.id} to={child.href} className="block py-1.5 pl-4 text-sm text-muted">
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" className="py-2 text-sm font-semibold text-brand">
                  Dashboard
                </Link>
                <button type="button" onClick={logout} className="py-2 text-left text-sm font-semibold">
                  Log out
                </button>
              </>
            ) : (
              <Link to="/login" className="py-2 text-sm font-semibold">
                {content.login_label}
              </Link>
            )}
            <Link
              to={user ? '/dashboard' : '/signup'}
              className="mt-2 rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {user ? 'Dashboard' : content.nav_cta_label}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
