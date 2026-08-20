import { Link } from 'react-router-dom'
import { Icon, formatCount } from './icons'

export default function Categories({ categories = [], content, showHeader = true }) {
  if (!content) return null

  return (
    <section id="resources" className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        {showHeader && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              {content.categories_title}
            </h2>
            <p className="mt-3 text-muted">{content.categories_subtitle}</p>
          </div>
        )}

        <div className={`${showHeader ? 'mt-10' : ''} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to="/categories"
              className="card-hover flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon name={cat.icon} className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink">{cat.name}</h3>
                <p className="text-sm text-muted">{formatCount(cat.item_count)} technologies</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
