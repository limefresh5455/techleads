import { Link } from 'react-router-dom'

export default function ApiSection({ content }) {
  if (!content) return null

  return (
    <section className="bg-panel py-16 md:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 lg:grid-cols-2 lg:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{content.api_eyebrow}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {content.api_title}
          </h2>
          <p className="mt-4 text-muted">{content.api_subtitle}</p>
          <Link
            to="/api-docs"
            className="mt-8 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark"
          >
            {content.api_cta}
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border bg-inverse p-5 shadow-xl md:p-6">
          <div className="mb-4 flex gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <pre className="overflow-x-auto text-left text-xs leading-relaxed text-orange-100 md:text-sm">
            <code>{content.api_sample}</code>
          </pre>
        </div>
      </div>
    </section>
  )
}
