import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Icon, formatCount } from './icons'
import Pagination from './Pagination'
import { usePagination } from '../utils/pagination'
import { ITEMS_PER_PAGE } from '../constants'

export default function Categories({
  categories = [],
  content,
  showHeader = true,
  enableSearch = false,
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!enableSearch || !search) return categories
    return categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
  }, [categories, search, enableSearch])

  const pagination = usePagination(filtered, ITEMS_PER_PAGE)
  const displayData = enableSearch ? pagination.currentData() : categories

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

        {enableSearch && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-ink">All Categories</h2>
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-border bg-card px-4 py-2 text-sm text-ink placeholder-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            />
          </div>
        )}

        <div
          className={`${showHeader && !enableSearch ? 'mt-10' : ''} grid gap-4 sm:grid-cols-2 lg:grid-cols-3`}
        >
          {displayData.map((cat) => (
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

        {enableSearch && (
          <div className="mt-8">
            <Pagination {...pagination} />
          </div>
        )}
      </div>
    </section>
  )
}
