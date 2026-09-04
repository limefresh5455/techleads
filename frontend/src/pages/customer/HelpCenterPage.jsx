import { Link } from 'react-router-dom'
import { PageHero } from '../../components'

const TOPICS = [
  'Getting started with LeadIntel.Ai',
  'How credits and lookups work',
  'Exporting lead lists to CSV',
  'Using the Chrome extension',
  'Billing and plan upgrades',
]

export default function HelpCenterPage() {
  return (
    <>
      <PageHero
        title="Help Center"
        subtitle="Find answers, troubleshooting tips, and product guides."
        ctaLabel="Contact Support"
        ctaTo="/contact-us"
      />
      <section className="mx-auto max-w-3xl px-4 py-14 lg:px-6">
        <ul className="space-y-3">
          {TOPICS.map((topic) => (
            <li
              key={topic}
              className="rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-ink"
            >
              {topic}
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-muted">
          Still stuck?{' '}
          <Link to="/contact-us" className="font-semibold text-brand hover:underline">
            Contact Us
          </Link>
        </p>
      </section>
    </>
  )
}
