import { Link } from 'react-router-dom'

export default function PageHero({ title, subtitle, ctaLabel = 'Get Started', ctaTo = '/get-started' }) {
  return (
    <section className="border-b border-border bg-gradient-to-b from-[#fff8f4] to-white py-14 md:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink md:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-muted">{subtitle}</p>}
        <Link
          to={ctaTo}
          className="mt-8 inline-flex rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  )
}
