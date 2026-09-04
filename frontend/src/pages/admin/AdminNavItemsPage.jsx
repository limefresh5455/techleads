import { useState, useEffect } from 'react'
import { Navigation, Plus, Edit, Trash2, X, Save } from 'lucide-react'
import { adminNavItems } from '../../services'

export default function AdminNavItemsPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [formData, setFormData] = useState({ label: '', href: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      const data = await adminNavItems.getAll()
      setLinks(data || [])
    } catch (err) {
      console.error('Failed to load nav items:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenNew = () => {
    setFormData({ label: '', href: '' })
    setIsEditing(false)
    setCurrentId(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (link) => {
    setFormData({ label: link.label, href: link.href })
    setIsEditing(true)
    setCurrentId(link.id)
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
        await adminNavItems.update(currentId, {
          label: formData.label,
        })
      } else {
        await adminNavItems.create(formData)
      }
      await loadLinks()
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to save nav item:', err)
      alert('Error saving nav item.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this nav item?')) return
    try {
      await adminNavItems.delete(id)
      await loadLinks()
    } catch (err) {
      console.error('Failed to delete nav item:', err)
      alert('Error deleting nav item.')
    }
  }

  if (loading) return <div className="p-8 text-ink">Loading...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Navigation className="text-brand-dark shrink-0" />
          <span className="whitespace-nowrap">Nav Items</span>
        </h1>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 w-fit bg-brand text-on-brand px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors"
        >
          <Plus size={16} /> New Item
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-ink">Label</th>
                <th className="px-6 py-4 font-semibold text-ink">URL (href)</th>
                <th className="px-6 py-4 font-semibold text-ink text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {links.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted">
                    No nav items found.
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-6 py-4 text-ink font-medium">{link.label}</td>
                    <td className="px-6 py-4 text-muted font-mono text-xs">{link.href}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(link)}
                          className="p-2 text-ink/70 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <Navigation className="text-brand-dark" />
                {isEditing ? 'Edit Nav Item' : 'New Nav Item'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 text-muted hover:text-ink hover:bg-canvas rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Label</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-4 py-2.5 text-ink focus:outline-none focus:border-brand"
                  placeholder="e.g. Products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">URL (href)</label>
                <input
                  type="text"
                  required
                  disabled={isEditing}
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-brand ${
                    isEditing
                      ? 'bg-canvas/50 border-border/50 text-muted cursor-not-allowed'
                      : 'bg-canvas border-border text-ink'
                  }`}
                  placeholder="e.g. /products"
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
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-on-brand bg-brand hover:bg-brand/90 disabled:opacity-50 transition-colors"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
