import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Loader2, Blocks } from 'lucide-react'
import { adminCustomDataBlocks } from '../adminApi'

export default function AdminCustomDataBlocksPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [formData, setFormData] = useState({ title: '', description: '', sort_order: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await adminCustomDataBlocks.getAll()
      setItems(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenNew = () => {
    setFormData({ title: '', description: '', sort_order: 0 })
    setIsEditing(false)
    setCurrentId(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (item) => {
    setFormData({ 
      title: item.title, 
      description: item.description, 
      sort_order: item.sort_order 
    })
    setIsEditing(true)
    setCurrentId(item.id)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEditing) {
        await adminCustomDataBlocks.update(currentId, formData)
      } else {
        await adminCustomDataBlocks.create(formData)
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
    if (!window.confirm('Are you sure you want to delete this block?')) return
    try {
      await adminCustomDataBlocks.delete(id)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-brand" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-3">
          <Blocks className="text-brand-dark shrink-0" />
          <span>Custom Data Blocks</span>
        </h1>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 bg-brand text-on-brand px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors w-fit"
        >
          <Plus size={18} />
          Add Data Block
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-ink">Title</th>
                <th className="px-6 py-4 font-semibold text-ink">Description</th>
                <th className="px-6 py-4 font-semibold text-ink text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    No custom data blocks found. Click "Add Data Block" to create one.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-4 text-ink font-medium">{item.title}</td>
                    <td className="px-6 py-4 text-muted max-w-xs truncate">{item.description}</td>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div 
            className="bg-surface w-full max-w-md rounded-xl shadow-xl border border-border overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-canvas">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Blocks className="text-brand-dark" size={24} />
                {isEditing ? 'Edit Data Block' : 'Add Data Block'}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="text-muted hover:text-ink transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand"
                  placeholder="e.g. Total Revenue"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-ink">Description</label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-sm text-ink focus:outline-none focus:border-brand resize-none"
                  placeholder="e.g. $2.5M in Q3"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-ink bg-canvas border border-border hover:bg-border/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-brand text-on-brand px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Add Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


