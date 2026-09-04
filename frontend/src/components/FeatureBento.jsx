import { Icon } from './icons'

export default function FeatureBento({ content, features = [] }) {
  if (!content) return null

  const hero = features.find((f) => f.variant === 'hero')
  const cards = features.filter((f) => f.variant === 'card')
  const banner = features.find((f) => f.variant === 'banner')

  return (
    <section className="bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand">
            {content.features_eyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            {content.features_title}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">
            From a single URL lookup to bulk enrichment of thousands of domains — one platform for
            all your tech intelligence.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {hero && (
            <div className="brand-panel card-hover rounded-2xl p-7 text-ink lg:col-span-2 lg:row-span-2">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-ink/10">
                <Icon name={hero.icon} className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-2xl font-bold">{hero.title}</h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink/75">
                {hero.description}
              </p>
              <div className="mt-8 flex flex-wrap gap-2">
                {(typeof hero.tags === 'string'
                  ? hero.tags.split(',').filter(Boolean)
                  : hero.tags || []
                ).map((tag) => (
                  <span key={tag} className="rounded-full bg-ink/10 px-3 py-1 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cards.map((card) => (
            <div key={card.id} className="card-hover rounded-2xl border border-border bg-card p-6">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand">
                <Icon name={card.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{card.title}</h3>
              <p className="mt-2 text-sm text-muted">{card.description}</p>
            </div>
          ))}

          {banner && (
            <div className="rounded-2xl bg-inverse p-7 text-white lg:col-span-3">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">{banner.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-white/70">{banner.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
