import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useSiteData } from '../../context/SiteDataContext'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useSiteData()
  const [error, setError] = useState('')
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const token = searchParams.get('token')
    const err = searchParams.get('error')
    const redirect = searchParams.get('redirect') || '/dashboard'

    if (err) {
      setError(err)
      return
    }
    if (!token) {
      setError('Missing auth token from Google')
      return
    }

    setAuth({
      token,
      user: {
        id: Number(searchParams.get('id') || 0),
        name: searchParams.get('name') || 'User',
        email: searchParams.get('email') || '',
        credits: Number(searchParams.get('credits') || 0),
      },
    })
    navigate(redirect.startsWith('/') ? redirect : '/dashboard', { replace: true })
  }, [searchParams, setAuth, navigate])

  if (error) {
    return (
      <section className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-ink">Google sign-in failed</h1>
        <p className="mt-3 text-sm text-red-600">{error}</p>
        <a href="/login" className="mt-6 inline-flex font-semibold text-brand hover:underline">
          Back to login
        </a>
      </section>
    )
  }

  return (
    <section className="mx-auto flex max-w-lg items-center justify-center gap-2 px-4 py-20 text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin text-brand" />
      Completing Google sign-in…
    </section>
  )
}
