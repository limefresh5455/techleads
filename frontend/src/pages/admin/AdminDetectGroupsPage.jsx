import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, X, Loader2, ListTree, GripVertical } from 'lucide-react'
import { adminDetectGroups } from '../../services'

export default function AdminDetectGroupsPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ title: '', theme: 'orange', sort_order: 0, tags: [] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const data = await adminDetectGroups.getAll()
      setGroups(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenNew = () => {
    setFormData({ title: '', theme: 'orange', sort_order: 0, tags: [] })
    setEditingId('new')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (group) => {
    setFormData({
      title: group.title,
      theme: group.theme,
      sort_order: group.sort_order,
      tags: group.tags ? group.tags.map((t) => ({ ...t })) : [],
    })
    setEditingId(group.id)
    setIsModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId === 'new') {
        await adminDetectGroups.create(formData)
      } else {
        await adminDetectGroups.update(editingId, formData)
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
    if (
      !window.confirm(
        'Are you sure you want to delete this group? All nested tags will be deleted.'
      )
    )
      return
    try {
      await adminDetectGroups.delete(id)
      fetchData()
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const addTag = () => {
    setFormData({
      ...formData,
      tags: [...formData.tags, { label: '' }],
    })
  }

  const updateTag = (index, field, value) => {
    const newTags = [...formData.tags]
    newTags[index][field] = value
    setFormData({ ...formData, tags: newTags })
  }

  const removeTag = (index) => {
    const newTags = [...formData.tags]
    newTags.splice(index, 1)
    setFormData({ ...formData, tags: newTags })
  }

  if (loading && groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <h1 className="text-xl sm:text-2xl font-bold text-ink flex items-center gap-3">
          <ListTree className="text-brand-dark shrink-0" />
          <span>Detect Groups</span>
        </h1>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 bg-brand text-on-brand px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors shrink-0"
        >
          <Plus size={18} />
          Add Group
        </button>
      </div>

      {error && <div className="bg-red-500/10 text-red-600 p-4 rounded-lg text-sm">{error}</div>}

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-canvas border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold text-ink">Group Title</th>
                <th className="px-6 py-4 font-semibold text-ink">Tags Count</th>
                <th className="px-6 py-4 font-semibold text-ink text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-canvas/50 transition-colors">
                  <td className="px-6 py-4 text-ink font-medium">{group.title}</td>
                  <td className="px-6 py-4 text-muted">{group.tags?.length || 0}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(group)}
                        className="p-2 text-ink/60 hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted">
                    No Detect Groups found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl border border-border flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <ListTree className="text-brand-dark" size={24} />
                {editingId === 'new' ? 'Add Group' : 'Edit Group'}
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
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">Group Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-canvas border border-border rounded-lg px-4 py-2 text-ink focus:outline-none focus:border-brand"
                      placeholder="e.g. Analytics"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-border shrink-0">
                    <label className="block text-sm font-medium text-ink">Detect Tags</label>
                    <button
                      type="button"
                      onClick={addTag}
                      className="text-sm text-brand hover:text-brand-dark font-medium flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Add Tag
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.tags.map((tag, index) => (
                      <div
                        key={index}
                        className="flex gap-3 items-center bg-canvas p-3 rounded-lg border border-border"
                      >
                        <GripVertical className="h-5 w-5 text-muted cursor-grab shrink-0" />
                        <div className="flex-1">
                          <input
                            type="text"
                            required
                            value={tag.label}
                            onChange={(e) => updateTag(index, 'label', e.target.value)}
                            placeholder="Tag Label (e.g. Google Analytics)"
                            className="w-full bg-surface border border-border rounded px-3 py-1.5 text-sm text-ink focus:outline-none focus:border-brand"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-1.5 text-muted hover:text-red-500 transition-colors shrink-0"
                          title="Remove tag"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.tags.length === 0 && (
                      <div className="text-center py-6 bg-canvas border border-dashed border-border rounded-lg text-muted text-sm">
                        No tags added yet.
                      </div>
                    )}
                  </div>
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
                  {editingId === 'new' ? 'Create Group' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
