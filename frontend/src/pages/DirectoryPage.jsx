import PageHero from '../components/PageHero'
import { Icon, formatCount } from '../components/icons'
import { useSiteData } from '../context/SiteDataContext'

export default function DirectoryPage() {
  const { data } = useSiteData()
  const technologies = data.technologies || []
  const categories = data.categories || []

  return (
    <>
      <PageHero
        title="Directory"
        subtitle="Browse websites and technologies detected by TechLeads.Ai."
        ctaLabel="Start for free"
        ctaTo="/get-started"
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <h2 className="text-xl font-bold text-ink">Categories</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-border bg-surface p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <Icon name={cat.icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold text-ink">{cat.name}</p>
                  <p className="text-xs text-muted">{formatCount(cat.item_count)} items</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-xl font-bold text-ink">Technologies</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech) => (
            <div key={tech.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-10 w-10 place-items-center rounded-lg"
                  style={{ backgroundColor: `${tech.icon_color}22` }}
                >
                  <Icon name={tech.icon} className="h-5 w-5" style={{ color: tech.icon_color }} />
                </span>
                <div>
                  <p className="font-semibold text-ink">{tech.name}</p>
                  <p className="text-xs text-muted">{formatCount(tech.website_count)} websites</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
