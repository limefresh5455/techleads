import { Link } from 'react-router-dom'

export default function Enrichment({ content, rows = [] }) {
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

        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-border bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-ink">Prospect enrichment</p>
            <span className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white">+ Create List</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Technologies</th>
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">Traffic</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 4).map((row) => (
                  <tr key={row.id} className="border-t border-border/70">
                    <td className="px-4 py-3 font-medium text-ink">{row.domain}</td>
                    <td className="px-4 py-3 text-muted">{row.technologies}</td>
                    <td className="px-4 py-3 text-muted">{row.country}</td>
                    <td className="px-4 py-3 text-emerald-600">{row.traffic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/get-started"
            className="inline-flex rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            {content.enrich_cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
