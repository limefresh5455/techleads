import { useState, useMemo } from 'react'
import { PageHero } from '../../components'
import { Icon, formatCount } from '../../components'
import { useSiteData } from '../../context/SiteDataContext'
import { Pagination } from '../../components'
import { usePagination } from '../../utils/pagination'
import { ITEMS_PER_PAGE, GRID_COLUMNS } from '../../constants'

export default function DirectoryPage() {
  const { data } = useSiteData()
  const technologies = data.technologies || []

  const [techSearch, setTechSearch] = useState('')

  const filteredTechnologies = useMemo(() => {
    if (!techSearch) return technologies
    return technologies.filter((t) => t.name.toLowerCase().includes(techSearch.toLowerCase()))
  }, [technologies, techSearch])

  const technologiesPagination = usePagination(filteredTechnologies, ITEMS_PER_PAGE)

  const gridColumnsClass =
    {
      1: 'lg:grid-cols-1',
      2: 'lg:grid-cols-2',
      3: 'lg:grid-cols-3',
      4: 'lg:grid-cols-4',
      5: 'lg:grid-cols-5',
      6: 'lg:grid-cols-6',
    }[GRID_COLUMNS] || 'lg:grid-cols-4'

  return (
    <>
      <PageHero
        title="Directory"
        subtitle="Browse websites and technologies detected by LeadIntel.Ai."
        ctaLabel={false}
      />
      <section className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-ink">Technologies</h2>
          <input
            type="text"
            placeholder="Search technologies..."
            value={techSearch}
            onChange={(e) => setTechSearch(e.target.value)}
            className="w-full sm:w-64 rounded-lg border border-border bg-surface px-4 py-2 text-sm text-ink placeholder-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${gridColumnsClass}`}>
          {technologiesPagination.currentData().map((tech) => (
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
        <Pagination {...technologiesPagination} />
      </section>
    </>
  )
}
