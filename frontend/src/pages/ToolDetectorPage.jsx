import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ChevronDown, Search, Sparkles, Shield, Zap } from 'lucide-react'
import { fetchFreeTool } from '../api'

const featureIcons = [Search, Sparkles, Zap, Shield]

export default function ToolDetectorPage() {
  const { slug: paramSlug } = useParams()
  const location = useLocation()
  const slug = paramSlug || location.pathname.replace(/^\//, '').split('/')[0]
  const [tool, setTool] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [url, setUrl] = useState('')
  const [openFaq, setOpenFaq] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    setOpenFaq(0)
    fetchFreeTool(slug)
      .then((data) => {
        if (!cancelled) setTool(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setTool(null)
          setError(err.message || 'Failed to load tool')
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) {
    return (
      <section className="py-24 text-center">
        <p className="text-muted">Loading…</p>
      </section>
    )
  }

  if (error || !tool) {
    return (
      <section className="mx-auto max-w-xl px-4 py-24 text-center lg:px-6">
        <h1 className="text-2xl font-bold text-ink">Tool not found</h1>
        <p className="mt-2 text-muted">{error || 'This detector is unavailable.'}</p>
        <Link to="/tools" className="mt-6 inline-block font-semibold text-brand hover:underline">
          Browse free tools
        </Link>
      </section>
    )
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fff7f2] via-white to-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,107,53,0.12),_transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center lg:px-6 lg:py-20">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">{tool.name}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted md:text-lg">{tool.description}</p>
          <form
            className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              className="w-full flex-1 rounded-xl border border-border bg-white px-4 py-3.5 text-sm outline-none focus:border-brand"
              placeholder="Enter website URL…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-xl bg-brand px-6 py-3.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {tool.cta_label || 'Analyze'}
            </button>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">{tool.popular_title}</h2>
          <p className="mt-3 text-muted">{tool.popular_subtitle}</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(tool.popular_items || []).map((item) => (
            <article key={item.id} className="rounded-2xl border border-border bg-white p-6">
              <h3 className="text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface/60">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink">{tool.features_title}</h2>
            <p className="mt-3 text-muted">{tool.features_subtitle}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {(tool.features || []).map((item, idx) => {
              const Icon = featureIcons[idx % featureIcons.length]
              return (
                <article key={item.id} className="rounded-2xl border border-border bg-white p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 lg:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink">{tool.faq_title}</h2>
          <p className="mt-3 text-muted">{tool.faq_subtitle}</p>
        </div>
        <div className="mt-10 space-y-3">
          {(tool.faqs || []).map((faq, idx) => {
            const open = openFaq === idx
            return (
              <div key={faq.id} className="rounded-xl border border-border bg-white">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(open ? -1 : idx)}
                >
                  <span className="font-semibold text-ink">{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-muted transition ${open ? 'rotate-180' : ''}`}
                  />
                </button>
                {open && (
                  <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                    {faq.answer}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="bg-brand">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center text-white lg:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight md:text-4xl">{tool.final_cta_title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">{tool.final_cta_subtitle}</p>
          <Link
            to="/"
            className="mt-8 inline-flex rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-brand hover:bg-white/95"
          >
            {tool.final_cta_label || 'Scan Your Website Now'}
          </Link>
        </div>
      </section>
    </>
  )
}
