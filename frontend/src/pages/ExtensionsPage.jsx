import { Link } from 'react-router-dom'
import PageHero from '../components/PageHero'

export default function ExtensionsPage() {
  return (
    <>
      <PageHero
        title="Extensions"
        subtitle="Reveal any website’s tech stack while you browse and enrich prospects without leaving the tab."
        ctaLabel="Start for free"
        ctaTo="/get-started"
      />
      <section className="mx-auto max-w-3xl px-4 py-14 text-center lg:px-6">
        <div className="rounded-2xl border border-border bg-surface p-8">
          <h2 className="text-2xl font-bold text-ink">Chrome Extension</h2>
          <p className="mt-3 text-muted">
            Install the TechLeads.Ai extension to detect technologies on any page and save leads in one click.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/get-started"
              className="rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-ink hover:bg-brand-dark"
            >
              Download Extension
            </Link>
            <Link
              to="/developers"
              className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
            >
              API Docs
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
