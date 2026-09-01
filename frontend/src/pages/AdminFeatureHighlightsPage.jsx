import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X , Sparkles } from 'lucide-react'
import { adminFeatureHighlights } from '../adminApi'

export default function AdminFeatureHighlightsPage() {
  const [highlights, setHighlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  
  const defaultForm = { 
    title: '', 
    description: '', 
    icon: 'sparkles', 
    variant: 'card', 
    tags: '' 
  }
  const [formData, setFormData] = useState(defaultForm)

  useEffect(() => {
    fetchHighlights()
  }, [])

  const fetchHighlights = async () => {
    try {
      const res = await adminFeatureHighlights.getAll()
      setHighlights(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData(item)
    } else {
      setEditingItem(null)
      setFormData(defaultForm)
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingItem) {
        await adminFeatureHighlights.update(editingItem.id, formData)
      } else {
        await adminFeatureHighlights.create(formData)
      }
      setIsModalOpen(false)
      fetchHighlights()
    } catch (err) {
      alert("Error saving feature highlight")
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this feature highlight?')) return
    try {
      await adminFeatureHighlights.delete(id)
      fetchHighlights()
    } catch (err) {
      alert("Error deleting feature highlight")
    }
  }

  if (loading) return <div className="p-8 text-ink">Loading...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <Sparkles className="text-brand" />
            Feature Highlights
          </h1>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-ink px-4 py-2 rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          <Plus size={16} /> Add Highlight
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-x-auto"><table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border text-muted">
              <tr>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Variant</th>
                <th className="p-4 font-medium">Icon</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {highlights.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted">
                    No feature highlights found.
                  </td>
                </tr>
              ) : (
                highlights.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="p-4 font-medium text-ink">{item.title}</td>
                    <td className="p-4 text-muted capitalize">{item.variant}</td>
                    <td className="p-4 text-muted">{item.icon}</td>
                    <td className="p-4 flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(item)}
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">
                {editingItem ? 'Edit Highlight' : 'Add Highlight'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Description</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Icon Name</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    />
                    <p className="text-xs text-muted mt-1">Lucide icon name (e.g., sparkles)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Variant</label>
                    <select
                      value={formData.variant}
                      onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    >
                      <option value="hero">Hero</option>
                      <option value="card">Card</option>
                      <option value="banner">Banner</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="Comma separated tags"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-border bg-canvas shrink-0 flex justify-end gap-3 rounded-b-xl">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-muted hover:text-ink transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand text-ink rounded-lg font-medium hover:bg-brand/90 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}



