import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { signup } from '../api'
import GoogleAuthButton from '../components/GoogleAuthButton'
import { useSiteData } from '../context/SiteDataContext'

export default function SignupPage() {
  const { setAuth } = useSiteData()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await signup(form)
      setAuth(data)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  const field =
    'mt-1.5 w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-brand'

  return (
    <section className="bg-gradient-to-b from-[#fffbeb] to-white py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl items-stretch gap-8 px-4 lg:grid-cols-2 lg:px-6">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">Create an account</h1>
          <p className="mt-2 text-muted">Start your free trial and unlock technology insights</p>

          <GoogleAuthButton label="Sign up with Google" redirect="/dashboard" />

          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
            <span className="h-px flex-1 bg-border" />
            or continue with email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-ink">
              Full name
              <input
                className={field}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </label>
            <label className="block text-sm font-medium text-ink">
              Work email
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
                minLength={6}
                required
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-ink hover:bg-brand-dark disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Start My Free Trial'}
            </button>
            {error && <p className="text-center text-sm text-red-600">{error}</p>}
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand hover:underline">
              Sign In
            </Link>
          </p>
        </div>

        <div className="brand-panel rounded-3xl p-8 text-ink md:p-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-ink/70">Free Trial</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Technology Insights</h2>
          <p className="mt-3 text-ink/75">
            Create your TechLeads.Ai account and start detecting themes, CMS platforms, and apps in
            minutes.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              'Free theme and CMS detectors',
              'Lead generation by technology',
              'API access as you grow',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-ink/90">
                <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-ink/10">
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
