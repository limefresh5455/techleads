import { Link } from 'react-router-dom'

export default function PageHero({ title, subtitle, ctaLabel = 'Get Started', ctaTo = '/get-started' }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-hero to-page py-14 md:py-20">
      <div className="brand-glow pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 text-center lg:px-6">
        <h1 className="reveal text-4xl font-extrabold tracking-tight text-ink md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="reveal reveal-delay-1 mx-auto mt-4 max-w-2xl text-muted">{subtitle}</p>
        )}
        {ctaLabel && (
          <Link
            to={ctaTo}
            className="reveal reveal-delay-2 mt-8 inline-flex rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-on-brand shadow-md shadow-brand/30 transition hover:-translate-y-0.5 hover:bg-brand-dark"
          >
            {ctaLabel}
          </Link>
        )}
      </div>
    </section>
  )
}
