import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchLanding } from '../api'

const empty = {
  content: null,
  nav_items: [],
  technologies: [],
  popular_technologies: [],
  categories: [],
  pricing_plans: [],
  feature_highlights: [],
  dashboard_previews: [],
  detect_groups: [],
  trust_logos: [],
  footer_columns: [],
  social_links: [],
  legal_links: [],
  free_tools: [],
  blog_posts: [],
}

const SiteDataContext = createContext({
  data: empty,
  loading: true,
  error: '',
  user: null,
  setAuth: () => {},
  logout: () => {},
})

export function SiteDataProvider({ children }) {
  const [data, setData] = useState(empty)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tl_user') || 'null')
    } catch {
      return null
    }
  })

  useEffect(() => {
    fetchLanding()
      .then((payload) => {
        setData(payload)
        setError('')
      })
      .catch(() => setError('Failed to load data from API. Is the FastAPI server running?'))
      .finally(() => setLoading(false))
  }, [])

  function setAuth(payload) {
    localStorage.setItem('tl_token', payload.token)
    localStorage.setItem('tl_user', JSON.stringify(payload.user))
    setUser(payload.user)
  }

  function logout() {
    localStorage.removeItem('tl_token')
    localStorage.removeItem('tl_user')
    setUser(null)
  }

  const value = useMemo(
    () => ({ data, loading, error, user, setAuth, logout }),
    [data, loading, error, user],
  )

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}

export function useSiteData() {
  return useContext(SiteDataContext)
}
