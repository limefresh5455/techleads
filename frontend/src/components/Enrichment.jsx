import { Link } from 'react-router-dom'

const DEMO_ROWS = [
  { domain: 'stripe.com', tech: 'React, Stripe', email: 'press@stripe.com' },
  { domain: 'shopify.com', tech: 'Shopify, Ruby', email: 'press@shopify.com' },
  { domain: 'hubspot.com', tech: 'HubSpot, React', email: 'media@hubspot.com' },
  { domain: 'vercel.com', tech: 'Next.js, React', email: 'press@vercel.com' },
  { domain: 'notion.so', tech: 'React, Cloudflare', email: 'press@notion.so' },
]

export default function Enrichment({ content }) {
  if (!content) return null

  return (
    <section className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{content.enrich_eyebrow}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {content.enrich_title}
          </h2>
          <p className="mt-3 text-muted">{content.enrich_subtitle}</p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-ink">prospects.csv</p>
              <p className="text-xs text-muted">5 rows · Column: domain</p>
            </div>
            <button type="button" className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-on-brand">
              Enrich 5 rows
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Technologies</th>
                  <th className="px-4 py-3">Email</th>
                </tr>
              </thead>
              <tbody>
                {DEMO_ROWS.map((row) => (
                  <tr key={row.domain} className="border-t border-border/70">
                    <td className="px-4 py-3 font-medium text-ink">{row.domain}</td>
                    <td className="px-4 py-3 text-muted">{row.tech}</td>
                    <td className="px-4 py-3 text-muted">{row.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border px-4 py-3 text-xs text-muted">0 / 5 enriched · Download CSV</div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/signup"
            className="inline-flex rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark"
          >
            {content.enrich_cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
