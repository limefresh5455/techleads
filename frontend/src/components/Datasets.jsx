import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Icon, formatCount } from './icons'

export default function Datasets({ technologies = [], content, showHeader = true }) {
  if (!content) return null

  return (
    <section id="datasets" className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              {content.datasets_title}
            </h2>
            <p className="mt-3 text-muted">{content.datasets_subtitle}</p>
          </div>
        )}

        <div className={`${showHeader ? 'mt-10' : ''} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
          {technologies.map((tech) => (
            <Link
              key={tech.id}
              to="/technologies"
              className="group flex items-start justify-between rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
            >
              <div>
                <div
                  className="mb-4 grid h-11 w-11 place-items-center rounded-xl"
                  style={{ backgroundColor: `${tech.icon_color}22` }}
                >
                  <Icon name={tech.icon} className="h-5 w-5" style={{ color: tech.icon_color }} />
                </div>
                <h3 className="text-lg font-bold text-ink">{tech.name}</h3>
                <p className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
                  {formatCount(tech.website_count)}
                </p>
                <p className="mt-1 text-xs font-medium text-emerald-600">
                  +{tech.growth_percent}% growth
                </p>
              </div>
              <span className="mt-1 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-ink/60 transition group-hover:border-brand group-hover:text-brand">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/technologies"
            className="inline-flex rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-ink hover:border-brand hover:text-brand"
          >
            {content.datasets_cta}
          </Link>
        </div>
      </div>
    </section>
  )
}
