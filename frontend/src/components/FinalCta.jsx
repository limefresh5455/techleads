import { Link } from 'react-router-dom'

export default function FinalCta({ content }) {
  if (!content) return null

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="rounded-3xl bg-brand px-6 py-12 text-center text-white md:px-12 md:py-14">
          <h2 className="mx-auto max-w-3xl text-2xl font-extrabold tracking-tight md:text-3xl">
            {content.final_cta_title}
          </h2>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/get-started"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand hover:bg-white/90"
            >
              {content.final_cta_primary}
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
            >
              {content.final_cta_secondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
