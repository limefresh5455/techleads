import { useState, useEffect } from 'react'
import { Trash2, X, Loader2, Globe, Search, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { adminTechnologies, adminCategories } from '../../services'

export default function AdminTechnologiesPage() {
  const [items, setItems] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: 'globe',
    icon_color: '#FF6B35',
    category_id: '',
    is_featured: true,
    is_popular: false,
    sort_order: 0,
    website_count: 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [page, search])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [techData, catData] = await Promise.all([
        adminTechnologies.getAll({ page, limit, search }),
        adminCategories.getAll({ page: 1, limit: 1000 }),
      ])
      setItems(techData.items || [])
      setTotal(techData.total || 0)
      setTotalPages(techData.total_pages || 1)
      setCategories(catData.items || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleOpenView = (item) => {
    setFormData({
      name: item.name,
      slug: item.slug,
      icon: item.icon,
      icon_color: item.icon_color,
      category_id: item.category_id || '',
      is_featured: item.is_featured,
      is_popular: item.is_popular,
      sort_order: item.sort_order,
      website_count: item.website_count,
    })
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technology?')) return
    try {
      await adminTechnologies.delete(id)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Globe className="text-brand-dark shrink-0" />
          <span className="whitespace-nowrap">Technologies</span>
        </h1>
      </div>

      {error && <div className="bg-red-500/10 text-red-600 p-4 rounded-lg text-sm">{error}</div>}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search technologies..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-ink focus:outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-surface border border-border text-ink rounded-lg hover:bg-border/50"
        >
          Search
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-ink">Name</th>
                <th className="px-6 py-4 font-semibold text-ink">Category</th>
                <th className="px-6 py-4 font-semibold text-ink">Sites</th>
                <th className="px-6 py-4 font-semibold text-ink text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => {
                const category = categories.find((c) => c.id === item.category_id)
                return (
                  <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-4 text-ink font-medium flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.icon_color || '#FF6B35' }}
                      ></span>
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-muted">{category ? category.name : 'None'}</td>
                    <td className="px-6 py-4 text-muted">{item.website_count}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted">
                    No Technologies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-canvas">
            <span className="text-sm text-muted">
              Showing page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 border border-border rounded-lg hover:bg-surface disabled:opacity-50 text-ink"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 border border-border rounded-lg hover:bg-surface disabled:opacity-50 text-ink"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Globe className="text-brand-dark" size={24} />
                Technology Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Name</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.name}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand opacity-80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Slug</label>
                    <input
                      type="text"
                      readOnly
                      value={formData.slug}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand opacity-80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Icon (Lucide name)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.icon}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand opacity-80"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Icon Color (Hex)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.icon_color}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand opacity-80"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Category</label>
                  <input
                    type="text"
                    readOnly
                    value={categories.find((c) => c.id === formData.category_id)?.name || 'None'}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand opacity-80"
                  />
                </div>

                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm text-ink cursor-pointer opacity-80 pointer-events-none">
                    <input
                      type="checkbox"
                      readOnly
                      checked={formData.is_featured}
                      className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm text-ink cursor-pointer opacity-80 pointer-events-none">
                    <input
                      type="checkbox"
                      readOnly
                      checked={formData.is_popular}
                      className="w-4 h-4 rounded border-border text-brand focus:ring-brand"
                    />
                    Popular
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0 bg-canvas">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-ink bg-surface border border-border rounded-lg hover:bg-border/50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
