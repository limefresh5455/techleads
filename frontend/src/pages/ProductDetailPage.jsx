import { useParams, Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

const DETAILS = {
  'technology-lookup': {
    title: 'Technology Lookup',
    subtitle: 'Search millions of websites by installed technology.',
  },
  'lead-lists': {
    title: 'Lead Lists',
    subtitle: 'Export precise B2B lists filtered by tech, geography, and size.',
  },
  'chrome-extension': {
    title: 'Chrome Extension',
    subtitle: 'See any site’s tech stack without leaving your browser tab.',
  },
  'api-access': {
    title: 'API Access',
    subtitle: 'Programmatic access to technology intelligence for your product.',
  },
}

export default function ProductDetailPage() {
  const { slug } = useParams()
  const detail = DETAILS[slug] || {
    title: 'Product',
    subtitle: 'Explore TechLeads.Ai products.',
  }

  return (
    <>
      <PageHero title={detail.title} subtitle={detail.subtitle} />
      <section className="mx-auto max-w-3xl px-4 py-12 text-center lg:px-6">
        <p className="text-muted">
          Start a free trial to unlock this product, or talk to sales for enterprise access.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/get-started"
            className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
          >
            Get Started
          </Link>
          <Link
            to="/products"
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            All Products
          </Link>
        </div>
      </section>
    </>
  )
}
