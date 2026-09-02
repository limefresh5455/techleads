import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Loader2, Folder, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { adminCategories } from '../adminApi'

export default function AdminCategoriesPage() {
  const [items, setItems] = useState([])
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
  const [formData, setFormData] = useState({ name: '', slug: '', icon: 'folder', sort_order: 0, item_count: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [page, search])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await adminCategories.getAll({ page, limit, search })
      setItems(data.items || [])
      setTotal(data.total || 0)
      setTotalPages(data.total_pages || 1)
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

  const handleOpenNew = () => {
    setFormData({ name: '', slug: '', icon: 'folder', sort_order: 0, item_count: 0 })
    setEditingId('new')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setFormData({
      name: item.name,
      slug: item.slug,
      icon: item.icon,
      sort_order: item.sort_order,
      item_count: item.item_count
    })
    setEditingId(item.id)
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId === 'new') {
        await adminCategories.create(formData)
      } else {
        await adminCategories.update(editingId, formData)
      }
      setIsModalOpen(false)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return
    try {
      await adminCategories.delete(id)
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
          <Folder className="text-brand-dark shrink-0" />
          <span className="whitespace-nowrap">Categories</span>
        </h1>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 w-fit bg-brand text-on-brand px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2 text-ink focus:outline-none focus:border-brand"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-surface border border-border text-ink rounded-lg hover:bg-border/50">
          Search
        </button>
      </form>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-ink">Name</th>
                <th className="px-6 py-4 font-semibold text-ink">Slug</th>
                <th className="px-6 py-4 font-semibold text-ink">Item Count</th>
                <th className="px-6 py-4 font-semibold text-ink text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-6 py-4 text-ink font-medium">{item.name}</td>
                  <td className="px-6 py-4 text-muted">{item.slug}</td>
                  <td className="px-6 py-4 text-muted">{item.item_count}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
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
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted">No Categories found.</td>
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
                onClick={() => setPage(p => p - 1)}
                className="p-2 border border-border rounded-lg hover:bg-surface disabled:opacity-50 text-ink"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
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
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Folder className="text-brand-dark" />
                {editingId === 'new' ? 'Add Category' : 'Edit Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="e.g. Analytics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="e.g. analytics"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Icon (Lucide name)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="e.g. folder"
                  />
                </div>

              </div>

              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0 bg-canvas">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-ink bg-surface border border-border rounded-lg hover:bg-border/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-brand bg-brand rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingId === 'new' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


