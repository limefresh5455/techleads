import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

const PRODUCT_CARDS = [
  {
    path: '/products/technology-lookup',
    title: 'Technology Lookup',
    description: 'Discover which websites run any technology in seconds.',
  },
  {
    path: '/products/lead-lists',
    title: 'Lead Lists',
    description: 'Build targeted prospect lists filtered by tech stack and firmographics.',
  },
  {
    path: '/products/chrome-extension',
    title: 'Chrome Extension',
    description: 'Reveal tech stacks while you browse and enrich prospects live.',
  },
  {
    path: '/products/api-access',
    title: 'API Access',
    description: 'Integrate technology intelligence into your CRM and workflows.',
  },
]

export default function ProductsPage() {
  const { data } = useSiteData()
  const features = data.feature_highlights || []

  return (
    <>
      <PageHero
        title="Products"
        subtitle="Everything you need to find websites by technology and turn them into qualified leads."
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {PRODUCT_CARDS.map((card) => (
            <Link
              key={card.path}
              to={card.path}
              className="rounded-2xl border border-border bg-surface p-6 transition hover:border-brand/40 hover:shadow-sm"
            >
              <h2 className="text-xl font-bold text-ink">{card.title}</h2>
              <p className="mt-2 text-sm text-muted">{card.description}</p>
            </Link>
          ))}
        </div>
        {features.length > 0 && (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.id} className="rounded-2xl border border-border p-5">
                <h3 className="font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm text-muted">{f.description}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
