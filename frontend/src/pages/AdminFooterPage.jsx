import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, Edit, X , LayoutTemplate } from 'lucide-react'
import { adminFooterColumns } from '../adminApi'

export default function AdminFooterPage() {
  const [columns, setColumns] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', links: [] })

  useEffect(() => {
    fetchColumns()
  }, [])

  const fetchColumns = async () => {
    try {
      const res = await adminFooterColumns.getAll()
      setColumns(res)
    } catch (error) {
      console.error('Failed to fetch footer columns', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (col = null) => {
    if (col) {
      setEditingId(col.id)
      setFormData({
        title: col.title,
        links: col.links?.map(link => ({ ...link })) || []
      })
    } else {
      setEditingId('new')
      setFormData({ title: '', links: [] })
    }
    setIsModalOpen(true)
  }

  const addLink = () => {
    setFormData({
      ...formData,
      links: [...formData.links, { label: '', href: '/' }]
    })
  }

  const updateLink = (index, field, value) => {
    const newLinks = [...formData.links]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setFormData({ ...formData, links: newLinks })
  }

  const removeLink = (index) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title) return alert('Title is required')
    try {
      if (editingId === 'new') {
        await adminFooterColumns.create(formData)
      } else {
        await adminFooterColumns.update(editingId, formData)
      }
      setIsModalOpen(false)
      fetchColumns()
    } catch (error) {
      console.error('Failed to save column', error)
      alert('Failed to save column. Check console for details.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this column?')) return
    try {
      await adminFooterColumns.delete(id)
      fetchColumns()
    } catch (error) {
      console.error('Failed to delete column', error)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <LayoutTemplate className="text-brand" />
            Footer Settings
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-on-brand px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand/90"
        >
          <Plus size={16} /> Add Column
        </button>
      </div>

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Column</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Routes</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {columns.map(col => (
                <tr key={col.id} className="hover:bg-canvas/50">
                  <td className="p-4">
                    <div className="font-medium text-ink">{col.title}</div>
                    {col.links && col.links.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {col.links.map(link => (
                          <span key={link.id} className="text-xs bg-canvas px-2 py-1 rounded text-ink border border-border">
                            {link.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-muted">
                    {col.links?.length || 0} links
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(col)}
                       className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(col.id)}
                      className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {columns.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-muted">No Footer Columns found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-ink">
                {editingId === 'new' ? 'Add Column' : 'Edit Column'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Column Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="e.g. Products, Resources..."
                  />
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-border shrink-0">
                    <label className="block text-sm font-medium text-ink">Footer Links</label>
                    <button
                      type="button"
                      onClick={addLink}
                      className="text-sm text-brand hover:text-brand-dark font-medium flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Route
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.links.map((link, index) => (
                      <div key={index} className="flex gap-3 items-center bg-canvas p-3 rounded-lg border border-border">
                        <GripVertical className="h-5 w-5 text-muted cursor-grab" />
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              required
                              value={link.label}
                              onChange={(e) => updateLink(index, 'label', e.target.value)}
                              placeholder="Link Label (e.g. Privacy Policy)"
                              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              required
                              value={link.href}
                              onChange={(e) => updateLink(index, 'href', e.target.value)}
                              placeholder="URL / Route (e.g. /privacy)"
                              disabled={!!link.id} // Disable href if link is already created (has id)
                              className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLink(index)}
                          className="p-1.5 text-muted hover:text-red-500 transition-colors"
                          title="Remove link"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.links.length === 0 && (
                      <div className="text-center py-6 bg-canvas border border-dashed border-border rounded-lg text-muted text-sm">
                        No links added yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-muted hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand text-on-brand rounded-lg text-sm font-semibold hover:bg-brand/90"
                >
                  Save Column
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
