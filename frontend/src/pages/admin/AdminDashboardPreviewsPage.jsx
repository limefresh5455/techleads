import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, Edit, X, LayoutDashboard } from 'lucide-react'
import { adminDashboardPreviews } from '../../services'

export default function AdminDashboardPreviewsPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

  const [formData, setFormData] = useState({
    domain: '',
    categories: '',
    technologies: '',
    country: '',
    traffic: '',
    ads: '',
    sort_order: 0,
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const data = await adminDashboardPreviews.getAll()
      setItems(data)
    } catch (error) {
      console.error('Failed to fetch dashboard previews:', error)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        domain: item.domain,
        categories: item.categories || '',
        technologies: item.technologies || '',
        country: item.country || '',
        traffic: item.traffic,
        ads: item.ads || '',
        sort_order: item.sort_order || 0,
      })
    } else {
      setEditingItem(null)
      setFormData({
        domain: '',
        categories: '',
        technologies: '',
        country: '',
        traffic: '',
        ads: '',
        sort_order: 0,
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingItem(null)
  }

  const handleSave = async () => {
    try {
      if (editingItem) {
        await adminDashboardPreviews.update(editingItem.id, formData)
      } else {
        await adminDashboardPreviews.create(formData)
      }
      closeModal()
      fetchItems()
    } catch (error) {
      console.error('Failed to save dashboard preview:', error)
      alert('Failed to save. Check console for details.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this preview?')) return
    try {
      await adminDashboardPreviews.delete(id)
      fetchItems()
    } catch (error) {
      console.error('Failed to delete preview:', error)
      alert('Failed to delete. Check console for details.')
    }
  }

  if (loading) return <div className="p-8 text-ink">Loading...</div>

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-ink flex items-center gap-3">
            <LayoutDashboard className="text-brand-dark" />
            Dashboard Previews
          </h1>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-brand text-ink rounded-lg font-medium hover:bg-brand/90 transition-colors"
        >
          <Plus size={16} />
          <span>Add Preview</span>
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-left text-sm text-ink">
          <thead className="bg-canvas border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Domain</th>
              <th className="px-6 py-4 font-medium">Traffic</th>
              <th className="px-6 py-4 font-medium">Categories</th>
              <th className="px-6 py-4 font-medium">Technologies</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-canvas/50 transition-colors">
                <td className="px-6 py-4 font-medium">{item.domain}</td>
                <td className="px-6 py-4">{item.traffic}</td>
                <td className="px-6 py-4 text-ink/70">{item.categories}</td>
                <td className="px-6 py-4 text-ink/70">{item.technologies}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openModal(item)}
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
                <td colSpan="6" className="px-6 py-8 text-center text-ink/60">
                  No preview entries found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-2xl rounded-xl border border-border shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-ink flex items-center gap-2">
                <LayoutDashboard size={24} className="text-brand-dark" />
                {editingItem ? 'Edit Dashboard Preview' : 'Add Dashboard Preview'}
              </h2>
              <button onClick={closeModal} className="text-ink/60 hover:text-ink transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Domain *</label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Traffic *</label>
                  <input
                    type="text"
                    value={formData.traffic}
                    onChange={(e) => setFormData({ ...formData, traffic: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="e.g. High, 5M+, etc."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Categories</label>
                <input
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  placeholder="e.g. E-commerce, SaaS"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-ink">Technologies</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  placeholder="e.g. React, Stripe, Tailwind"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Country</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                    placeholder="US, UK, etc."
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-ink">Ads</label>
                  <select
                    value={formData.ads}
                    onChange={(e) => setFormData({ ...formData, ads: e.target.value })}
                    className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                  >
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 bg-canvas/50 mt-auto">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-ink/70 hover:text-ink font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-brand text-ink rounded-lg font-medium hover:bg-brand/90 transition-colors"
              >
                <Save size={16} />
                <span>Save Preview</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
