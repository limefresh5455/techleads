import { useState } from 'react'
import { login } from '../api'
import { useSiteData } from '../context/SiteDataContext'

export default function AdminLoginPage() {
  const { setAuth } = useSiteData()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(form)
      setAuth(data)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'mt-1.5 w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand'

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-hero to-page py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card p-8 rounded-3xl border border-border shadow-sm">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-ink">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-muted">
            Sign in with your administrator account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-ink">
              Email Address
              <input
                type="email"
                required
                className={field}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Password
              <input
                type="password"
                required
                className={field.replace('mt-1.5', '')}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-semibold text-on-brand bg-brand hover:bg-brand-dark focus:outline-none disabled:opacity-60 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </section>
  )
}
