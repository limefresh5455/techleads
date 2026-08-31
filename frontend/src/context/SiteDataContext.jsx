import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { fetchLanding, fetchMe } from '../api'

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

  footer_columns: [],
  social_links: [],
  legal_links: [],

  blog_posts: [],
  faqs: [],
  custom_data_blocks: [],
}

const SiteDataContext = createContext({
  data: empty,
  loading: true,
  error: '',
  user: null,
  setAuth: () => {},
  updateUser: () => {},
  updateUserCredits: () => {},
  logout: () => {},
  refreshData: () => {},
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

  const refreshData = useCallback(() => {
    return fetchLanding()
      .then((payload) => {
        setData(payload)
        setError('')
      })
      .catch(() => setError('Failed to load data from API. Is the FastAPI server running?'))
  }, [])

  useEffect(() => {
    refreshData().finally(() => setLoading(false))

    const token = localStorage.getItem('tl_token')
    if (token) {
      fetchMe()
        .then((meData) => {
          if (meData) {
            setUser((prev) => {
              const merged = { ...(prev || {}), ...meData }
              localStorage.setItem('tl_user', JSON.stringify(merged))
              return merged
            })
          }
        })
        .catch(err => console.error("Failed to fetch user profile", err))
    }
  }, [refreshData])

  const setAuth = useCallback((payload) => {
    localStorage.setItem('tl_token', payload.token)
    localStorage.setItem('tl_user', JSON.stringify(payload.user))
    setUser(payload.user)
    
    fetchMe()
      .then((meData) => {
        if (meData) {
          setUser((prev) => {
            const merged = { ...(prev || {}), ...meData }
            localStorage.setItem('tl_user', JSON.stringify(merged))
            return merged
          })
        }
      })
      .catch(err => console.error("Failed to fetch user profile after login", err))
  }, [])

  const updateUserCredits = useCallback((credits) => {
    setUser((prev) => {
      if (!prev || prev.credits === credits) return prev
      const next = { ...prev, credits }
      localStorage.setItem('tl_user', JSON.stringify(next))
      return next
    })
  }, [])

  const updateUser = useCallback((nextUser) => {
    setUser((prev) => {
      const merged = { ...(prev || {}), ...nextUser }
      localStorage.setItem('tl_user', JSON.stringify(merged))
      return merged
    })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('tl_token')
    localStorage.removeItem('tl_user')
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ data, loading, error, user, setAuth, updateUser, updateUserCredits, logout, refreshData }),
    [
      data,
      loading,
      error,
      user,
      setAuth,
      updateUser,
      updateUserCredits,
      logout,
      refreshData,
    ]
  )

  return <SiteDataContext.Provider value={value}>{children}</SiteDataContext.Provider>
}

export function useSiteData() {
  return useContext(SiteDataContext)
}
