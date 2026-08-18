import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { login } from '../api'
import { useSiteData } from '../context/SiteDataContext'

export default function LoginPage() {
  const { setAuth } = useSiteData()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/dashboard'
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
      navigate(from)
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-brand'

  return (
    <section className="bg-gradient-to-b from-[#fff7f2] to-white py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 lg:grid-cols-2 lg:px-6">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-2 text-muted">Sign in to access your account</p>

          <button
            type="button"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-ink hover:bg-surface"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M12 10.2v3.6h5.1c-.2 1.2-1.5 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 6.2 12 6.2c1.8 0 2.9.7 3.6 1.4l2.5-2.4C16.7 3.8 14.6 3 12 3 6.9 3 2.8 7.1 2.8 12.2S6.9 21.4 12 21.4c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.1-1.5H12z"
              />
            </svg>
            Sign in with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-border" />
            or continue with email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-ink">
              Email
              <input
                className={field}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Password
              <input
                className={field}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="font-semibold text-brand hover:underline">
              Create account
            </Link>
          </p>
        </div>

        <div className="rounded-3xl bg-brand p-8 text-white md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-white/80">Login</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Technology Insights</h2>
          <p className="mt-3 text-white/85">
            Gain access to powerful tech stack insights with your TechLeads.Ai account
          </p>
          <ul className="mt-8 space-y-4">
            {[
              'Technology detection across websites',
              'Lead generation by technology',
              'Competitive analysis tools',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/95">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-white/20">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
