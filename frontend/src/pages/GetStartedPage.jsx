import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'
import { useSiteData } from '../context/SiteDataContext'

export default function GetStartedPage() {
  const { data } = useSiteData()
  const plans = data.pricing_plans || []

  return (
    <>
      <PageHero
        title="Get Started"
        subtitle="Create your free account and start finding websites by technology today."
        ctaLabel="View Pricing"
        ctaTo="/pricing"
      />
      <section className="mx-auto max-w-3xl px-4 py-14 lg:px-6">
        <form
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 md:p-8"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="Work email"
            type="email"
            required
          />
          <input
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="Full name"
            required
          />
          <input
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:border-brand"
            placeholder="Company website"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-on-brand hover:bg-brand-dark"
          >
            Create Free Account
          </button>
        </form>

        {plans.length > 0 && (
          <p className="mt-6 text-center text-sm text-muted">
            Prefer a paid plan?{' '}
            <Link to="/pricing" className="font-semibold text-brand hover:underline">
              Compare pricing
            </Link>
          </p>
        )}
      </section>
    </>
  )
}
