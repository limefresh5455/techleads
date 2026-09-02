import { Link } from 'react-router-dom'
import { useSiteData } from '../context/SiteDataContext'

export default function CustomDataPage() {
  const { data } = useSiteData()
  const blocks = data.custom_data_blocks || []

  return (
    <div className="bg-card">
      <section className="border-b border-border bg-gradient-to-b from-hero to-page py-14 md:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center lg:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">
            Custom Technology Data Solutions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Enterprise datasets, API access, lead generation, and white-label solutions — powered by
            LeadIntel.Ai detection engine.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark"
            >
              Contact Sales
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            >
              View Plans
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {blocks.map((block) => (
            <article
              key={block.id}
              className="rounded-2xl border border-border bg-surface p-6 transition hover:border-brand/40"
            >
              <h2 className="text-lg font-bold text-ink">{block.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{block.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface py-14">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-3xl font-extrabold text-ink">Talk to Sales</h2>
          <p className="mt-3 text-muted">
            Tell us what you need — we&apos;ll try to respond to sales inquiries within 24 hours.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark"
            >
              Contact Sales
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            >
              Self-Serve Plans
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            Email us at{' '}
            <a href="mailto:sales@leadintel.ai" className="font-semibold text-brand hover:underline">
              sales@leadintel.ai
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
