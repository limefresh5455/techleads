import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function ApiDocsPage() {
  const { data } = useSiteData()
  const content = data.content

  return (
    <>
      <PageHero
        title="API Docs"
        subtitle={content?.api_subtitle || 'Detect tech stacks programmatically at scale.'}
        ctaLabel="Get API Access"
        ctaTo="/signup"
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-ink">{content?.api_title}</h2>
            <p className="mt-3 text-muted">{content?.api_subtitle}</p>
            <ul className="mt-6 space-y-2 text-sm text-ink/80">
              <li>• POST /v1/detect — analyze a URL</li>
              <li>• Bulk enrichment endpoints</li>
              <li>• API keys for Pro & Enterprise plans</li>
            </ul>
            <Link
              to="/signup"
              className="mt-8 inline-flex rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              {content?.api_cta || 'Get API Access'}
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border bg-ink p-5 md:p-6">
            <pre className="overflow-x-auto text-xs leading-relaxed text-orange-100 md:text-sm">
              <code>{content?.api_sample}</code>
            </pre>
          </div>
        </div>
      </section>
    </>
  )
}
