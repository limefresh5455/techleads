import { Link } from 'react-router-dom'
import { PageHero } from '../../components'

export default function DevelopersPage() {
  return (
    <>
      <PageHero
        title="Developers"
        subtitle="API docs, authentication, rate limits, and integration examples."
        ctaLabel="Get API Access"
        ctaTo="/products/api-access"
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ['REST API', 'Query technologies, websites, and lead filters programmatically.'],
            ['Webhooks', 'Receive enrichment events when prospect tech stacks change.'],
            ['SDKs', 'Official client helpers for Python and JavaScript.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-border p-6">
              <h2 className="text-lg font-bold text-ink">{title}</h2>
              <p className="mt-2 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-border bg-inverse p-6 text-white md:p-8">
          <h3 className="text-xl font-bold">Ready to integrate?</h3>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Create an account to generate API keys, or contact sales for enterprise quotas.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/get-started"
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark"
            >
              Get Started
            </Link>
            <Link
              to="/contact-us"
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-card/10"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
