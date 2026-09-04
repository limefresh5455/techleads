import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Menu, X } from 'lucide-react'
import { useSiteData } from '../context/SiteDataContext'
import ThemeToggle from './ThemeToggle'

function BrandMark({ content }) {
  return (
    <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand shadow-sm shadow-brand/30">
        <svg viewBox="0 0 32 32" className="h-5 w-5 text-ink" aria-hidden="true">
          <path
            fill=""
            d="M16 4.5c-1.2 0-2.2.7-2.6 1.8L8.2 22.1c-.2.6.2 1.2.8 1.2h2.3c.4 0 .8-.3.9-.7l1.1-3.4h6.4l1.1 3.4c.1.4.5.7.9.7h2.3c.6 0 1-.6.8-1.2l-5.2-15.8c-.4-1.1-1.4-1.8-2.6-1.8zm0 5.2 2.4 7.2h-4.8L16 9.7z"
          />
          <circle cx="25.2" cy="8.2" r="2.2" fill="" opacity="0.9" />
        </svg>
      </span>
      <span className="text-[1.05rem] font-extrabold tracking-tight text-ink">
        {content.brand_name}
        <span className="text-brand-dark">{content.brand_suffix}</span>
      </span>
    </Link>
  )
}

export default function DashboardNavbar() {
  const { data, user, logout } = useSiteData()
  const content = data.content
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const mobileMenuRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  if (!content || !user) return null

  const initial = user.name?.trim()?.[0]?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <BrandMark content={content} />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Desktop Right Side Content */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/pricing"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-dark"
            >
              Upgrade
            </Link>
            <span className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink">
              {user.credits?.toLocaleString?.() ?? user.credits ?? 0} credits
            </span>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-border px-2 py-1.5 hover:bg-surface"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-bold text-on-brand">
                    {initial}
                  </span>
                )}
                <span className="max-w-[120px] truncate text-sm font-medium text-ink">
                  {user.name}
                </span>
                <ChevronDown className="h-4 w-4 text-muted" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 min-w-44 rounded-xl border border-border bg-card p-2 shadow-lg">
                  <Link
                    to="/account"
                    className="block rounded-lg px-3 py-2 text-sm text-ink hover:bg-surface"
                    onClick={() => setMenuOpen(false)}
                  >
                    Manage account
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      logout()
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle Button and Dropdown */}
          <div className="relative lg:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              className="rounded-lg border border-border p-2 text-ink hover:bg-surface"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {mobileMenuOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 min-w-[260px] rounded-xl border border-border bg-card p-3 shadow-lg">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-surface/50 p-2.5">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt=""
                        className="h-9 w-9 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-sm font-bold text-on-brand">
                        {initial}
                      </span>
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-ink">{user.name}</span>
                      <span className="text-xs text-muted">
                        {user.credits?.toLocaleString?.() ?? user.credits ?? 0} credits
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="mt-1 block rounded-lg bg-brand px-3 py-2 text-center text-sm font-semibold text-on-brand hover:bg-brand-dark"
                  >
                    Upgrade
                  </Link>

                  <Link
                    to="/account"
                    className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-ink hover:bg-surface"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Manage account
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      logout()
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
