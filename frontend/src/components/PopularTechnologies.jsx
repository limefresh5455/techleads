import { Link } from 'react-router-dom'
import { Icon, formatCount } from './icons'

export default function PopularTechnologies({ content, technologies = [] }) {
  if (!content) return null

  return (
    <section className="bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">{content.popular_eyebrow}</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {content.popular_title}
          </h2>
          <p className="mt-2 text-muted">Browse websites by the technologies they use</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {technologies.map((tech) => (
            <Link
              key={tech.id}
              to="/directory"
              className="card-hover rounded-xl border border-border bg-card px-4 py-4"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-lg"
                style={{ backgroundColor: `${tech.icon_color}22` }}
              >
                <Icon name={tech.icon} className="h-5 w-5" style={{ color: tech.icon_color }} />
              </span>
              <p className="mt-3 text-sm font-semibold text-ink">{tech.name}</p>
              <p className="mt-1 text-xs text-muted">{formatCount(tech.website_count)}+ sites</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
