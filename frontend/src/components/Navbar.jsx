import { Link, NavLink, useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useSiteData } from '../context/SiteDataContext'
import ThemeToggle from './ThemeToggle'

function BrandMark({ content, to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-sm shadow-brand/30">
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-ink" aria-hidden="true">
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
  const items = (data.nav_items || []).filter(
    (item) => item.href !== '/custom-data' && item.label?.toLowerCase() !== 'custom data',
  )
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [toolsOpen, setToolsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const mobileMenuRef = useRef(null)
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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setOpen(false)
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
        scrolled ? 'bg-card/95 shadow-sm backdrop-blur' : 'bg-card'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <BrandMark content={content} to={user ? '/dashboard' : '/'} />

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
                  <div className="absolute left-0 top-full z-50 mt-2 min-w-64 rounded-xl border border-border bg-card p-2 shadow-lg">
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
          <ThemeToggle />
          {user ? (
            <>
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
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand shadow-sm shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            {user ? 'Dashboard' : content.nav_cta_label}
          </Link>
        </div>

        <div className="relative flex items-center gap-2 lg:hidden" ref={mobileMenuRef}>
          <ThemeToggle />
          <button
            type="button"
            className="rounded-lg border border-border p-2 text-ink hover:bg-surface"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-2 min-w-[260px] rounded-xl border border-border bg-card p-3 shadow-lg">
              <div className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <div key={item.id} className="mb-1 border-b border-border/50 pb-1.5 last:mb-0 last:border-0 last:pb-0">
                    <Link to={item.href} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface" onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                    {(item.children || []).map((child) => (
                      <Link key={child.id} to={child.href} className="block rounded-lg px-3 py-1.5 pl-6 text-sm text-muted hover:bg-surface hover:text-ink" onClick={() => setOpen(false)}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ))}
                
                <div className="my-1 h-px w-full bg-border" />
                
                {user ? (
                  <>
                    <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted">
                      Hi, {user.name.split(' ')[0]}
                    </div>
                    <button type="button" onClick={() => { setOpen(false); logout(); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30">
                      Log out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-surface">
                    {content.login_label}
                  </Link>
                )}
                
                <Link
                  to={user ? '/dashboard' : '/signup'}
                  onClick={() => setOpen(false)}
                  className="mt-1 block rounded-lg bg-brand px-3 py-2 text-center text-sm font-semibold text-on-brand hover:bg-brand-dark"
                >
                  {user ? 'Dashboard' : content.nav_cta_label}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
