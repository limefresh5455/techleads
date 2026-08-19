import { Link } from 'react-router-dom'

export default function FinalCta({ content }) {
  if (!content) return null

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="brand-panel rounded-3xl px-6 py-12 text-center text-ink md:px-12 md:py-14">
          <h2 className="reveal mx-auto max-w-3xl text-2xl font-extrabold tracking-tight md:text-3xl">
            {content.final_cta_title}
          </h2>
          <div className="reveal reveal-delay-1 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="rounded-xl bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink/90"
            >
              {content.final_cta_primary}
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl border border-ink/25 bg-white/40 px-5 py-3 text-sm font-semibold text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/70"
            >
              {content.final_cta_secondary}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
