import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, Search } from 'lucide-react'
import { detectUrl } from '../api'
import { useSiteData } from '../context/SiteDataContext'

export default function Hero({ content, dashboardPreviews = [] }) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { user } = useSiteData()

  if (!content) return null

  async function onSubmit(e) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await detectUrl(query.trim())
      if (user) {
        navigate(`/dashboard?site=${result.website.id}`)
      } else {
        navigate(`/login?redirect=/dashboard&site=${result.website.id}`)
      }
    } catch (err) {
      setError(err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#fff7f2] via-white to-white pb-12 pt-12 md:pt-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,107,53,0.14),_transparent_55%)]" />
      <div className="relative mx-auto max-w-5xl px-4 text-center lg:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl md:text-[3.25rem] md:leading-tight">
          {content.hero_title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted md:text-lg">{content.hero_subtitle}</p>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
        >
          <div className="flex flex-1 items-center rounded-xl border border-border bg-white px-4 shadow-sm">
            <Search className="h-4 w-4 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={content.hero_search_placeholder}
              className="w-full bg-transparent px-3 py-3.5 text-sm outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Analyzing…' : content.hero_search_cta}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      <div className="relative mx-auto mt-12 max-w-6xl px-4 lg:px-6">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-brand/10">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
            <p className="text-sm font-semibold text-ink">TechLeads.Ai Dashboard</p>
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">Live</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface/80 text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3 font-semibold">Website</th>
                  <th className="px-4 py-3 font-semibold">Categories</th>
                  <th className="px-4 py-3 font-semibold">Technologies</th>
                  <th className="px-4 py-3 font-semibold">Country</th>
                  <th className="px-4 py-3 font-semibold">Traffic</th>
                </tr>
              </thead>
              <tbody>
                {dashboardPreviews.map((row) => (
                  <tr key={row.id} className="border-t border-border/70">
                    <td className="px-4 py-3 font-medium text-ink">{row.domain}</td>
                    <td className="px-4 py-3 text-muted">{row.categories}</td>
                    <td className="px-4 py-3 text-muted">{row.technologies}</td>
                    <td className="px-4 py-3 text-muted">{row.country}</td>
                    <td className="px-4 py-3 text-emerald-600">{row.traffic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {content.hero_secondary_cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/directory"
            className="inline-flex rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            Explore Our Database
          </Link>
        </div>
      </div>
    </section>
  )
}
