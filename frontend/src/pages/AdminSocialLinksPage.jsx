import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X , Share2 } from 'lucide-react'
import { adminSocialLinks } from '../adminApi'

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLink, setEditingLink] = useState(null)
  const [formData, setFormData] = useState({ label: '', href: '', icon_key: 'twitter' })

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      const data = await adminSocialLinks.getAll()
      setLinks(data)
    } catch (err) {
      console.error('Failed to load social links:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (link = null) => {
    setEditingLink(link)
    setFormData(link || { label: '', href: '', icon_key: 'twitter' })
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      if (editingLink) {
        await adminSocialLinks.update(editingLink.id, formData)
      } else {
        await adminSocialLinks.create(formData)
      }
      setIsModalOpen(false)
      loadLinks()
    } catch (err) {
      console.error('Failed to save social link:', err)
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this social link?')) return
    try {
      await adminSocialLinks.delete(id)
      loadLinks()
    } catch (err) {
      console.error('Failed to delete social link:', err)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
          <Share2 className="text-brand" />
          Social Links
        </h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-brand text-on-brand px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand/90"
        >
          <Plus size={16} /> Add Link
        </button>
      </div>

      {loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border">
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">Label</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider">URL (href)</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider w-32">Icon Key</th>
                <th className="p-4 text-xs font-semibold text-muted uppercase tracking-wider w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {links.map(link => (
                <tr key={link.id} className="hover:bg-canvas/50">
                  <td className="p-4 font-medium text-ink">{link.label}</td>
                  <td className="p-4 text-sm text-brand break-all">{link.href}</td>
                  <td className="p-4 text-sm text-muted">{link.icon_key}</td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleOpenModal(link)}
                      className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
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
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted">No social links found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-ink">
                {editingLink ? 'Edit Social Link' : 'Add Social Link'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink/60 hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Label</label>
                <input
                  type="text"
                  required
                  value={formData.label}
                  onChange={e => setFormData({ ...formData, label: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">URL (href)</label>
                <input
                  type="url"
                  required
                  value={formData.href}
                  onChange={e => setFormData({ ...formData, href: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">Icon Key</label>
                <select
                  value={formData.icon_key}
                  onChange={e => setFormData({ ...formData, icon_key: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brand"
                >
                  <option value="twitter">Twitter / X</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="github">GitHub</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="youtube">YouTube</option>
                  <option value="globe">Website (Globe)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
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
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
